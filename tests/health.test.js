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

    it('should return status field', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data.status).toBe('ok');
    });

    it('should return uptime field as number', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.data).toHaveProperty('uptime');
      expect(typeof res.body.data.uptime).toBe('number');
      expect(res.body.data.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return timestamp field in ISO format', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.data).toHaveProperty('timestamp');

      // Validate ISO 8601 format
      const timestamp = new Date(res.body.data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toISOString()).toBe(res.body.data.timestamp);
    });

    it('should return all required fields', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toMatchObject({
        success: true,
        data: {
          status: expect.any(String),
          uptime: expect.any(Number),
          timestamp: expect.any(String)
        }
      });
    });
  });
});
