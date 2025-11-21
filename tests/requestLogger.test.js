/**
 * Tests for request logging middleware
 */

const request = require('supertest');
const app = require('../src/app');
const logger = require('../src/utils/logger');

// Mock the logger to capture log calls
jest.mock('../src/utils/logger');

describe('Request Logging Middleware', () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  it('should log API requests with correct format', async () => {
    await request(app)
      .get('/api/hello')
      .expect(200);

    // Verify logger.info was called
    expect(logger.info).toHaveBeenCalled();

    // Get the log message
    const logMessage = logger.info.mock.calls[0][0];

    // Verify log format: [TIMESTAMP] METHOD /path - STATUS (XXXms)
    expect(logMessage).toMatch(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] GET \/api\/hello - 200 \(\d+ms\)/);
  });

  it('should log POST requests', async () => {
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Test task', description: 'Test description' })
      .expect(201);

    expect(logger.info).toHaveBeenCalled();
    const logMessage = logger.info.mock.calls[0][0];

    expect(logMessage).toMatch(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] POST \/api\/tasks - 201 \(\d+ms\)/);
  });

  it('should NOT log health check endpoint', async () => {
    await request(app)
      .get('/health')
      .expect(200);

    // Logger should not have been called for /health
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('should log response time in milliseconds', async () => {
    await request(app)
      .get('/api/hello')
      .expect(200);

    const logMessage = logger.info.mock.calls[0][0];

    // Extract duration from log message
    const durationMatch = logMessage.match(/\((\d+)ms\)/);
    expect(durationMatch).not.toBeNull();

    const duration = parseInt(durationMatch[1]);
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(duration).toBeLessThan(1000); // Should be fast
  });

  it('should log 404 errors', async () => {
    await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(logger.info).toHaveBeenCalled();
    const logMessage = logger.info.mock.calls[0][0];

    expect(logMessage).toMatch(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] GET \/api\/nonexistent - 404 \(\d+ms\)/);
  });

  it('should log multiple requests independently', async () => {
    // Make 3 requests
    await request(app).get('/api/hello').expect(200);
    await request(app).get('/api/tasks').expect(200);
    await request(app).get('/api/hello').expect(200);

    // Should have 3 log calls
    expect(logger.info).toHaveBeenCalledTimes(3);

    // Verify each log message
    const logs = logger.info.mock.calls.map(call => call[0]);
    expect(logs[0]).toContain('GET /api/hello');
    expect(logs[1]).toContain('GET /api/tasks');
    expect(logs[2]).toContain('GET /api/hello');
  });

  it('should include timestamp in correct format', async () => {
    await request(app)
      .get('/api/hello')
      .expect(200);

    const logMessage = logger.info.mock.calls[0][0];

    // Extract timestamp
    const timestampMatch = logMessage.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
    expect(timestampMatch).not.toBeNull();

    const timestamp = timestampMatch[1];

    // Verify timestamp format is correct (YYYY-MM-DD HH:MM:SS)
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);

    // Verify timestamp can be parsed as a valid date
    const timestampDate = new Date(timestamp + 'Z'); // Add Z to parse as UTC
    expect(timestampDate.toString()).not.toBe('Invalid Date');

    // Verify timestamp is recent (within last 24 hours to account for timezone differences)
    const now = new Date();
    const diff = Math.abs(now - timestampDate);
    expect(diff).toBeLessThan(24 * 60 * 60 * 1000); // 24 hours
  });

  it('should log different HTTP methods correctly', async () => {
    // Test GET
    await request(app).get('/api/tasks').expect(200);
    expect(logger.info.mock.calls[0][0]).toContain('GET /api/tasks');

    jest.clearAllMocks();

    // Test POST
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Test', description: 'Test' })
      .expect(201);
    expect(logger.info.mock.calls[0][0]).toContain('POST /api/tasks');

    jest.clearAllMocks();

    // Test DELETE
    await request(app).delete('/api/tasks/1').expect(200);
    expect(logger.info.mock.calls[0][0]).toContain('DELETE /api/tasks/1');
  });
});
