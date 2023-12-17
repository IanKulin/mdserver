const express = require("express");
const packageJson = require('./package.json');

const { mdParser, loadTemplate, publicDirectory } = require('./mdParser');

const hostname = '0.0.0.0';
const port = 3000;


const app = express();
app.use(mdParser);
app.use(express.static(publicDirectory));


app.get('/', function (req, res) {
    // there's no index.html, so try index.md
    req.url = '/index.md';
    mdParser(req, res, () => { });
});


async function startServer() {
    console.log('Starting mdserver ver', packageJson.version);
    await loadTemplate(); 
    app.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}

startServer();
