# mdserver

A lightweight web server to serve a directory of markdown files, converting them to html on the fly. Non-markdown files are served directly.

**mdserver** is a node.js application using [Express](https://expressjs.com/) and [markdown-it](https://markdown-it.github.io/).

## Install

* Have node.js installed and working
* Clone the repo
* Start with `npm start`

or, with Docker

* Create a new directory and drop the [docker-compose.yml](https://github.com/IanKulin/mdserver/blob/main/docker-compose.yml) file in there, and run `docker compose up -d`.

## Usage

Files are only served from the `public` sub-directory, so all your HTML, CSS, and markdown (.md) files go in there. There are a couple of (very simple) sample files provided in the repo.

The filename `template.html` is a magic one. This is the html that is used to wrap any converted markdown to ensure it is valid html. This file should contain placeholders for `{{title}}` and `{{content}}`. If `template.html` is not found, the converted markdown is sent as not-quite-correct HTML - which mostly works fine in current browsers.

New installations will have a welcome message appear at the root route, to get rid of it, ensure you have an `index.html` or `index.md` file in the public directory.

Since **mdserver** uses [markdown-it](https://markdown-it.github.io/) for the markdown -> HTML conversion, all [CommonMark](https://commonmark.org/) features are supported. This includes adding the title for the output HTML page using Frontmatter style. If you are using a template that includes the `{{title}}` directive, the following markdown would be output as HTML with the title 'Test File'
```
---
title: Test File
---

# Test.md

* A sample mark down file
```
The metadata included in the markdown like this is removed before the conversion to HTML.

## Changelog

0.2.3 - +ESM, security fixes, eslint  
0.3.0 - Migrated from Showdown to markdown-it for markdown translation
0.3.1 - remove 'diff' package that had CVE 

## Similar projects

If you are looking for something more powerful that serves up markdown but has a heap of other powers - such as other template languages and partials, you might be happier with [Harp](https://harpjs.com/) from [sintaxi](https://github.com/sintaxi/harp).

And of course, the performant way to serve markdown as html is a static site generator, of which there are [many](https://github.com/myles/awesome-static-generators).

## Build


