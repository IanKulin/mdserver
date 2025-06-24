# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start the server (runs on localhost:3000)
- `npm test` - Run all tests using Node.js built-in test runner
- `npm run lint` - Run ESLint on all JavaScript files
- `npm run format` - Format code with Prettier
- `npm audit` - Check there are no known CVEs for the packages used

## Testing

- Tests are located in the `test/` directory
- Uses Node.js built-in test runner (`node --test`)
- Test files follow the pattern `*.test.js`
- Includes unit tests, end-to-end tests, and migration comparison tests

## Architecture Overview

**mdserver** is a lightweight Express.js application that serves markdown files as HTML on-demand.

### Core Components

- `server.js` - Main Express server setup and startup logic
- `mdparser.js` - Core markdown processing middleware using markdown-it converter
- `public/` - Static file directory (serves both markdown and other files)

### Key Architecture Patterns

- **Middleware-based processing**: Uses Express middleware (`mdParser`) to intercept `.md` requests
- **Template system**: Optional `template.html` file in `public/` directory provides HTML wrapper with `{{title}}` and `{{content}}` placeholders  
- **Security**: Path traversal protection ensures files can only be served from `public/` directory
- **Fallback handling**: Serves welcome page when no `index.md` exists

### File Processing Flow

1. Request comes in for a `.md` file
2. `mdParser` middleware intercepts and processes with markdown-it
3. Extracts frontmatter metadata (title, etc.)
4. Applies template if available, otherwise serves raw HTML
5. Non-markdown files pass through to Express static handler

### Configuration

- Server runs on `0.0.0.0:3000` by default
- Maximum file size limit: 1MB
- ESM modules throughout codebase
- Uses markdown-it with markdown-it-front-matter plugin for markdown processing