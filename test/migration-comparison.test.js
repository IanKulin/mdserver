import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Markdown-it Output Validation Tests', () => {
  // Helper function to normalize HTML for comparison
  function normalizeHtml(html) {
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
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

  describe('Current markdown-it output validation', () => {
    testCases.forEach(({ name, markdown }) => {
      test(`validate markdown-it output: ${name}`, async () => {
        const MarkdownIt = (await import('markdown-it')).default;
        const md = new MarkdownIt();
        const html = md.render(markdown);
        
        // Log current output for reference
        console.log(`\n=== MARKDOWN-IT OUTPUT: ${name} ===`);
        console.log('Input markdown:', JSON.stringify(markdown));
        console.log('Output HTML:', html);
        console.log('=== END OUTPUT ===\n');
        
        // Basic validation that we got HTML output
        assert.ok(html.length > 0, 'Should produce HTML output');
        assert.ok(typeof html === 'string', 'Should return string');
        
        // Additional validation based on content type
        if (name.includes('headers')) {
          assert.ok(html.includes('<h1>'), 'Should contain h1 tag');
          assert.ok(html.includes('<h2>'), 'Should contain h2 tag');
        }
        if (name.includes('emphasis')) {
          assert.ok(html.includes('<strong>'), 'Should contain strong tag');
          assert.ok(html.includes('<em>'), 'Should contain em tag');
        }
        if (name.includes('lists')) {
          assert.ok(html.includes('<ul>'), 'Should contain ul tag');
          assert.ok(html.includes('<ol>'), 'Should contain ol tag');
        }
        if (name.includes('code')) {
          assert.ok(html.includes('<code>'), 'Should contain code tag');
        }
        if (name.includes('links')) {
          assert.ok(html.includes('<a href='), 'Should contain links');
        }
      });
    });
  });

  describe('Consistency validation across test runs', () => {
    testCases.forEach(({ name, markdown }) => {
      test(`consistent output for: ${name}`, async () => {
        const MarkdownIt = (await import('markdown-it')).default;
        const md1 = new MarkdownIt();
        const md2 = new MarkdownIt();
        
        const html1 = md1.render(markdown);
        const html2 = md2.render(markdown);
        
        // Same input should always produce same output
        assert.strictEqual(html1, html2, `Output should be consistent for ${name}`);
        
        // Output should be deterministic
        const html3 = md1.render(markdown);
        assert.strictEqual(html1, html3, `Multiple renders should produce identical output for ${name}`);
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

    test('markdown-it front-matter handling', async () => {
      const MarkdownIt = (await import('markdown-it')).default;
      const frontMatter = (await import('markdown-it-front-matter')).default;
      
      const md = new MarkdownIt();
      let frontMatterData = {};
      
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
      
      md.use(frontMatter, (fm) => {
        frontMatterData = parseFrontMatter(fm);
      });
      
      const html = md.render(frontMatterTest);
      
      console.log('\n=== FRONT-MATTER CURRENT ===');
      console.log('Input:', JSON.stringify(frontMatterTest));
      console.log('Markdown-it output:', html);
      console.log('Extracted metadata:', frontMatterData);
      console.log('=== END FRONT-MATTER CURRENT ===\n');
      
      // Validate front-matter extraction
      assert.strictEqual(frontMatterData.title, 'Test Document', 'Should extract title');
      assert.strictEqual(frontMatterData.author, 'Test Author', 'Should extract author');
      assert.strictEqual(frontMatterData.date, '2024-01-01', 'Should extract date');
      
      // Validate HTML output
      assert.ok(!html.includes('title: Test Document'), 'Front-matter should be removed from HTML');
      assert.ok(html.includes('<h1>Main Content</h1>'), 'Content should be rendered as HTML');
      assert.ok(html.includes('This is the content after front-matter'), 'Body content should be present');
    });

    test('front-matter consistency validation', async () => {
      // Test that front-matter processing is consistent across multiple runs
      const MarkdownIt = (await import('markdown-it')).default;
      const frontMatter = (await import('markdown-it-front-matter')).default;
      
      const md = new MarkdownIt();
      let metadata1 = {};
      let metadata2 = {};
      
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
      
      md.use(frontMatter, (fm) => {
        metadata1 = parseFrontMatter(fm);
      });
      
      const html1 = md.render(frontMatterTest);
      
      // Reset and parse again  
      const md2 = new MarkdownIt();
      md2.use(frontMatter, (fm) => {
        metadata2 = parseFrontMatter(fm);
      });
      
      const html2 = md2.render(frontMatterTest);
      
      // Should be consistent
      assert.deepStrictEqual(metadata1, metadata2, 'Metadata extraction should be consistent');
      assert.strictEqual(html1, html2, 'HTML output should be consistent');
    });
  });
});