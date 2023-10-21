const express = require("express");
const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
const converter = new showdown.Converter();

const publicDirectory = 'public'; 
const staticRoot = path.join(__dirname, publicDirectory);
const templatePath = path.join(staticRoot, 'template.html'); 
const hostname = '127.0.0.1';
const port = 3000;

let templateData = '';
let useTemplate = false;


function mdParser(req, res, next) {
    if (req.url.endsWith('.md')) {  
        // must be a markdown file 
        const mdFilePath = path.join(staticRoot, req.url);
      
        fs.readFile(mdFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('err');
                res.status(404).send('File not found');
            } else {
                // convert to HTML using showDown
                const htmlContent = converter.makeHtml(data);
                res.send(htmlContent);
            }
        })
    } else {
        next();
    }
};

var app = express();
app.use(mdParser);
app.use(express.static(publicDirectory));


app.get('/', function(req, res){
    // if there's no index.html, try index.md
    req.url = '/index.md'; 
    mdParser(req, res, () => {});
});
 

app.listen(port, hostname, function() {
    console.log(`Reading template...`);
    fs.readFile(templatePath, 'utf8', (err, data) => {
        if (err) {
            useTemplate = false;
            console.log('No template found at', templatePath);
        } else {
            useTemplate = true;
            templateData = data;
            console.log('Template loaded from', templatePath);
        }
    });
    console.log(`Server running at http://${hostname}:${port}/`);
 });
