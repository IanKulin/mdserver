# mdserver

A lightweight web server to serve a directory of markdown files, converting them to html on the fly. Non-markdown files are served directly.

mdserver is a node.js application using [express](https://expressjs.com/) and [showdown](https://showdownjs.com/).

## Usage

* Have node.js installed and working
* Clone the repo
* start with `npm start`

Files are only served from the `public` sub-directory, so all your HTML, CSS, and markdown (.md) files go in there. There is a set of (very simple) sample files provided.

The filename `template.html` is a magic one. This is the html that is used to wrap any converted markdown to ensure it is valid html. This file should contain placeholders for `{{title}}` and `{{content}}`. If `template.html` is not found, the converted markdown is sent as not-quite-correct HTML - which works fine in current browsers anyway.

## Contributions

Are very welcome, but I'd have to, like, learn how to deal with a pull request ☺


## Other projects

If you are looking for something more powerful that serves up markdown but has a heap of other powers - such as other template languages and partials, you might be happier with [Harp](https://harpjs.com/).
