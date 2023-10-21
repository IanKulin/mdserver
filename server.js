const express = require("express");
const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
const converter = new showdown.Converter();

const publicDirectory = 'public';
const templateName = 'template.html';
const hostname = '127.0.0.1';
const port = 3000;
const version = 'v0.01';

const staticRoot = path.join(__dirname, publicDirectory);
const templatePath = path.join(staticRoot, templateName);

let templateData = '';
let useTemplate = false;


// middleware for processing markdown files
function mdParser(req, res, next) {
    if (req.url.endsWith('.md')) {
        const mdFilePath = path.join(staticRoot, req.url);

        fs.readFile(mdFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('err');
                res.status(404).send('File not found');
            } else {
                const htmlContent = converter.makeHtml(data);

                if (useTemplate) {
                    // Replace placeholders with title and content using the template loaded at startup
                    const title = path.basename(mdFilePath);
                    const templatedHtml = templateData.replace('{{title}}', title).replace('{{content}}', 
                        htmlContent);
                    res.send(templatedHtml);
                } else {
                    res.send(htmlContent);
                }
            }
        })
    } else {
        next();
    }
};


var app = express();
app.use(mdParser);
app.use(express.static(publicDirectory));


app.get('/', function (req, res) {
    // if there's no index.html, try index.md
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


console.log('mdserver ', version);
// Use a promise to read the template file then start the server
readFilePromise(templatePath)
    .then((data) => {
        useTemplate = true;
        templateData = data;
        console.log('Template loaded from', templatePath);
    })
    .catch((err) => {
        useTemplate = false;
        console.log('No template found at', templatePath);
    })
    .finally(() => {
        app.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    });
