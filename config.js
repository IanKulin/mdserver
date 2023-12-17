const path = require('path');


const templateName = 'template.html';

const publicDirectory = 'public';
const staticRoot = path.join(__dirname, publicDirectory);
const templatePath = path.join(staticRoot, templateName);

let templateData = '';
let useTemplate = false;



module.exports = {
    publicDirectory: publicDirectory,
    staticRoot: staticRoot,
    templatePath: templatePath,
    templateData: templateData,
    useTemplate: useTemplate,
}