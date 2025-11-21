const request = require('supertest');
const app = require('../src/app');

describe('JSON Error Handling', () => {
  describe('POST /api/tasks with malformed JSON', () => {
    it('should return 400 for malformed JSON', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('{"title": "Test", "description": invalid json}')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid JSON in request body');
      expect(res.body.details).toBeDefined();
    });

    it('should return 400 for incomplete JSON', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('{"title": "Test"')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid JSON in request body');
    });

    it('should return 400 for JSON with trailing comma', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('{"title": "Test",}')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid JSON in request body');
    });

    it('should return 400 for empty request body with JSON content type', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('')
        .expect(400);

      expect(res.body.success).toBe(false);
      // Empty body is caught by validation, not JSON parser
      expect(res.body.error).toMatch(/required|failed/i);
    });

    it('should handle valid JSON correctly (backward compatibility)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send({ title: 'Valid Task', description: 'This should work' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Valid Task');
    });
  });

  describe('PUT /api/tasks/:id with malformed JSON', () => {
    it('should return 400 for malformed JSON on update', async () => {
      // First create a task
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task to Update' });

      const taskId = createRes.body.data.id;

      // Try to update with malformed JSON
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Content-Type', 'application/json')
        .send('{"title": malformed}')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid JSON in request body');
    });
  });

  describe('Payload size limits', () => {
    it('should return 413 for oversized JSON payload', async () => {
      // Create a payload larger than 10KB
      const largeDescription = 'x'.repeat(11 * 1024); // 11KB

      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send({ title: 'Large Task', description: largeDescription })
        .expect(413);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Request body too large');
      expect(res.body.details).toBe('Maximum size is 10KB');
    });

    it('should accept payloads under the limit', async () => {
      // Create a payload under 10KB but within validation limits (max 1000 chars)
      const description = 'x'.repeat(900);

      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send({ title: 'Normal Task', description })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toHaveLength(900);
    });
  });

  describe('Error handling does not affect other routes', () => {
    it('should not interfere with GET requests', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should not interfere with health check', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
    });
  });
});
