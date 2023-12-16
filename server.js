const express = require("express");
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

const mdParser = require('./mdParser');

const config = require('./config');


const app = express();
app.use(mdParser);
app.use(express.static(config.publicDirectory));


app.get('/', function (req, res) {
    // there's no index.html, so try index.md
    req.url = '/index.md';
    mdParser(req, res, () => { });
});


// Promisify fs.readFile
const readFilePromise = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};


// Use a promise to read the template file then start the server
console.log('Starting mdserver ver', packageJson.version);
readFilePromise(config.templatePath)
    .then((data) => {
        config.useTemplate = true;
        config.templateData = data;
        console.log('Template loaded from', config.templatePath);
    })
    .catch((err) => {
        config.useTemplate = false;
        console.log('No template found at', config.templatePath);
    })
    .finally(() => {
        app.listen(config.port, config.hostname, () => {
            console.log(`Server running at http://${config.hostname}:${config.port}/`);
        });
    });
