import { test, describe } from 'node:test';
import assert from 'node:assert';
import { HtmlDiffer } from 'html-differ';

const htmlDiffer = new HtmlDiffer({
  ignoreAttributes: [],
  compareAttributesAsJSON: [],
  ignoreWhitespaces: true,
  ignoreComments: true,
  ignoreEndTags: false,
  ignoreDuplicateAttributes: false
});

describe('Migration Comparison Tests (for future use)', () => {
  // Helper function to normalize HTML for comparison
  function normalizeHtml(html) {
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  // Helper function to compare HTML semantically
  function compareHtml(html1, html2, testName) {
    const isEqual = htmlDiffer.isEqual(html1, html2);
    if (!isEqual) {
      const diff = htmlDiffer.diffHtml(html1, html2);
      console.log(`HTML differences in ${testName}:`, diff);
    }
    return isEqual;
  }

  // Test cases for common markdown patterns
  const testCases = [
    {
      name: 'basic headers',
      markdown: '# H1\n## H2\n### H3'
    },
    {
      name: 'emphasis',
      markdown: '**bold** and *italic* and ***both***'
    },
    {
      name: 'lists',
      markdown: '- Item 1\n- Item 2\n  - Nested\n\n1. Ordered\n2. List'
    },
    {
      name: 'code',
      markdown: 'Inline `code` and:\n\n```javascript\nfunction test() {\n  return "hello";\n}\n```'
    },
    {
      name: 'links',
      markdown: '[link text](https://example.com) and auto-link: https://example.com'
    },
    {
      name: 'mixed content',
      markdown: `# Main Title

This is a paragraph with **bold** and *italic* text.

## List Section

- First item with [a link](https://example.com)
- Second item with \`inline code\`
- Third item

### Code Example

\`\`\`javascript
const example = {
  hello: "world",
  test: true
};
\`\`\`

Back to regular text.`
    }
  ];

  describe('Showdown baseline capture', () => {
    testCases.forEach(({ name, markdown }) => {
      test(`capture showdown output: ${name}`, async () => {
        const Showdown = await import('showdown');
        const converter = new Showdown.default.Converter();
        const html = converter.makeHtml(markdown);
        
        // Store this as our baseline for future comparison
        console.log(`\n=== SHOWDOWN BASELINE: ${name} ===`);
        console.log('Input markdown:', JSON.stringify(markdown));
        console.log('Output HTML:', html);
        console.log('=== END BASELINE ===\n');
        
        // Basic validation that we got HTML output
        assert.ok(html.length > 0, 'Should produce HTML output');
        assert.ok(typeof html === 'string', 'Should return string');
      });
    });
  });

  // These tests will be used after migration to markdown-it
  describe('Migration validation (SKIP until after migration)', () => {
    testCases.forEach(({ name, markdown }) => {
      test.skip(`compare engines: ${name}`, async () => {
        // This test is skipped until after migration
        // After migration, un-skip and implement markdown-it comparison
        
        // Example of what this will look like:
        // const Showdown = await import('showdown');
        // const MarkdownIt = await import('markdown-it');
        // 
        // const showdownConverter = new Showdown.Converter();
        // const markdownIt = new MarkdownIt();
        // 
        // const showdownHtml = showdownConverter.makeHtml(markdown);
        // const markdownItHtml = markdownIt.render(markdown);
        // 
        // const isEquivalent = compareHtml(showdownHtml, markdownItHtml, name);
        // 
        // if (!isEquivalent) {
        //   console.log(`\nDifferences found in ${name}:`);
        //   console.log('Showdown:', showdownHtml);
        //   console.log('Markdown-it:', markdownItHtml);
        // }
        // 
        // // For now, we'll allow differences but log them
        // // Later, decide if differences are acceptable
        
        assert.ok(true, 'Placeholder for future migration validation');
      });
    });
  });

  describe('Front-matter handling comparison', () => {
    const frontMatterTest = `---
title: Test Document
author: Test Author
date: 2024-01-01
---

# Main Content

This is the content after front-matter.`;

    test('showdown front-matter baseline', async () => {
      const Showdown = await import('showdown');
      const converter = new Showdown.default.Converter();
      const html = converter.makeHtml(frontMatterTest);
      
      console.log('\n=== FRONT-MATTER BASELINE ===');
      console.log('Input:', JSON.stringify(frontMatterTest));
      console.log('Showdown output:', html);
      console.log('=== END FRONT-MATTER BASELINE ===\n');
      
      // Showdown will convert front-matter as regular content
      assert.ok(html.includes('title:'), 'Showdown should pass through front-matter');
    });

    test.skip('front-matter migration validation', () => {
      // This will be implemented after migration
      // Will test that front-matter is properly handled by new engine
      assert.ok(true, 'Placeholder for front-matter migration validation');
    });
  });
});