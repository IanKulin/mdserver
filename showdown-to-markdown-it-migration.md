# Migration Plan: Showdown to markdown-it

## Background

Showdown is no longer actively maintained, making it a potential security and compatibility risk. markdown-it is a well-maintained, popular alternative that provides similar functionality but requires a plugin for front-matter support.

## Required Changes

### 1. Package Dependencies

**File:** `package.json`

Replace:
```json
"showdown": "^2.1.0"
```

With:
```json
"markdown-it": "^14.0.0",
"markdown-it-front-matter": "^0.2.4"
```

### 2. Core Parser Changes

**File:** `mdparser.js`

#### Import Changes (lines 4-5)
Replace:
```javascript
import showdown from "showdown";
const converter = new showdown.Converter({ metadata: true });
```

With:
```javascript
import MarkdownIt from "markdown-it";
import frontMatter from "markdown-it-front-matter";

const md = new MarkdownIt();
let frontMatterData = {};
md.use(frontMatter, (fm) => {
  frontMatterData = parseFrontMatter(fm);
});

function parseFrontMatter(fm) {
  const metadata = {};
  fm.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      metadata[match[1]] = match[2];
    }
  });
  return metadata;
}
```

#### HTML Conversion Changes (lines 32-33)
Replace:
```javascript
const rawHtml = converter.makeHtml(data);
let title = converter.getMetadata().title;
```

With:
```javascript
frontMatterData = {}; // Reset before parsing
const rawHtml = md.render(data);
let title = frontMatterData.title;
```

### 3. Test File Changes

**File:** `test/sendResponse.test.js`

#### Import Changes (lines 3, 11)
Replace:
```javascript
import showdown from 'showdown';
// ...
converter = new showdown.Converter({ metadata: true });
```

With:
```javascript
import MarkdownIt from 'markdown-it';
import frontMatter from 'markdown-it-front-matter';
// ...
md = new MarkdownIt();
frontMatterData = {};
md.use(frontMatter, (fm) => {
  frontMatterData = parseFrontMatter(fm);
});
```

#### Method Changes (lines 16, 28-29, 61)
Replace:
```javascript
const html = converter.makeHtml(markdown);
// ...
converter.makeHtml(markdownWithMetadata);
const metadata = converter.getMetadata();
// ...
const html = converter.makeHtml(markdown);
```

With:
```javascript
const html = md.render(markdown);
// ...
md.render(markdownWithMetadata);
const metadata = frontMatterData;
// ...
const html = md.render(markdown);
```

## API Differences Summary

| Feature | Showdown | markdown-it |
|---------|----------|-------------|
| Import | `import showdown from "showdown"` | `import MarkdownIt from "markdown-it"` |
| Initialization | `new showdown.Converter({metadata: true})` | `new MarkdownIt()` + plugin |
| HTML Conversion | `converter.makeHtml(data)` | `md.render(data)` |
| Metadata | `converter.getMetadata()` | Requires plugin + custom parsing |

## Benefits of Migration

- **Active maintenance:** markdown-it is actively maintained with regular updates
- **Security:** Reduced risk from unmaintained dependencies
- **Performance:** markdown-it is generally faster than Showdown
- **Extensibility:** Rich plugin ecosystem for additional features
- **Standards compliance:** Better CommonMark specification compliance

## Considerations

- **Breaking change:** Requires testing to ensure output consistency
- **Front-matter handling:** Requires additional plugin and custom parsing logic
- **Plugin dependency:** Adds one more dependency for front-matter support

## Testing Strategy

1. Run existing tests after migration
2. Compare HTML output between Showdown and markdown-it for sample files
3. Verify front-matter extraction works correctly
4. Test edge cases with complex markdown and metadata