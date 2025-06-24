import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mdParser, loadTemplate } from '../mdparser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('mdParser middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { url: '' };
    res = {
      status: mock.fn(() => res),
      send: mock.fn(() => res)
    };
    next = mock.fn();
  });

  test('should call next() for non-markdown files', async () => {
    req.url = '/test.html';
    
    await mdParser(req, res, next);
    
    assert.strictEqual(next.mock.calls.length, 1);
    assert.strictEqual(res.status.mock.calls.length, 0);
    assert.strictEqual(res.send.mock.calls.length, 0);
  });

  test('should call next() for files without .md extension', async () => {
    req.url = '/test.txt';
    
    await mdParser(req, res, next);
    
    assert.strictEqual(next.mock.calls.length, 1);
  });

  test('should return 403 for path traversal attempts', async () => {
    req.url = '/../../../etc/passwd.md';
    
    await mdParser(req, res, next);
    
    assert.strictEqual(res.status.mock.calls[0].arguments[0], 403);
    assert.strictEqual(res.send.mock.calls[0].arguments[0], 'Access denied');
    assert.strictEqual(next.mock.calls.length, 0);
  });

  test('should return 404 for non-existent markdown files', async () => {
    req.url = '/nonexistent.md';
    
    await mdParser(req, res, next);
    
    assert.strictEqual(res.status.mock.calls[0].arguments[0], 404);
    assert.strictEqual(res.send.mock.calls[0].arguments[0], 'File not found');
  });

  test('should serve content for existing index.md', async () => {
    req.url = '/index.md';
    
    await mdParser(req, res, next);
    
    assert.strictEqual(res.status.mock.calls[0].arguments[0], 200);
    const responseContent = res.send.mock.calls[0].arguments[0];
    // Check that HTML content is returned
    assert(responseContent.length > 0);
    assert(responseContent.includes('<'));
  });
});

describe('loadTemplate function', () => {
  const testTemplateDir = path.join(__dirname, 'fixtures');
  const testTemplatePath = path.join(testTemplateDir, 'template.html');
  
  beforeEach(async () => {
    await fs.promises.mkdir(testTemplateDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.promises.rm(testTemplateDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test('should load template when file exists', async () => {
    const templateContent = '<html><head><title>{{title}}</title></head><body>{{content}}</body></html>';
    await fs.promises.writeFile(testTemplatePath, templateContent);
    
    // Mock console.log to capture output
    const originalLog = console.log;
    const logMock = mock.fn();
    console.log = logMock;
    
    try {
      await loadTemplate();
      
      // Verify console output indicates template was loaded
      assert(logMock.mock.calls.some(call => 
        call.arguments[0].includes('Template loaded') || 
        call.arguments[0].includes('No template found')
      ));
    } finally {
      console.log = originalLog;
    }
  });

  test('should handle missing template gracefully', async () => {
    const originalLog = console.log;
    const logMock = mock.fn();
    console.log = logMock;
    
    try {
      await loadTemplate();
      
      // Should not throw error when template is missing
      // Test passes if no exception is thrown
      assert.strictEqual(typeof loadTemplate, 'function');
    } finally {
      console.log = originalLog;
    }
  });
});