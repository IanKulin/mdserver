const fs = require('fs');
const path = require('path');
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

module.exports = mdParser;
