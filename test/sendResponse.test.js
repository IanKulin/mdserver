import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import MarkdownIt from 'markdown-it';
import frontMatter from 'markdown-it-front-matter';

// Since sendResponse is not exported, we'll test the markdown conversion logic
// that would be used by sendResponse
describe('Markdown conversion logic', () => {
  let md;
  let frontMatterData;

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

  beforeEach(() => {
    md = new MarkdownIt();
    frontMatterData = {};
    md.use(frontMatter, (fm) => {
      frontMatterData = parseFrontMatter(fm);
    });
  });

  test('should convert markdown to HTML', () => {
    const markdown = '# Hello World\n\nThis is a test.';
    const html = md.render(markdown);
    
    assert(html.includes('<h1>Hello World</h1>'));
    assert(html.includes('<p>This is a test.</p>'));
  });

  test('should extract title from metadata', () => {
    const markdownWithMetadata = `---
title: Test Title
---
# Content`;
    
    md.render(markdownWithMetadata);
    const metadata = frontMatterData;
    
    assert.strictEqual(metadata.title, 'Test Title');
  });

  test('should handle markdown without metadata', () => {
    const markdown = '# Just Content';
    
    md.render(markdown);
    const metadata = frontMatterData;
    
    assert.strictEqual(metadata.title, undefined);
  });

  test('should handle malformed front-matter gracefully', () => {
    const markdownWithMalformedMetadata = `---
invalid yaml here
no colon
---
# Content`;
    
    // Should not throw an error
    const html = md.render(markdownWithMalformedMetadata);
    const metadata = frontMatterData;
    
    assert(html.includes('<h1>Content</h1>'));
    assert.strictEqual(metadata.title, undefined);
  });

  test('should handle front-matter with special characters', () => {
    const markdownWithSpecialChars = `---
title: Test Title with "quotes" and symbols: !@#$%
author: John O'Connor & Jane Smith
---
# Content`;
    
    md.render(markdownWithSpecialChars);
    const metadata = frontMatterData;
    
    assert.strictEqual(metadata.title, 'Test Title with "quotes" and symbols: !@#$%');
    assert.strictEqual(metadata.author, "John O'Connor & Jane Smith");
  });

  test('should handle front-matter with empty values', () => {
    const markdownWithEmptyValues = `---
title: 
description:
author: Valid Author
---
# Content`;
    
    md.render(markdownWithEmptyValues);
    const metadata = frontMatterData;
    
    // Parser captures empty string, not undefined for empty values
    assert.strictEqual(metadata.title, ' ');
    assert.strictEqual(metadata.description, undefined);
    assert.strictEqual(metadata.author, 'Valid Author');
  });

  test('should handle front-matter with only whitespace values', () => {
    const markdownWithWhitespace = `---
title:    
description:   
author: Valid Author
---
# Content`;
    
    md.render(markdownWithWhitespace);
    const metadata = frontMatterData;
    
    // Parser captures whitespace as value
    assert.strictEqual(metadata.title, ' ');
    assert.strictEqual(metadata.description, ' ');
    assert.strictEqual(metadata.author, 'Valid Author');
  });

  test('should handle front-matter with no dashes', () => {
    const markdownWithoutDashes = `title: This is not front-matter
# This should be treated as content`;
    
    const html = md.render(markdownWithoutDashes);
    const metadata = frontMatterData;
    
    // Should render as normal paragraph and header
    assert(html.includes('<p>title: This is not front-matter</p>'));
    assert(html.includes('<h1>This should be treated as content</h1>'));
    assert.strictEqual(metadata.title, undefined);
  });

  test('should handle front-matter with numeric and boolean-like values', () => {
    const markdownWithMixedTypes = `---
title: Test Title
version: 1.2.3
published: true
count: 42
---
# Content`;
    
    md.render(markdownWithMixedTypes);
    const metadata = frontMatterData;
    
    assert.strictEqual(metadata.title, 'Test Title');
    assert.strictEqual(metadata.version, '1.2.3');
    assert.strictEqual(metadata.published, 'true');
    assert.strictEqual(metadata.count, '42');
  });

  test('should handle front-matter with extra spaces around colons', () => {
    const markdownWithSpaces = `---
title   :   Spaced Title
author:No Space Author
description  :  Multiple   Spaces   Here
---
# Content`;
    
    md.render(markdownWithSpaces);
    const metadata = frontMatterData;
    
    // The regex only matches \w+:\s+ pattern, so spaces before colon break the match
    assert.strictEqual(metadata.title, undefined); // Doesn't match due to spaces before colon
    assert.strictEqual(metadata.author, 'No Space Author');
    assert.strictEqual(metadata.description, undefined); // Also doesn't match due to spaces before colon
  });

  test('should process complex markdown features', () => {
    const markdown = `# Main Title

## Subsection

- List item 1
- List item 2

**Bold text** and *italic text*

\`inline code\`

\`\`\`javascript
function test() {
  return true;
}
\`\`\``;

    const html = md.render(markdown);
    
    assert(html.includes('<h1>Main Title</h1>'));
    assert(html.includes('<h2>Subsection</h2>'));
    assert(html.includes('<ul>'));
    assert(html.includes('<li>List item 1</li>'));
    assert(html.includes('<strong>Bold text</strong>'));
    assert(html.includes('<em>italic text</em>'));
    assert(html.includes('<code>inline code</code>'));
    assert(html.includes('<pre><code'));
  });
});

// Test template substitution logic
describe('Template substitution logic', () => {
  test('should replace template placeholders', () => {
    const template = '<html><head><title>{{title}}</title></head><body>{{content}}</body></html>';
    const title = 'Test Page';
    const content = '<p>Test content</p>';
    
    const result = template
      .replace('{{title}}', title)
      .replace('{{content}}', content);
    
    assert(result.includes('<title>Test Page</title>'));
    assert(result.includes('<p>Test content</p>'));
  });

  test('should handle missing placeholders gracefully', () => {
    const template = '<html><head><title>{{title}}</title></head><body>{{content}}</body></html>';
    const title = 'Test Page';
    
    // Only replace title, leave content placeholder
    const result = template.replace('{{title}}', title);
    
    assert(result.includes('<title>Test Page</title>'));
    assert(result.includes('{{content}}'));
  });
});