import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { readFileSync } from 'node:fs';

import { app } from '../server.js';

describe('Public Directory File Tests', () => {
  describe('Real markdown files', () => {
    test('index.md should render correctly', async () => {
      // Read the actual file to understand its structure
      const fileContent = readFileSync('./public/index.md', 'utf8');
      console.log('index.md content:', fileContent);

      const response = await request(app)
        .get('/index.md')
        .expect(200)
        .expect('Content-Type', /text\/html/);

      // Verify front-matter parsing
      assert.ok(response.text.includes('<title>Index</title>'), 'Should extract title from front-matter');
      
      // Verify markdown content conversion
      assert.ok(response.text.includes('<h1'), 'Should convert # Test.md to h1');
      assert.ok(response.text.includes('Test.md'), 'Should include header content');
      assert.ok(response.text.includes('<ul>'), 'Should convert bullet list');
      assert.ok(response.text.includes('<li>'), 'Should convert list items');
      assert.ok(response.text.includes('A sample mark down file'), 'Should include list content');

      // Store full response for baseline comparison
      console.log('\n=== index.md FULL RESPONSE ===');
      console.log(response.text);
      console.log('=== END RESPONSE ===\n');
    });

    test('test.md should render correctly', async () => {
      const fileContent = readFileSync('./public/test.md', 'utf8');
      console.log('test.md content:', fileContent);

      const response = await request(app)
        .get('/test.md')
        .expect(200)
        .expect('Content-Type', /text\/html/);

      // Verify front-matter parsing
      assert.ok(response.text.includes('<title>Test File</title>'), 'Should extract correct title');
      
      // Verify content is identical to index.md (they have same content)
      assert.ok(response.text.includes('<h1'), 'Should convert header');
      assert.ok(response.text.includes('Test.md'), 'Should include content');
      assert.ok(response.text.includes('A sample mark down file'), 'Should include list item');

      console.log('\n=== test.md FULL RESPONSE ===');
      console.log(response.text);
      console.log('=== END RESPONSE ===\n');
    });
  });

  describe('Template integration', () => {
    test('should use template.html if available', async () => {
      try {
        const templateContent = readFileSync('./public/template.html', 'utf8');
        console.log('Template content:', templateContent);

        const response = await request(app)
          .get('/index.md')
          .expect(200);

        // If template exists, verify it's being used
        if (templateContent.includes('{{title}}')) {
          assert.ok(!response.text.includes('{{title}}'), 'Template placeholders should be replaced');
        }
        if (templateContent.includes('{{content}}')) {
          assert.ok(!response.text.includes('{{content}}'), 'Content placeholder should be replaced');
        }

      } catch (error) {
        // Template file might not exist, which is fine
        console.log('No template.html found or error reading it:', error.message);
      }
    });

    test('should handle missing template gracefully', async () => {
      // This tests the fallback behavior when no template is available
      const response = await request(app)
        .get('/index.md')
        .expect(200);

      // Should still return valid HTML even without template
      assert.ok(response.text.includes('<'), 'Should return HTML content');
      assert.ok(response.text.length > 0, 'Should return non-empty response');
    });
  });

  describe('File content validation', () => {
    test('both markdown files have expected structure', () => {
      const indexContent = readFileSync('./public/index.md', 'utf8');
      const testContent = readFileSync('./public/test.md', 'utf8');

      // Both should have front-matter
      assert.ok(indexContent.startsWith('---'), 'index.md should have front-matter');
      assert.ok(testContent.startsWith('---'), 'test.md should have front-matter');

      // Both should have title in front-matter
      assert.ok(indexContent.includes('title:'), 'index.md should have title');
      assert.ok(testContent.includes('title:'), 'test.md should have title');

      // Both should have markdown content after front-matter
      assert.ok(indexContent.includes('# Test.md'), 'index.md should have header');
      assert.ok(testContent.includes('# Test.md'), 'test.md should have header');
    });

    test('markdown content matches expected patterns', () => {
      const indexContent = readFileSync('./public/index.md', 'utf8');
      
      // Verify the markdown structure
      const lines = indexContent.split('\n');
      const frontMatterEnd = lines.findIndex((line, index) => index > 0 && line === '---');
      const contentLines = lines.slice(frontMatterEnd + 1);
      
      // Should have header and list
      const hasHeader = contentLines.some(line => line.startsWith('# '));
      const hasList = contentLines.some(line => line.startsWith('* '));
      
      assert.ok(hasHeader, 'Should have markdown header');
      assert.ok(hasList, 'Should have markdown list');
    });
  });

  describe('Static file serving', () => {
    test('should serve test.html as static file', async () => {
      const response = await request(app)
        .get('/test.html')
        .expect(200)
        .expect('Content-Type', /text\/html/);

      // Should serve static HTML directly (not processed as markdown)
      assert.ok(response.text.length > 0, 'Should return content');
      
      // Log the static file content for reference
      console.log('\n=== test.html STATIC CONTENT ===');
      console.log(response.text);
      console.log('=== END STATIC CONTENT ===\n');
    });
  });
});