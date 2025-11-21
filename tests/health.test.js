
const request = require('supertest');
const app = require('../src/app');

describe('Health Endpoint', () => {
  describe('GET /health', () => {

    it('should return 200 OK', async () => {
      const res = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
    });


    it('should return status and message fields', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('message', 'Task Manager API is running');
    });

    /**
     * Verify that response contains uptime (number >= 0) and environment
     * fields with valid values (development/production/test)
     */
    it('should return uptime and environment fields', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('uptime');
      expect(typeof res.body.uptime).toBe('number');
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);

      expect(res.body).toHaveProperty('environment');
      expect(res.body.environment).toMatch(/development|production|test/);
    });

    /**
     * Verify that timestamp field is present and in valid ISO 8601 format
     * Tests that the timestamp can be parsed and round-trips correctly
     */
    it('should return timestamp in ISO format', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('timestamp');

      // Validate ISO 8601 format by parsing and round-tripping
      // Validate ISO 8601 format
      const timestamp = new Date(res.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toISOString()).toBe(res.body.timestamp);
    });

    /**
     * Verify complete response structure
     * Ensures all required fields are present with correct types
     * and that response is flat (no nested data object)
     */
    it('should return all required fields in flat format', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toMatchObject({
        success: true,
        status: expect.any(String),
        message: expect.any(String),
        uptime: expect.any(Number),
        timestamp: expect.any(String),
        environment: expect.any(String)
      });

      // Should NOT have nested data object
      expect(res.body.data).toBeUndefined();
    });
  });
});
