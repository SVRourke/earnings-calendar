function buildCard (stock, earningsDate, release, eps, revenue, price, aCount, buzz, mediaSentiment, tasentiment, tasignal, isTrending) {
    //  get root
    let app = document.querySelector(".app");
    // create card
    let card = createElement('section', 'card');
    // create hero
    let hero = createHero(
        stock,
        earningsDate
    );
    // create top
    let top = createTop(
        `$${price}`,
        release,
        `eps estimate: ${eps}`,
        `rev estimate: ${revenue}`
    );
    // create bottom
    let bottom = createBottom(
        aCount,
        buzz,
        mediaSentiment,
        tasignal,
        tasentiment,
        isTrending
    );
    // create card content
    let content = createElement("div", "card-content");
    content.append(top, bottom)
    // add hero, top, bottom to card
    card.append(hero, content);
    // add card to app
    app.append(card);
}
let test = "blah";

function createHero(stock, earningsDate) {
    let hero = createElement("div", "card-hero")
    let symbol = createCompoundElement(stock, "symbol")
    let date = createCompoundElement(earningsDate, "date")
    hero.append(symbol, date)
    return hero
    }

function createTop(price, release, eps, revenue) {
    let top = createElement("div", "top")
    let quote = createCompoundElement(price, "price")
    let relTime = createCompoundElement(release, "release-time")
    let epsEst = createCompoundElement(eps, "eps-estimate")
    let revEst = createCompoundElement(revenue, "revenue-estimate")
    // add price, release-time, eps-estimate, revenue-estimate to top
    top.append(quote, relTime, epsEst, revEst)
    return top
}
function createBottom(aCount, buzz, mediaSentiment, taSentiment, taSignal, isTrending) {
    let bottom = createElement("div", "bottom")
    let articles = createCompoundElement(aCount, "articlecount")
    let mediaBuzz = createCompoundElement(buzz, "buzz")
    let sentiment = createCompoundElement(mediaSentiment, "sentiment")
    let techSentiment = createCompoundElement(taSentiment, "tasentiment")
    let techSignal = createCompoundElement(taSignal, "tasignal")
    let trending = createCompoundElement(isTrending, "istrending")
    bottom.append(articles, mediaBuzz, sentiment, techSentiment, techSignal, trending)
    return bottom
}
function createCompoundElement(textcontent, className) {
    const element = createElement("div", className);
    const subElement = createElement("p");
    subElement.textContent = textcontent;
    element.append(subElement)
    return element
}
function createElement(tag, className) {
    const element = document.createElement(tag)
    if (className) element.classList.add(className)
    return element
}
function multiFetch(earningsData){
    let edsymb = earningsData.symbol
    let token = "bp03ocnrh5r90eafo9c0"
    const urls = [
        // `https://finnhub.io/api/v1/major-development?symbol=${edsymb}&token=${token},
        `https://finnhub.io/api/v1/quote?symbol=${edsymb}&token=${token}`,
        `https://finnhub.io/api/v1/news-sentiment?symbol=${edsymb}&token=${token}`,
        `https://finnhub.io/api/v1/scan/technical-indicator?symbol=${edsymb}&resolution=M&token=${token}`
      ];
      // use map() to perform a fetch and handle the response for each url
      Promise.all(urls.map(url =>
        fetch(url)
          .then(response => {
              return response.json()
          })
      ))
      .then(data => {
        // do something with the data
        // console.log("price", data[0].c)
        // // console.log("media sentiment", data[1])
        // console.log("aCount", data[1].buzz.articlesInLastWeek)
        // console.log("aAVE", data[1].buzz.weeklyAverage)
        // console.log("buzz", data[1].buzz.buzz)
        // console.log("news sentiment bearish", data[1].sentiment.bearishPercent)
        // console.log("news sentiment bullish", data[1].sentiment.bullishPercent)
        console.log(data[2].technicalAnalysis.signal)
        console.log(data[2].technicalAnalysis.count.buy)
        console.log(data[2].technicalAnalysis.count.neutral)
        console.log(data[2].technicalAnalysis.count.sell)
        console.log(data[2].trend.trending)
        let ta = data[2].technicalAnalysis
        return {
            "price": data[0].c,
            "media_sentiment": data[1],
            "aCount": data[1].buzz.articlesInLastWeek,
            "aAVE": data[1].buzz.weeklyAverage,
            "buzz": data[1].buzz.buzz,
            "news_bearish": data[1].sentiment.bearishPercent,
            "news_bullish": data[1].sentiment.bullishPercent,
            "ta_sentiment": `B:${ta.count.buy}|${ta.count.neutral}|${ta.count.sell}:S`,
            "ta_signal": ta.signal,
            "ta_trending": data[2].trend.trending
        }
        // console.log("maj", data[0])
      })
      .then(obj => {
          buildCard (
            earningsData.symbol,
            earningsData.date,
            earningsData.hour,
            earningsData.epsEstimate,
            earningsData.revenueEstimate,
            obj.price,
            obj.aCount,
            obj.buzz,
            `B:${obj.news_bullish}|${obj.news_bearish}:S`,
            obj.ta_sentiment,
            obj.ta_signal,
            obj.ta_trending


        )
      })
}
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
async function getEarnings(){
    const dates = craftDates();
    const url = craftUrl(dates);
    let earningsResults = []

    fetch(url)
    .then (response => {
        sleep(1000)
        console.log("fetched");
        return response.json();
    })
    .then (json => {
        let data = json.earningsCalendar;
        console.log("parsing");
        return data
    })
    .then(data => {
        console.log("results: ", Object.keys(data).length); 
        data.forEach(element => {
            // console.log(element)
            multiFetch(element)
            
        });
    })

}

function craftUrl(dates){
    const token ="bp03ocnrh5r90eafo9c0"
    const preamble = "https://finnhub.io/api/v1/calendar/earnings"
    return `${preamble}?from=${dates[0]}&to=${dates[1]}&token=${token}`;
}

function craftDates(){
    // 2020-05-10
    let date1 = new Date()
    let date2 = new Date()
    date2.setDate(date2.getDate() + 7)
    dates = [
        `${date1.getFullYear()}-${date1.getMonth()}-${date1.getDate()}`,
        `${date2.getFullYear()}-${date2.getMonth()}-${date2.getDate()}`
    ]
    return dates
}

async function getData(){
    let tday = craftDates();
    let urllink = craftUrl(tday)
    // console.log(tday)
    console.log(urllink)
    const data = await getEarnings(urllink)
    return(data)
}
/*
stock
earningsDate
price
release (tod)
eps (est)
revenue (estimate)
aCount (ave vs actual)
buzz
mediaSentiment
taSentiment
tasignal
istrending

*/
// date: "2020-04-17"
// epsActual: 0.49
// epsEstimate: 0.54
// hour: "bmo"
// quarter: 1
// revenueActual: 17789000
// revenueEstimate: 17230000
// symbol: "UNTY"
// year: 2020