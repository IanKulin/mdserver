const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
const converter = new showdown.Converter({metadata: true});

const config = require('./config');

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


async function sendResponse(res, filePath, data) {
    const rawHtml = converter.makeHtml(data);
    let title = converter.getMetadata().title;
    if (title === undefined) {
        title = path.basename(filePath);
    }
    if (config.useTemplate) {
        // Replace placeholders with title and content using the template loaded at startup
        const templatedHtml = config.templateData.replace('{{title}}', title).replace('{{content}}', rawHtml);
        res.status(200).send(templatedHtml);
    }
    else {
        res.status(200).send(rawHtml);
    }
}


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
                sendResponse(res, mdFilePath, data);
            }
        })
    } else {
        next();
    }
};

module.exports = mdParser;
