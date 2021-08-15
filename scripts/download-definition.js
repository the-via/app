const fetch = require('node-fetch');
const fs = require('fs');
let url = 'https://www.caniusevia.com/keyboards.v2.json';

let settings = {method: 'Get'};
if (!fs.existsSync('public/definitions')) {
  fs.mkdirSync('public/definitions');
}

fetch(url, settings)
  .then((res) => res.json())
  .then((json) => {
    const {definitions, ...rest} = json;
    const supportedKbs = Object.keys(definitions).map((i) => parseInt(i));
    fs.writeFileSync(
      './public/definitions/supported_kbs.json',
      JSON.stringify({...rest, supportedKbs}),
    );
    Object.values(definitions).forEach((val) => {
      fs.writeFileSync(
        `./public/definitions/${val.vendorProductId}.json`,
        JSON.stringify(val),
      );
    });
    // do something with JSON
  });
