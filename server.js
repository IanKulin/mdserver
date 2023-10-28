const express = require("express");
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');
const showdown = require('showdown');
const converter = new showdown.Converter();

const publicDirectory = 'public';
const templateName = 'template.html';
const hostname = '0.0.0.0';
const port = 3000;

const staticRoot = path.join(__dirname, publicDirectory);
const templatePath = path.join(staticRoot, templateName);

let templateData = '';
let useTemplate = false;

const welcome_html = `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>mdserver - welcome</title></head>
<body><main><p>You've successfully installed <strong>mdserver</strong>.</p><p>To use:</p><ul>
<li>create a <code>public</code> directory inside the directory where you launched the container from</li> 
<li>put your files in there</li><li>markdown files will be converted to HTML on the fly</li>
<li>other files will be served normally</li><li>if the file <code>template.html</code> 
is present, it will be used as a template to enclose the markdown</li>
</ul><p>Learn more at the project's <a href="https://github.com/IanKulin/mdserver">GitHub page</a></p>
<h3>sample template.html</h3><code>&lt;!DOCTYPE html&gt;<br>&lt;html lang="en"&gt;<br>
&lt;head&gt;<br>&ensp; &lt;meta charset="UTF-8"&gt;<br>&ensp; &lt;title&gt;{{title}}&lt;/title&gt;<br>
&lt;/head&gt;<br>&lt;body&gt;<br>&ensp; &lt;main&gt;<br>&emsp; {{content}}<br>&ensp; &lt;/main&gt;<br>
&lt;/body&gt;<br>&lt;/html&gt;<br></code><p>(To remove this message, ensure you have a <code>
public/index.md</code> or <code>public/index.html</code> file installed)</p></main></body></html>`


// middleware for processing markdown files
function mdParser(req, res, next) {
    if (req.url.toLowerCase().endsWith('.md')) {
        const mdFilePath = path.join(staticRoot, req.url);

        fs.readFile(mdFilePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // if we were looking for /index.md and it's not there, it's probably a 
                    // fresh install so we will return the welcome message
                    if (req.url === '/index.md') {
                        res.status(200).send(welcome_html);
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


const app = express();
app.use(mdParser);
app.use(express.static(publicDirectory));


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
