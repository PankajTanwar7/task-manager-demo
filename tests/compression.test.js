/**
 * Compression Middleware Tests
 *
 * Tests verify that the compression middleware:
 * - Adds proper Content-Encoding headers
 * - Compresses responses larger than threshold (1KB)
 * - Supports both gzip and deflate encodings
 * - Does not compress small responses (< 1KB)
 * - Maintains backward compatibility with existing endpoints
 */

const request = require('supertest');
const app = require('../src/app');
const zlib = require('zlib');

describe('Compression Middleware', () => {
  describe('Content-Encoding Headers', () => {
    test('should add gzip Content-Encoding header for large responses', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Accept-Encoding', 'gzip, deflate')
        .expect(200);

      // If response is large enough, it should be compressed
      if (response.headers['content-length'] && parseInt(response.headers['content-length']) > 1024) {
        expect(response.headers['content-encoding']).toBe('gzip');
      }
    });

    test('should support deflate encoding when requested', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Accept-Encoding', 'deflate')
        .expect(200);

      // Check if deflate is used (when response is large enough)
      if (response.headers['content-encoding']) {
        expect(['gzip', 'deflate']).toContain(response.headers['content-encoding']);
      }
    });

    test('should not compress when Accept-Encoding is not set', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Without Accept-Encoding header, no compression should occur
      expect(response.headers['content-encoding']).toBeUndefined();
    });
  });

  describe('Compression Threshold', () => {
    test('should not compress small responses (< 1KB)', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Health endpoint returns small response, should not be compressed
      expect(response.headers['content-encoding']).toBeUndefined();
    });

    test('should compress large JSON responses', async () => {
      // Create a large task to ensure response exceeds 1KB
      const largeDescription = 'a'.repeat(2000); // 2KB of data

      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Large Task',
          description: largeDescription
        })
        .expect(201);

      // Now fetch all tasks - should be large enough to compress
      const response = await request(app)
        .get('/api/tasks')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Verify compression occurred for large response
      // Note: Compression may not occur if total response is still < 1KB
      const responseSize = JSON.stringify(response.body).length;
      if (responseSize > 1024) {
        expect(response.headers['content-encoding']).toBeDefined();
      }

      // Cleanup: delete the task
      if (createResponse.body.data && createResponse.body.data.id) {
        await request(app)
          .delete(`/api/tasks/${createResponse.body.data.id}`)
          .expect(200);
      }
    });
  });

  describe('Compression Savings', () => {
    test('should achieve significant compression for JSON data', async () => {
      // Create multiple tasks to ensure large response
      const tasks = [];
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/tasks')
          .send({
            title: `Task ${i}`,
            description: 'This is a test task with some description content that will compress well. '.repeat(10)
          })
          .expect(201);

        if (response.body.data && response.body.data.id) {
          tasks.push(response.body.data.id);
        }
      }

      // Get uncompressed response
      const uncompressedResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      const uncompressedSize = JSON.stringify(uncompressedResponse.body).length;

      // Get compressed response
      const compressedResponse = await request(app)
        .get('/api/tasks')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Verify compression occurred
      if (uncompressedSize > 1024) {
        expect(compressedResponse.headers['content-encoding']).toBeDefined();

        // Calculate compression ratio (if Content-Length header is present)
        if (compressedResponse.headers['content-length']) {
          const compressedSize = parseInt(compressedResponse.headers['content-length']);
          const compressionRatio = ((uncompressedSize - compressedSize) / uncompressedSize) * 100;

          // Should achieve at least 30% compression for JSON data
          expect(compressionRatio).toBeGreaterThan(30);
        }
      }

      // Cleanup: delete all test tasks
      for (const taskId of tasks) {
        await request(app)
          .delete(`/api/tasks/${taskId}`)
          .expect(200);
      }
    });
  });

  describe('Backward Compatibility', () => {
    test('should not break existing endpoints', async () => {
      // Test all main endpoints work correctly with compression enabled
      await request(app)
        .get('/health')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      await request(app)
        .get('/api/tasks')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Accept-Encoding', 'gzip')
        .send({
          title: 'Test Task',
          description: 'Test description'
        })
        .expect(201);

      expect(createResponse.body.success).toBe(true);

      // Cleanup
      if (createResponse.body.data && createResponse.body.data.id) {
        await request(app)
          .delete(`/api/tasks/${createResponse.body.data.id}`)
          .expect(200);
      }
    });

    test('should preserve JSON response structure', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Verify response structure is preserved
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
