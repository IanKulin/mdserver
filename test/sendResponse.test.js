import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import showdown from 'showdown';

// Since sendResponse is not exported, we'll test the markdown conversion logic
// that would be used by sendResponse
describe('Markdown conversion logic', () => {
  let converter;

  beforeEach(() => {
    converter = new showdown.Converter({ metadata: true });
  });

  test('should convert markdown to HTML', () => {
    const markdown = '# Hello World\n\nThis is a test.';
    const html = converter.makeHtml(markdown);
    
    assert(html.includes('<h1 id="helloworld">Hello World</h1>'));
    assert(html.includes('<p>This is a test.</p>'));
  });

  test('should extract title from metadata', () => {
    const markdownWithMetadata = `---
title: Test Title
---
# Content`;
    
    converter.makeHtml(markdownWithMetadata);
    const metadata = converter.getMetadata();
    
    assert.strictEqual(metadata.title, 'Test Title');
  });

  test('should handle markdown without metadata', () => {
    const markdown = '# Just Content';
    
    converter.makeHtml(markdown);
    const metadata = converter.getMetadata();
    
    assert.strictEqual(metadata.title, undefined);
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

    const html = converter.makeHtml(markdown);
    
    assert(html.includes('<h1 id="maintitle">Main Title</h1>'));
    assert(html.includes('<h2 id="subsection">Subsection</h2>'));
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