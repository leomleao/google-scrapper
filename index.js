const cheerio = require("cheerio");
const axios = require("axios");
const csv = require('@fast-csv/parse');
const AXIOS_OPTIONS = {
    headers: {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
    },
};

var dataArr = [];

csv.parseFile('./data.csv', { headers: true })
    .on('error', error => console.error(error))
    .on('data', row => getTitle(row))
    .on('end', rowCount => {});

function getTitle(row) {
    let encodedString = encodeURI(row.searchString);
    return axios
        .get(
            `https://www.google.com/search?q=${encodedString}&hl=en&gl=us`,
            AXIOS_OPTIONS
        )
        .then(function ({ data }) {
            let $ = cheerio.load(data);
            let title = $(".SPZz6b > h2 > span").text();
            console.info(row.customer + " " + title)
        });
}


// console.log(getOrganicResults(searchString));