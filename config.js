const path = require('path');

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

module.exports = {
    publicDirectory: publicDirectory,
    hostname: hostname,
    port: port,
    staticRoot: staticRoot,
    templatePath: templatePath,
    templateData: templateData,
    useTemplate: useTemplate,
    welcome_html: welcome_html
}