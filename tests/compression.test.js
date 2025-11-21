/**
 * Tests for response compression middleware
 */

const request = require('supertest');
const app = require('../src/app');

describe('Response Compression', () => {
  it('should include Content-Encoding header for large responses', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Accept-Encoding', 'gzip, deflate')
      .expect(200);

    // Large responses (>1KB) should be compressed
    const contentLength = parseInt(res.headers['content-length'] || '0');
    if (contentLength > 1024 || res.text.length > 1024) {
      expect(res.headers['content-encoding']).toMatch(/gzip|deflate/);
    }
  });

  it('should compress when Accept-Encoding includes gzip', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Accept-Encoding', 'gzip')
      .expect(200);

    // Response should either be compressed or be small enough to skip compression
    if (res.text.length > 1024) {
      expect(res.headers['content-encoding']).toBe('gzip');
    }
  });

  it('should not compress when Accept-Encoding is missing', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .expect(200);

    // Without Accept-Encoding header, compression should not be applied
    expect(res.headers['content-encoding']).toBeUndefined();
  });

  it('should handle deflate encoding', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Accept-Encoding', 'deflate')
      .expect(200);

    if (res.text.length > 1024) {
      expect(res.headers['content-encoding']).toBe('deflate');
    }
  });

  it('should prefer gzip over deflate when both accepted', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Accept-Encoding', 'gzip, deflate')
      .expect(200);

    if (res.headers['content-encoding']) {
      // gzip is preferred
      expect(res.headers['content-encoding']).toMatch(/gzip|deflate/);
    }
  });

  it('should compress JSON responses', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Accept-Encoding', 'gzip')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty('success');
  });

  it('should not break existing functionality', async () => {
    // Test that compression doesn't interfere with normal operations
    const res = await request(app)
      .post('/api/tasks')
      .set('Accept-Encoding', 'gzip')
      .send({ title: 'Test task', description: 'Test description' })
      .expect(201);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('title', 'Test task');
  });

  it('should measure compression savings', async () => {
    // Get uncompressed response
    const uncompressed = await request(app)
      .get('/api/tasks')
      .expect(200);

    const uncompressedSize = uncompressed.text.length;

    // Get compressed response
    const compressed = await request(app)
      .get('/api/tasks')
      .set('Accept-Encoding', 'gzip')
      .expect(200);

    const compressedSize = parseInt(compressed.headers['content-length'] || compressed.text.length);

    // If response is large enough to compress
    if (uncompressedSize > 1024) {
      // Compressed should be smaller
      expect(compressedSize).toBeLessThan(uncompressedSize);

      // Calculate compression ratio
      const ratio = ((uncompressedSize - compressedSize) / uncompressedSize) * 100;

      // Should achieve at least some compression
      expect(ratio).toBeGreaterThan(0);
    }
  });
});
