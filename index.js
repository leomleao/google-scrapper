const cheerio = require("cheerio");
const axios = require("axios");

const params = {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36"
    },
};

const customers = require('cakebase')("./test.json");

async function Hello() {
    let customerList = await customers.get(obj => obj.title === '');
    customerList.forEach(customer => {
        getTitle(customer).then((result) => {
            users.update(obj => obj.customer === result.customer, { title: result.title, address: result.address });
        })
    });
}

Hello();

// let newFile = file.map(customer =>{
//     return getTitle(customer).then(test => {
//         // return test
//     })
// })

// Promise.all(newFile).then(completed => {
//     fs.writeFile(fileName, JSON.stringify(completed, null, 2), function writeJSON(err) {
//         if (err) return console.log(err);
//     });
// })

function getTitle(row) {
    let encodedString = encodeURI(row.searchString);
    return axios
        .get(
            `https://www.google.com/search?q=${encodedString}&hl=en&gl=us`,
            params
        ).then(function ({ data }) {
            let $ = cheerio.load(data);
            row.title = $(".SPZz6b > h2 > span").text()
            row.address = $(".LrzXr").text()
            return row
        });
}



