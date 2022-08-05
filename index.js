const cheerio = require("cheerio");
const bluebird = require('bluebird');
const cliProgress = require('cli-progress');
const customers = require('cakebase')("./data.json");
const found = require('cakebase')("./found.json");
// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
    RecaptchaPlugin({
        provider: { id: '2captcha', token: '4799de856cc706c3224a61d9ada08d7a' },
        visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
)

const fs = require('fs');

const cookiesString = fs.readFileSync('./cookies.json');
const cookies = JSON.parse(cookiesString);

async function getCustomers() {
    let customerList = await customers.get(obj => obj.title === '');
    console.info(customerList.length)
    b1.start(customerList.length, 0);
    return customerList
}
let customerList = getCustomers();

const b1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

async function makeRequests(lines) {
    // const browser = await puppeteer.launch({headless: false});
    // const initialPage = await browser.newPage(); 

    // await initialPage.goto("https://www.google.com/", { waitUntil: 'networkidle2' });

    // await initialPage.click("#L2AGLb")
    // await initialPage.waitForNavigation()
    // const browser = await puppeteer.launch();

    // const browser = await puppeteer.launch({ headless: false });
    // const initialPage = await browser.newPage();
    // // await page.setCookie(...cookies);
    // // console.info(`https://www.google.com/search?q=${encodedString}&hl=en&gl=us`)
    // await initialPage.goto(`https://www.google.com/search?q=INVERTEK%20DRIVES%20LTD%20OFFA'S%20DYKE%20BUSINESS%20PARK&hl=en&gl=us`, { waitUntil: 'networkidle2' });
    // const content = await initialPage.content()
    // if (content.includes("Our systems have detected unusual traffic from your computer network.")) {
    //     console.info("captcha present")
    //     await initialPage.solveRecaptchas()
    //     await Promise.all([
    //         initialPage.waitForNavigation()
    //     ])
    // }
    await bluebird.map(
        lines,
        async (line) => {
            let alreadyDone = await found.get(obj => obj.customer === line.customer);
            if (alreadyDone.length == 0) {
                const encodedString = encodeURI(line.searchString);
                // console.info(`https://www.google.com/search?q=${encodedString}&hl=en&gl=us`)
                console.info(line.customer + ": Opening new page for: " + line.name1)
                const browser = await puppeteer.launch({ headless: false });

                const page = await browser.newPage();
                // await page.setCookie(...cookies);
                console.info(`https://www.google.com/search?q=${encodedString}&hl=en&gl=us`)
                await page.goto(`https://www.google.com/search?q=${encodedString}&hl=en&gl=us`, { waitUntil: 'networkidle2' });
                const content = await page.content()
                if (content.includes("Our systems have detected unusual traffic from your computer network.")) {
                    console.info("captcha still present")
                    // await page.solveRecaptchas()
                    // await Promise.all([
                    //     page.waitForNavigation()
                    // ])
                    
                    await page.waitForTimeout(5000);
                    for (var i = 0; i < 50; i++) {
                        const content = await page.content()
                        if (content.includes("Our systems have detected unusual traffic from your computer network.")) {
                            await page.waitForTimeout(1000);
                        }
                    }
                }
                
                
                await page.click("#L2AGLb")
                await page.waitForNavigation()
                var HTML = await page.content()
                    .then(async res => {
                        if (res.includes("Our systems have detected unusual traffic from your computer network.")) {
                            console.error("Problem!!!")
                            // await page.solveRecaptchas()
                            // await Promise.all([
                            //     page.waitForNavigation(),
                            //     page.click(`#recaptcha-demo-submit`)
                            // ])
                        }
                        console.info(line.customer + ": Got response for: " + line.name1)
                        b1.increment();
                        const $ = cheerio.load(res);

                        // // test = $('br:contains("Our systems have detected unusual traffic from your computer network.  This page checks to see if it\'s really you sending the requests, and not a robot.")')
                        test = $("#result-stats")
                        if (test.text() && $(".SPZz6b > h2 > span").text() == '') {
                            console.info(line.customer + ": No info")
                            line.title = test.text()
                            line.address = "Could not be found."
                        } else {
                            line.title = $(".SPZz6b > h2 > span").text()
                            line.address = $(".LrzXr").text()
                        }

                        console.info(line.customer + ": Found title : " + line.title)
                        console.info(line.customer + ": Found address : " + line.address)
                        // customers.update(obj => obj.customer === line.customer, { title: line.title, address: line.address });
                        // customers.update(obj => obj.customer === line.customer, { title: line.title, address: line.address });
                        if (line.title) {
                            found.set(line);
                        }

                    }).then(() => {
                        page.close()
                        browser.close()
                    })
            }
        },
        { concurrency: 1 }
    )
}
makeRequests(customerList)



