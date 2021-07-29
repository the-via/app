const fetch = require('node-fetch');
const fs = require('fs');
let url = 'https://www.caniusevia.com/keyboards.v2.json';

let settings = {method: 'Get'};

fetch(url, settings)
  .then((res) => res.json())
  .then((json) => {
    fs.writeFileSync('./public/keyboards.v2.json', JSON.stringify(json));
    // do something with JSON
  });
