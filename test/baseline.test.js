import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { readFileSync } from 'node:fs';

// Import the app
import { app } from '../server.js';

describe('Current Markdown-it Output Tests', () => {
  // Test cases with various markdown features
  const testCases = [
    {
      name: 'headers and emphasis',
      markdown: '# H1\n## H2\n**bold** and *italic*',
      expectedPattern: /<h1>H1<\/h1>.*<h2>H2<\/h2>.*<strong>bold<\/strong>.*<em>italic<\/em>/s
    },
    {
      name: 'lists',
      markdown: '- Item 1\n- Item 2\n  - Nested\n\n1. Ordered\n2. List',
      expectedPattern: /<ul>.*<li>Item 1<\/li>.*<li>Item 2.*<ul>.*<li>Nested<\/li>.*<\/ul>.*<\/li>.*<\/ul>.*<ol>.*<li>Ordered<\/li>.*<li>List<\/li>.*<\/ol>/s
    },
    {
      name: 'code blocks',
      markdown: 'Inline `code` and:\n\n```\ncode block\n```',
      expectedPattern: /<code>code<\/code>.*<pre><code>code block\n<\/code><\/pre>/s
    },
    {
      name: 'links',
      markdown: '[link text](https://example.com)',
      expectedPattern: /<a href="https:\/\/example\.com">link text<\/a>/
    }
  ];

  testCases.forEach(({ name, markdown, expectedPattern }) => {
    test(`current output for ${name}`, async () => {
      // Import markdown-it and convert markdown the same way the server does
      const MarkdownIt = (await import('markdown-it')).default;
      const md = new MarkdownIt();
      const html = md.render(markdown);
      
      // Validate current output matches expected patterns
      assert.match(html, expectedPattern, `Current output should match expected pattern for ${name}`);
      
      // Log the actual HTML for reference
      console.log(`Current HTML for ${name}:`, html);
    });
  });

  test('front-matter handling with markdown-it', async () => {
    const markdownWithFrontMatter = `---
title: Test Title
author: Test Author
---

# Content

This is test content.`;

    // Test how markdown-it with front-matter plugin handles metadata
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
    
    const html = md.render(markdownWithFrontMatter);
    
    console.log('Current front-matter handling:', html);
    console.log('Extracted metadata:', frontMatterData);
    
    // markdown-it with front-matter plugin should extract metadata and remove it from output
    assert.ok(!html.includes('title: Test Title'), 'Front-matter should be removed from HTML output');
    assert.strictEqual(frontMatterData.title, 'Test Title', 'Title should be extracted from front-matter');
    assert.strictEqual(frontMatterData.author, 'Test Author', 'Author should be extracted from front-matter');
    assert.ok(html.includes('<h1>Content</h1>'), 'Content should be rendered as HTML');
  });
});

describe('Current Server Response Baselines', () => {
  test('index.md baseline response', async () => {
    const response = await request(app)
      .get('/index.md')
      .expect(200);
    
    // Store the complete response for comparison
    console.log('Baseline index.md response:', response.text);
    
    // Basic assertions about the response structure
    assert.ok(response.text.includes('<h1'), 'Should contain h1 tag');
    assert.ok(response.text.includes('Test.md'), 'Should contain the markdown content');
    assert.ok(response.text.includes('<title>Index</title>'), 'Should have title from front-matter');
  });

  test('test.md baseline response', async () => {
    const response = await request(app)
      .get('/test.md')
      .expect(200);
    
    console.log('Baseline test.md response:', response.text);
    
    assert.ok(response.text.includes('<h1'), 'Should contain h1 tag');
    assert.ok(response.text.includes('Test.md'), 'Should contain the markdown content');
    assert.ok(response.text.includes('<title>Test File</title>'), 'Should have title from front-matter');
  });
});