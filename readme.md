# mdserver

A lightweight web server to serve a directory of markdown files, converting them to html on the fly. Non-markdown files are served directly.

**mdserver** is a node.js application using [express](https://expressjs.com/) and [showdown](https://showdownjs.com/).

## Install

* Have node.js installed and working
* Clone the repo
* Start with `npm start`

or, with Docker

* Create a new directory and drop the [docker-compose.yml](https://github.com/IanKulin/mdserver/blob/main/docker-compose.yml) file in there, and run `docker compose up -d`.

## Usage

Files are only served from the `public` sub-directory, so all your HTML, CSS, and markdown (.md) files go in there. There are some (very simple) sample files provided in the repo.

The filename `template.html` is a magic one. This is the html that is used to wrap any converted markdown to ensure it is valid html. This file should contain placeholders for `{{title}}` and `{{content}}`. If `template.html` is not found, the converted markdown is sent as not-quite-correct HTML - which mostly works fine in current browsers.

A welcome message appears at the root route, to get rid of it, ensure you have an `index.html` or `index.md` file in the public directory.

## Contributions

Are very welcome, but I'd have to learn how to deal with a pull request ☺


## Similar projects

If you are looking for something more powerful that serves up markdown but has a heap of other powers - such as other template languages and partials, you might be happier with [Harp](https://harpjs.com/) from [sintaxi](https://github.com/sintaxi/harp).
