const express = require("express");
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
converter = new showdown.Converter();
 
const hostname = '127.0.0.1';
const port = 3000;


var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 

// markdown middleware
app.use((req, res, next) => {
    if (req.url.endsWith('.md')) {
        // If the request URL ends with .md, treat it as a Markdown file

        console.log('md detected');
        console.log(__dirname);
        const staticRoot = path.join(__dirname, 'public');
        console.log(staticRoot);
        const mdFilePath = path.join(staticRoot, req.url);

        console.log(mdFilePath);
      
        fs.readFile(mdFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log('err');
                // Handle any errors (e.g., file not found)
                res.status(404).send('File not found');
            } else {
                console.log('no err');
                console.log(data);
                // Process the Markdown content (e.g., convert to HTML using marked)
                const htmlContent = converter.makeHtml(data);
            
                // Send the processed content as an HTML response
                res.send(htmlContent);
            }
        })
    } else {
        // For other requests, pass control to the next middleware
        console.log('not an md');
        next();
    }
  });

  app.use(express.static('public'));


app.get('/', function(req, res){
    res.send('Hello World!');
});
 

app.post('/login', function(req, res) {
    res.send("Authenticated");
  },
);
 

app.post("/convert", function(req, res, next) {
    console.log(req.body);
    if(typeof req.body.content == 'undefined' || req.body.content == null) {
        res.json(["error", "No data found"]);
    } else {
        res.json(["markdown", req.body.content]);
    }
});
 

app.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
 });
