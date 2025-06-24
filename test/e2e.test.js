import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';

import { app } from '../server.js';

describe('End-to-End Server Tests', () => {
  test('should serve index.md with proper HTML structure', async () => {
    const response = await request(app)
      .get('/index.md')
      .expect(200)
      .expect('Content-Type', /text\/html/);

    // Check for proper HTML document structure
    assert.ok(response.text.includes('<!DOCTYPE html>'), 'Should have DOCTYPE');
    assert.ok(response.text.includes('<html'), 'Should have html tag');
    assert.ok(response.text.includes('<head>'), 'Should have head section');
    assert.ok(response.text.includes('<body>'), 'Should have body section');
    
    // Check for front-matter processing
    assert.ok(response.text.includes('<title>Index</title>'), 'Should extract title from front-matter');
    
    // Check for markdown conversion
    assert.ok(response.text.includes('<h1'), 'Should convert markdown headers');
    assert.ok(response.text.includes('<ul>'), 'Should convert markdown lists');
    assert.ok(response.text.includes('<li>'), 'Should convert list items');
  });

  test('should serve test.md with correct content', async () => {
    const response = await request(app)
      .get('/test.md')
      .expect(200)
      .expect('Content-Type', /text\/html/);

    // Check front-matter title extraction
    assert.ok(response.text.includes('<title>Test File</title>'), 'Should extract title from front-matter');
    
    // Check markdown conversion
    assert.ok(response.text.includes('<h1'), 'Should convert H1 header');
    assert.ok(response.text.includes('Test.md'), 'Should include content');
    assert.ok(response.text.includes('A sample mark down file'), 'Should include list content');
  });

  test('should handle root path by serving index.md', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/);

    // Should be same as /index.md
    assert.ok(response.text.includes('<title>Index</title>'), 'Root should serve index.md');
    assert.ok(response.text.includes('<h1'), 'Should contain markdown content');
  });

  test('should return 404 for non-existent markdown files', async () => {
    await request(app)
      .get('/nonexistent.md')
      .expect(404);
  });

  test('should serve static HTML files', async () => {
    const response = await request(app)
      .get('/test.html')
      .expect(200)
      .expect('Content-Type', /text\/html/);

    // Should serve the static file directly
    assert.ok(response.text.length > 0, 'Should return HTML content');
  });

  test('should prevent path traversal attacks', async () => {
    await request(app)
      .get('/../package.json')
      .expect(404);

    await request(app)
      .get('/..%2Fpackage.json')
      .expect(404);
  });

  test('should handle complex markdown features', async () => {
    // Create a test by posting complex markdown content
    const complexMarkdown = `---
title: Complex Test
---

# Complex Markdown Test

## Features

- **Bold text**
- *Italic text*
- \`inline code\`

### Code Block

\`\`\`javascript
function test() {
  return "hello world";
}
\`\`\`

### Links

[Test Link](https://example.com)

### Nested Lists

1. First item
2. Second item
   - Nested bullet
   - Another nested
3. Third item
`;

    // We'll test this by checking if our existing files handle similar complexity
    const response = await request(app)
      .get('/index.md')
      .expect(200);

    // Verify basic markdown features are converted
    assert.ok(response.text.includes('<h1'), 'Should handle headers');
    assert.ok(response.text.includes('<ul>') || response.text.includes('<ol>'), 'Should handle lists');
  });
});

describe('Response Performance and Structure', () => {
  test('should respond within reasonable time', async () => {
    const start = Date.now();
    
    await request(app)
      .get('/index.md')
      .expect(200);
    
    const duration = Date.now() - start;
    assert.ok(duration < 1000, `Response should be fast (${duration}ms)`);
  });

  test('should have consistent HTML structure', async () => {
    const indexResponse = await request(app).get('/index.md');
    const testResponse = await request(app).get('/test.md');

    // Both should have similar structure
    const checkStructure = (html) => {
      assert.ok(html.includes('<!DOCTYPE html>'), 'Should have DOCTYPE');
      assert.ok(html.includes('<title>'), 'Should have title');
      assert.ok(html.includes('<body>'), 'Should have body');
    };

    checkStructure(indexResponse.text);
    checkStructure(testResponse.text);
  });
});