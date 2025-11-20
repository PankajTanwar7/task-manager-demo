/**
 * Task API Endpoint Tests
 *
 * Comprehensive test suite for task management CRUD operations.
 * Tests all endpoints under /api/tasks for proper functionality,
 * validation, and error handling.
 *
 * Test Coverage:
 * - POST /api/tasks - Task creation with validation
 * - GET /api/tasks - Retrieve all tasks
 * - GET /api/tasks/:id - Retrieve single task
 * - PUT /api/tasks/:id - Update task (partial updates supported)
 * - DELETE /api/tasks/:id - Delete task
 *
 * Each test runs in isolation with clean state (beforeEach clears all tasks)
 */

const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/Task');

/**
 * Clear all tasks before each test
 * Ensures test isolation and prevents test interdependencies
 */
beforeEach(() => {
  Task.deleteAll();
});

describe('Task API Endpoints', () => {
  describe('POST /api/tasks', () => {
    /**
     * Test successful task creation with both title and description
     * Verifies: 201 status, success flag, all task properties, default completed=false
     */
    it('should create a new task with valid data', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe('Test Task');
      expect(res.body.data.description).toBe('Test Description');
      expect(res.body.data.completed).toBe(false);
    });

    /**
     * Test task creation with only required field (title)
     * Verifies: description defaults to empty string when omitted
     */
    it('should create a task without description', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Task');
      expect(res.body.data.description).toBe('');
    });

    /**
     * Test validation: title is required
     * Verifies: 400 status and validation error when title is missing
     */
    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          description: 'Description without title'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation failed');
    });

    /**
     * Test validation: title cannot be empty/whitespace only
     * Verifies: 400 status when title is trimmed to empty string
     */
    it('should return 400 when title is empty', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: '   ',
          description: 'Test'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    /**
     * Test validation: title has maximum length of 200 characters
     * Verifies: 400 status when title exceeds character limit
     */
    it('should return 400 when title exceeds 200 characters', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'a'.repeat(201)
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    /**
     * Test retrieving tasks when database is empty
     * Verifies: 200 status, empty data array, count = 0
     */
    it('should return empty array when no tasks exist', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    /**
     * Test retrieving multiple tasks
     * Verifies: 200 status, correct array length, count matches array length
     */
    it('should return all tasks', async () => {
      // Create test tasks directly using Task model
      Task.create('Task 1', 'Description 1');
      Task.create('Task 2', 'Description 2');

      const res = await request(app).get('/api/tasks');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.count).toBe(2);
    });
  });

  describe('GET /api/tasks/:id', () => {
    /**
     * Test retrieving a specific task by its ID
     * Verifies: 200 status, correct task data returned
     */
    it('should return a task by ID', async () => {
      const task = Task.create('Test Task', 'Test Description');

      const res = await request(app).get(`/api/tasks/${task.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(task.id);
      expect(res.body.data.title).toBe('Test Task');
    });

    /**
     * Test error handling for non-existent task ID
     * Verifies: 404 status with appropriate error message
     */
    it('should return 404 for non-existent task', async () => {
      const res = await request(app).get('/api/tasks/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Task not found');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    /**
     * Test successful task update with all fields
     * Verifies: 200 status, all fields updated correctly (supports full update)
     */
    it('should update a task', async () => {
      const task = Task.create('Original Title', 'Original Description');

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description',
          completed: true
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.description).toBe('Updated Description');
      expect(res.body.data.completed).toBe(true);
    });

    /**
     * Test error handling when updating non-existent task
     * Verifies: 404 status when task ID doesn't exist
     */
    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .put('/api/tasks/999')
        .send({
          title: 'Updated'
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    /**
     * Test validation: update requires at least one field
     * Verifies: 400 status when request body is completely empty
     */
    it('should return 400 when update body is empty', async () => {
      const task = Task.create('Test Task', 'Description');

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('At least one field');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    /**
     * Test successful task deletion
     * Verifies: 200 status, success message, task is actually removed from storage
     */
    it('should delete a task', async () => {
      const task = Task.create('Task to delete', 'Description');

      const res = await request(app).delete(`/api/tasks/${task.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Task deleted successfully');

      // Verify task is actually deleted from storage (not just returning success)
      const tasks = Task.findAll();
      expect(tasks).toHaveLength(0);
    });

    /**
     * Test error handling when deleting non-existent task
     * Verifies: 404 status when task ID doesn't exist
     */
    it('should return 404 for non-existent task', async () => {
      const res = await request(app).delete('/api/tasks/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
