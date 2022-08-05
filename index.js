const cheerio = require("cheerio");
const bluebird = require('bluebird');
const cliProgress = require('cli-progress');
const customers = require('cakebase')("./data.json");
const found = require('cakebase')("./found.json");
const puppeteer = require('puppeteer');

const fs = require('fs');

const cookiesString = fs.readFileSync('./cookies.json');
const cookies = JSON.parse(cookiesString);

async function getCustomers() {
    let customerList = await customers.get(obj => obj.title === '');
    b1.start(customerList.length, 0);
    return customerList
}
let customerList = getCustomers();

const b1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

async function makeRequests(lines) {
    // const browser = await puppeteer.launch({headless: false});
    const browser = await puppeteer.launch();
    await bluebird.map(
        lines,
        async (line) => {
            let alreadyDone = await found.get(obj => obj.customer === line.customer);
            if (alreadyDone.length == 0) {
                const encodedString = encodeURI(line.searchString);
                // console.info(`https://www.google.com/search?q=${encodedString}&hl=en&gl=us`)
                console.info("Opening new page for: " + line.name1)
                const page = await browser.newPage();
                await page.setCookie(...cookies);
                await page.goto(`https://www.google.com/search?q=${encodedString}&hl=en&gl=us`, { waitUntil: 'networkidle2' });
                var HTML = await page.content()
                    .then(res => {
                        if (res.includes("Our systems have detected unusual traffic from your computer network.")) {
                            console.error("Problem!!!")
                        }
                        console.info("Got response for: " + line.name1)
                        b1.increment();
                        const $ = cheerio.load(res);

                        // // test = $('br:contains("Our systems have detected unusual traffic from your computer network.  This page checks to see if it\'s really you sending the requests, and not a robot.")')
                        test = $("#result-stats")
                        if (test.text()) {
                            console.info("No info")
                            line.title = test.text()
                            line.address = "Could not be found."
                        }
                        ($(".SPZz6b > h2 > span").text()) ? line.title = $(".SPZz6b > h2 > span").text() :
                            
                        ($(".LrzXr").text()) ? line.address = $(".LrzXr").text() :

                        console.info("Found title : " + line.title)
                        console.info("Found address : " + line.address)
                        // customers.update(obj => obj.customer === line.customer, { title: line.title, address: line.address });
                        // customers.update(obj => obj.customer === line.customer, { title: line.title, address: line.address });
                        if (line.title) {
                            found.set(line);
                        }
                        page.close()
                    })
            }
        },
        { concurrency: 5 }
    )
}
makeRequests(customerList)



