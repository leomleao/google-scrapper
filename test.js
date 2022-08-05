const cheerio = require("cheerio");
const axios = require("axios");
const csv = require('@fast-csv/parse');
const AXIOS_OPTIONS = {
    headers: {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
    },
};

const fs = require('fs');
const fileName = './test2.json';
const file = require(fileName);

file.forEach(customer => {
    // console.log(customer)  
    getTitle(customer).then(title => {
        console.log(title)
    })
});


function getTitle(row) {
    let encodedString = encodeURI(row.searchString);
    return axios
        .get(
            `https://www.google.com/search?q=${encodedString}&hl=en&gl=us`,
            AXIOS_OPTIONS
        )
        .then(function ({ data }) {
            let $ = cheerio.load(data);
            row.title = $(".SPZz6b > h2 > span").text()
            row.address = $(".LrzXr").text()
            return row
        });
}


// console.log(getOrganicResults(searchString));