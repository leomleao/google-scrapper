const cheerio = require("cheerio");
const axios = require("axios");
const bluebird = require('bluebird');
const cliProgress = require('cli-progress');

const params = {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36"
    },
    timeout: 2000
};

const customers = require('cakebase')("./test2.json");

async function getCustomers() {
    let customerList = await customers.get(obj => obj.title === '');
    b1.start(customerList.length, 0);
    return customerList
}
let customerList = getCustomers();

// customerList.forEach(customer => {
//     getTitle(customer).then((result) => {
//         customers.update(obj => obj.customer === result.customer, { title: result.title, address: result.address });
//     })
// });

const b1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

async function makeRequests (lines) {
    await bluebird.map(
        lines,
        async (line) => {
            const encodedString = encodeURI(line.searchString);
            console.info(`https://www.google.com/search?q=${encodedString}&hl=en&gl=us`)
            return axios.get(
                `https://www.google.com/search?q=${encodedString}&hl=en&gl=us`,
                params
            ).then(res => {
                b1.increment();
                const $ = cheerio.load(res.data);
                line.title = $(".SPZz6b > h2 > span").text()
                line.address = $(".LrzXr").text()
                customers.update(obj => obj.customer === line.customer, { title: line.title, address: line.address });
            })
        },
        { concurrency: 2 }
    )
}
makeRequests(customerList)

// function getTitle(row) {
//     let encodedString = encodeURI(row.searchString);
//     return axios
//         .get(
//             `https://www.google.com/search?q=${encodedString}&hl=en&gl=us`,
//             params
//         ).then(function ({ data }) {
//             let $ = cheerio.load(data);
//             row.title = $(".SPZz6b > h2 > span").text()
//             row.address = $(".LrzXr").text()
//             return row
//         });
// }



