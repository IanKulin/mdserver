import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import { HtmlDiffer } from 'html-differ';

// Import the app
import { app } from '../server.js';

const htmlDiffer = new HtmlDiffer({
  ignoreAttributes: [],
  compareAttributesAsJSON: [],
  ignoreWhitespaces: true,
  ignoreComments: true,
  ignoreEndTags: false,
  ignoreDuplicateAttributes: false
});

describe('Baseline Showdown Output Tests', () => {
  // Test cases with various markdown features
  const testCases = [
    {
      name: 'headers and emphasis',
      markdown: '# H1\n## H2\n**bold** and *italic*',
      expectedPattern: /<h1.*>H1<\/h1>.*<h2.*>H2<\/h2>.*<strong>bold<\/strong>.*<em>italic<\/em>/s
    },
    {
      name: 'lists',
      markdown: '- Item 1\n- Item 2\n  - Nested\n\n1. Ordered\n2. List',
      expectedPattern: /<ul>.*<li>Item 1<\/li>.*<li>Item 2<\/li>.*<li>Nested<\/li>.*<\/ul>.*<ol>.*<li>Ordered<\/li>.*<li>List<\/li>.*<\/ol>/s
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
    test(`baseline output for ${name}`, async () => {
      // Import showdown and convert markdown the same way the server does
      const Showdown = await import('showdown');
      const converter = new Showdown.default.Converter();
      const html = converter.makeHtml(markdown);
      
      // Store baseline output for comparison after migration
      assert.match(html, expectedPattern, `Baseline output should match expected pattern for ${name}`);
      
      // Store the actual HTML for future comparison
      console.log(`Baseline HTML for ${name}:`, html);
    });
  });

  test('front-matter handling baseline', async () => {
    const markdownWithFrontMatter = `---
title: Test Title
author: Test Author
---

# Content

This is test content.`;

    // Test how showdown handles front-matter (it should pass it through)
    const Showdown = await import('showdown');
    const converter = new Showdown.default.Converter();
    const html = converter.makeHtml(markdownWithFrontMatter);
    
    // Showdown will convert the front-matter as regular content
    console.log('Baseline front-matter handling:', html);
    
    // This establishes the baseline - front-matter gets converted as regular markdown
    assert.ok(html.includes('title: Test Title'), 'Front-matter should be preserved in baseline');
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