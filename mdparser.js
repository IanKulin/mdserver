import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import showdown from "showdown";
const converter = new showdown.Converter({ metadata: true });

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
public/index.md</code> or <code>public/index.html</code> file installed)</p></main></body></html>`;

const templateName = "template.html";
const publicDirectory = "public";
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticRoot = path.join(__dirname, publicDirectory);
const templatePath = path.join(staticRoot, templateName);

let templateData = "";
let useTemplate = false;

async function sendResponse(res, filePath, data) {
  const rawHtml = converter.makeHtml(data);
  let title = converter.getMetadata().title;
  if (title === undefined) {
    title = path.basename(filePath);
  }
  if (useTemplate) {
    // Replace placeholders with title and content using the template loaded at startup
    const templatedHtml = templateData
      .replace("{{title}}", title)
      .replace("{{content}}", rawHtml);
    res.status(200).send(templatedHtml);
  } else {
    res.status(200).send(rawHtml);
  }
}

async function mdParser(req, res, next) {
  if (!req.url.toLowerCase().endsWith(".md")) {
    // not a markdown file, so pass on to the next handler
    next();
    return;
  }

  const mdFilePath = path.resolve(
    staticRoot,
    path.normalize(req.url.substring(1)),
  );
  if (!mdFilePath.startsWith(staticRoot)) {
    res.status(403).send("Access denied");
    return;
  }
  try {
    const stats = await fs.promises.stat(mdFilePath);
    if (stats.size > MAX_FILE_SIZE) {
      res.status(413).send("File too large");
      return;
    }
    const data = await fs.promises.readFile(mdFilePath, "utf8");
    await sendResponse(res, mdFilePath, data);
  } catch (err) {
    if (err.code === "ENOENT") {
      if (req.url === "/index.md") {
        // no index.md, so serve the welcome page
        res.status(200).send(welcome_html);
      } else {
        res.status(404).send("File not found");
      }
    } else {
      console.error("Error reading file:", mdFilePath, err);
      res.status(500).send("Internal server error");
    }
  }
}

async function loadTemplate() {
  try {
    const data = await fs.promises.readFile(templatePath, "utf8");
    useTemplate = true;
    templateData = data;
    console.log("Template loaded from", templatePath);
  } catch {
    useTemplate = false;
    console.log("No template found at", templatePath);
  }
}

export { mdParser, loadTemplate, publicDirectory };
