/**
 * JSON Error Handling Tests
 *
 * Comprehensive test suite for JSON parsing error handling middleware.
 * Verifies that malformed JSON and oversized payloads are properly handled
 * with appropriate error responses instead of server crashes.
 *
 * Test Coverage:
 * - Malformed JSON returns 400 Bad Request
 * - Incomplete JSON returns 400 Bad Request
 * - Trailing commas return 400 Bad Request
 * - Empty body validation
 * - Valid JSON still works (backward compatibility)
 * - Error handling on different HTTP methods (POST, PUT)
 * - Oversized payload returns 413 Payload Too Large
 * - GET requests unaffected by JSON parsing
 * - Health check endpoint unaffected
 */

const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/Task');

beforeEach(() => {
  Task.deleteAll();
});

describe('JSON Error Handling', () => {
  describe('Malformed JSON', () => {
    it('should return 400 for malformed JSON with missing quotes', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('{"title": invalid json here}');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid JSON in request body');
      expect(res.body.details).toBeDefined();
    });

    it('should return 400 for incomplete JSON', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('{"title": "Test"');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid JSON in request body');
    });

    it('should return 400 for JSON with trailing comma', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('{"title": "Test",}');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid JSON in request body');
    });

    it('should handle empty body gracefully', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('');

      // Empty body is valid JSON parsing (results in undefined body)
      // but should fail validation for missing required fields
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Valid JSON (Backward Compatibility)', () => {
    it('should accept valid JSON and create task successfully', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          title: 'Valid Task',
          description: 'This is a valid task'
        }));

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Valid Task');
    });
  });

  describe('Different HTTP Methods', () => {
    it('should handle malformed JSON on PUT requests', async () => {
      // Create a task first
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original Task', description: 'Original' });

      const taskId = createRes.body.data.id;

      // Try to update with malformed JSON
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Content-Type', 'application/json')
        .send('{"title": broken json}');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid JSON in request body');
    });
  });

  describe('Payload Size Limits', () => {
    it('should return 413 for oversized payload', async () => {
      // Create a payload larger than 10KB limit
      const largeString = 'a'.repeat(11 * 1024); // 11KB string
      const largePayload = JSON.stringify({
        title: 'Task',
        description: largeString
      });

      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send(largePayload);

      expect(res.statusCode).toBe(413);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Payload too large');
      expect(res.body.details).toContain('10KB');
    });

    it('should accept payload within size limit', async () => {
      // Create a payload well within 10KB limit
      const normalString = 'a'.repeat(1000); // 1KB string
      const normalPayload = {
        title: 'Normal Task',
        description: normalString
      };

      const res = await request(app)
        .post('/api/tasks')
        .send(normalPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Non-JSON Endpoints', () => {
    it('should not affect GET requests', async () => {
      const res = await request(app)
        .get('/api/tasks');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not affect health check endpoint', async () => {
      const res = await request(app)
        .get('/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });
});
