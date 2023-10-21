const express = require("express");
const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
const converter = new showdown.Converter();

const publicDirectory = 'public'; 
const hostname = '127.0.0.1';
const port = 3000;


function mdParser(req, res, next) {
    if (req.url.endsWith('.md')) {
        // If the request URL ends with .md, treat it as a Markdown file
        const staticRoot = path.join(__dirname, publicDirectory);
        const mdFilePath = path.join(staticRoot, req.url);
      
        fs.readFile(mdFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('err');
                // Handle any errors (e.g., file not found)
                res.status(404).send('File not found');
            } else {
                // convert to HTML using showDown
                const htmlContent = converter.makeHtml(data);
                res.send(htmlContent);
            }
        })
    } else {
        // For other requests, pass control to the next middleware
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
  console.log(`Server running at http://${hostname}:${port}/`);
 });
