const express = require("express");
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');
const showdown = require('showdown');
const converter = new showdown.Converter({metadata: true});

const config = require('./config');

// middleware for processing markdown files
function mdParser(req, res, next) {
    if (req.url.toLowerCase().endsWith('.md')) {
        const mdFilePath = path.join(config.staticRoot, req.url);

        fs.readFile(mdFilePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // if we were looking for /index.md and it's not there, it's probably a 
                    // fresh install so we will return the welcome message
                    if (req.url === '/index.md') {
                        res.status(200).send(config.welcome_html);
                        return;
                    } else {
                        res.status(404).send('File not found');
                    }
                    
                } else {
                    // Other error types
                    console.error('Error reading file:', err);
                    res.status(500).send('Internal Server Error');
                }
            } else {
                const rawHtml = converter.makeHtml(data);

                if (config.useTemplate) {
                    // Replace placeholders with title and content using the template loaded at startup
                    let title = converter.getMetadata().title;
                    console.log(title);
                    if (title === undefined) {
                        title = path.basename(mdFilePath);
                    }
                    
                    const templatedHtml = config.templateData.replace('{{title}}', title).replace('{{content}}',
                        rawHtml);
                    res.send(templatedHtml);
                } else {
                    res.send(rawHtml);
                }
            }
        })
    } else {
        next();
    }
};


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
