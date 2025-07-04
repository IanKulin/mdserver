import express from "express";
import fs from "fs";

import { mdParser, loadTemplate, publicDirectory } from "./mdparser.js";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const hostname = "0.0.0.0";
const port = 3000;

const app = express();
app.use(mdParser);
app.use(express.static(publicDirectory));

app.get("/", function (req, res) {
  // there's no index.html, so try index.md
  req.url = "/index.md";
  mdParser(req, res, () => {});
});

async function startServer() {
  console.log("Starting mdserver ver", packageJson.version);
  await loadTemplate();
  if (process.env.NODE_ENV !== "test") {
    app.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });
  }
}

// Only start server when running directly (not when imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

// Export app for testing
export { app };
