/**
 * Tests for /api/hello endpoint
 */

const request = require('supertest');
const app = require('../src/app');

describe('GET /api/hello', () => {
  it('should return 200 and greeting message', async () => {
    const res = await request(app)
      .get('/api/hello')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Hello, World!');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return a valid ISO 8601 timestamp', async () => {
    const res = await request(app)
      .get('/api/hello')
      .expect(200);

    const timestamp = res.body.timestamp;
    expect(timestamp).toBeDefined();

    // Verify it's a valid ISO 8601 date string
    const date = new Date(timestamp);
    expect(date.toISOString()).toBe(timestamp);

    // Verify timestamp is recent (within last 5 seconds)
    const now = new Date();
    const diff = now - date;
    expect(diff).toBeLessThan(5000); // 5 seconds
  });

  it('should return current timestamp on each request', async () => {
    const res1 = await request(app).get('/api/hello').expect(200);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    const res2 = await request(app).get('/api/hello').expect(200);

    // Timestamps should be different
    expect(res1.body.timestamp).not.toBe(res2.body.timestamp);
  });

  it('should have correct response structure', async () => {
    const res = await request(app)
      .get('/api/hello')
      .expect(200);

    expect(Object.keys(res.body).sort()).toEqual(['message', 'success', 'timestamp'].sort());
  });
});
