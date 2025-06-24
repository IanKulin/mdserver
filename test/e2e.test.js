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
    // Test existing files handle various markdown complexity
    const response = await request(app)
      .get('/index.md')
      .expect(200);

    // Verify basic markdown features are converted
    assert.ok(response.text.includes('<h1'), 'Should handle headers');
    assert.ok(response.text.includes('<ul>') || response.text.includes('<ol>'), 'Should handle lists');
  });

  test('should return 413 for files larger than 1MB', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const testFilePath = path.join(__dirname, '..', 'public', 'large-test.md');
    
    // Create a file larger than 1MB (1024 * 1024 bytes)
    const largeContent = '# Large File\n' + 'x'.repeat(1024 * 1024 + 1);
    
    try {
      await fs.promises.writeFile(testFilePath, largeContent);
      
      await request(app)
        .get('/large-test.md')
        .expect(413)
        .expect('File too large');
    } finally {
      // Clean up the test file
      try {
        await fs.promises.unlink(testFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  test('should serve welcome page when index.md is missing', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const indexPath = path.join(__dirname, '..', 'public', 'index.md');
    const backupPath = path.join(__dirname, '..', 'public', 'index.md.backup');
    
    let indexExists = false;
    
    try {
      // Check if index.md exists and back it up
      await fs.promises.access(indexPath);
      await fs.promises.rename(indexPath, backupPath);
      indexExists = true;
    } catch {
      // index.md doesn't exist, which is what we want for this test
    }
    
    try {
      const response = await request(app)
        .get('/index.md')
        .expect(200)
        .expect('Content-Type', /text\/html/);
      
      // Check for welcome page content
      assert.ok(response.text.includes('mdserver - welcome'), 'Should have welcome page title');
      assert.ok(response.text.includes('You\'ve successfully installed'), 'Should have welcome message');
      assert.ok(response.text.includes('create a <code>public</code> directory'), 'Should have instructions');
      assert.ok(response.text.includes('GitHub page'), 'Should have GitHub link');
      assert.ok(response.text.includes('template.html'), 'Should mention template');
    } finally {
      // Restore index.md if it existed
      if (indexExists) {
        try {
          await fs.promises.rename(backupPath, indexPath);
        } catch {
          // Ignore restore errors
        }
      }
    }
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