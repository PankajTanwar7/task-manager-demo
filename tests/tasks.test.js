/**
 * Task API Endpoint Tests
 *
 * Comprehensive test suite for task management CRUD operations.
 * Tests all endpoints under /api/tasks for proper functionality,
 * validation, and error handling.
 *
 * Test Coverage:
 * - POST /api/tasks - Task creation with validation
 * - GET /api/tasks - Retrieve all tasks (with optional pagination)
 *   - Pagination: page/limit query params, metadata, sorting
 *   - Validation: invalid page/limit handling
 *   - Backward compatibility: works without pagination params
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
     * Test retrieving multiple tasks (backward compatibility - no pagination)
     * Verifies: 200 status, correct array length, count matches array length
     */
    it('should return all tasks without pagination params', async () => {
      // Create test tasks directly using Task model
      Task.create('Task 1', 'Description 1');
      Task.create('Task 2', 'Description 2');

      const res = await request(app).get('/api/tasks');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.count).toBe(2);
      // Verify no pagination metadata when params not provided
      expect(res.body.pagination).toBeUndefined();
    });

    /**
     * Test tasks are sorted newest first when no pagination
     * Verifies: tasks returned in descending order by createdAt (newest first)
     */
    it('should return tasks sorted newest first', async () => {
      // Create tasks in sequence (Task 3 will be newest)
      Task.create('Task 1', 'First');
      Task.create('Task 2', 'Second');
      Task.create('Task 3', 'Third');

      const res = await request(app).get('/api/tasks');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(3);
      // Newest task (Task 3) should be first in array
      expect(res.body.data[0].title).toBe('Task 3');
      expect(res.body.data[1].title).toBe('Task 2');
      expect(res.body.data[2].title).toBe('Task 1');
    });

    describe('Pagination', () => {
      /**
       * Test basic pagination: first page with limit
       * Verifies: correct number of items, pagination metadata, hasNextPage
       */
      it('should paginate tasks (page 1, limit 5)', async () => {
        // Create 12 tasks
        for (let i = 1; i <= 12; i++) {
          Task.create(`Task ${i}`, `Description ${i}`);
        }

        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 1, limit: 5 });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(5);

        // Verify pagination metadata
        expect(res.body.pagination).toEqual({
          total: 12,
          page: 1,
          limit: 5,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: false
        });

        // Verify sorting: newest first (Task 12 should be first)
        expect(res.body.data[0].title).toBe('Task 12');
        expect(res.body.data[4].title).toBe('Task 8');
      });

      /**
       * Test second page pagination
       * Verifies: correct items on page 2, hasPrevPage=true, hasNextPage=true
       */
      it('should return correct tasks on page 2', async () => {
        // Create 12 tasks
        for (let i = 1; i <= 12; i++) {
          Task.create(`Task ${i}`, `Description ${i}`);
        }

        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 2, limit: 5 });

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveLength(5);

        // Verify pagination metadata for middle page
        expect(res.body.pagination).toEqual({
          total: 12,
          page: 2,
          limit: 5,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: true
        });

        // Verify correct tasks on page 2 (Task 7-3, newest first)
        expect(res.body.data[0].title).toBe('Task 7');
        expect(res.body.data[4].title).toBe('Task 3');
      });

      /**
       * Test last page pagination
       * Verifies: partial results on last page, hasNextPage=false
       */
      it('should return correct tasks on last page', async () => {
        // Create 12 tasks
        for (let i = 1; i <= 12; i++) {
          Task.create(`Task ${i}`, `Description ${i}`);
        }

        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 3, limit: 5 });

        expect(res.statusCode).toBe(200);
        // Only 2 tasks on last page (12 total, 5 per page, page 3)
        expect(res.body.data).toHaveLength(2);

        expect(res.body.pagination).toEqual({
          total: 12,
          page: 3,
          limit: 5,
          totalPages: 3,
          hasNextPage: false,
          hasPrevPage: true
        });

        // Verify last 2 tasks (Task 2, Task 1)
        expect(res.body.data[0].title).toBe('Task 2');
        expect(res.body.data[1].title).toBe('Task 1');
      });

      /**
       * Test beyond last page
       * Verifies: empty array with correct metadata when page > totalPages
       */
      it('should return empty array when page exceeds total pages', async () => {
        // Create 5 tasks
        for (let i = 1; i <= 5; i++) {
          Task.create(`Task ${i}`, `Description ${i}`);
        }

        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 10, limit: 10 });

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual([]);

        // Metadata should still be correct
        expect(res.body.pagination).toEqual({
          total: 5,
          page: 10,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: true
        });
      });

      /**
       * Test pagination with only page parameter
       * Verifies: limit defaults to 10 when only page provided
       */
      it('should use default limit when only page provided', async () => {
        // Create 25 tasks
        for (let i = 1; i <= 25; i++) {
          Task.create(`Task ${i}`, `Description ${i}`);
        }

        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 2 });

        expect(res.statusCode).toBe(200);
        // Default limit is 10
        expect(res.body.data).toHaveLength(10);
        expect(res.body.pagination.limit).toBe(10);
        expect(res.body.pagination.page).toBe(2);
      });

      /**
       * Test pagination validation: invalid page number
       * Verifies: 400 status when page is 0 or negative
       */
      it('should return 400 for invalid page number (0)', async () => {
        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 0, limit: 10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Invalid query parameters');
      });

      /**
       * Test pagination validation: invalid page number (negative)
       * Verifies: 400 status for negative page numbers
       */
      it('should return 400 for invalid page number (negative)', async () => {
        const res = await request(app)
          .get('/api/tasks')
          .query({ page: -1, limit: 10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Invalid query parameters');
      });

      /**
       * Test pagination validation: limit too high
       * Verifies: 400 status when limit exceeds maximum (100)
       */
      it('should return 400 for limit exceeding maximum (100)', async () => {
        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 1, limit: 101 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Invalid query parameters');
      });

      /**
       * Test pagination validation: limit too low
       * Verifies: 400 status when limit is 0 or negative
       */
      it('should return 400 for invalid limit (0)', async () => {
        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 1, limit: 0 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Invalid query parameters');
      });

      /**
       * Test pagination validation: non-integer page
       * Verifies: 400 status when page is not an integer
       */
      it('should return 400 for non-integer page', async () => {
        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 'abc', limit: 10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Invalid query parameters');
      });

      /**
       * Test pagination with empty database
       * Verifies: empty array with correct metadata when no tasks exist
       */
      it('should handle pagination with empty database', async () => {
        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 1, limit: 10 });

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination).toEqual({
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      });

      /**
       * Test pagination metadata accuracy with exact page size
       * Verifies: metadata is correct when total is exact multiple of limit
       */
      it('should calculate metadata correctly when total is exact multiple of limit', async () => {
        // Create exactly 20 tasks
        for (let i = 1; i <= 20; i++) {
          Task.create(`Task ${i}`, `Description ${i}`);
        }

        const res = await request(app)
          .get('/api/tasks')
          .query({ page: 2, limit: 10 });

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveLength(10);
        expect(res.body.pagination).toEqual({
          total: 20,
          page: 2,
          limit: 10,
          totalPages: 2,
          hasNextPage: false,
          hasPrevPage: true
        });
      });
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

  describe('completedAt timestamp', () => {
    /**
     * Test basic completedAt functionality
     * Verifies: completedAt is set when marking task as completed
     */
    it('should set completedAt when marking task as completed', async () => {
      // Create a task
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });
      const taskId = createRes.body.data.id;

      // Mark as completed
      const updateRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: true });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.completed).toBe(true);
      expect(updateRes.body.data.completedAt).not.toBeNull();
      expect(updateRes.body.data.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601 format
    });

    /**
     * Test that completedAt is null for new incomplete tasks
     * Verifies: completedAt initializes as null
     */
    it('should have completedAt as null for new incomplete tasks', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.completedAt).toBeNull();
    });

    /**
     * Test completedAt preservation when uncompleting
     * Verifies: completedAt is preserved when task is marked incomplete (for history)
     */
    it('should preserve completedAt when marking task as incomplete', async () => {
      // Create and complete a task
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });
      const taskId = createRes.body.data.id;

      await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: true });

      // Get the completedAt timestamp
      const getRes1 = await request(app).get(`/api/tasks/${taskId}`);
      const originalCompletedAt = getRes1.body.data.completedAt;
      expect(originalCompletedAt).not.toBeNull();

      // Mark as incomplete
      const updateRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: false });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.data.completed).toBe(false);
      expect(updateRes.body.data.completedAt).toBe(originalCompletedAt); // Preserved
    });

    /**
     * Test completedAt update when re-completing
     * Verifies: completedAt gets new timestamp when task is completed again
     */
    it('should update completedAt when re-completing a task', async () => {
      // Create and complete a task
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });
      const taskId = createRes.body.data.id;

      await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: true });

      const getRes1 = await request(app).get(`/api/tasks/${taskId}`);
      const firstCompletedAt = getRes1.body.data.completedAt;

      // Uncomplete then complete again
      await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: false });

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: true });

      const getRes2 = await request(app).get(`/api/tasks/${taskId}`);
      const secondCompletedAt = getRes2.body.data.completedAt;

      expect(secondCompletedAt).not.toBe(firstCompletedAt); // New timestamp
      expect(new Date(secondCompletedAt) >= new Date(firstCompletedAt)).toBe(true);
    });

    /**
     * Test completedAt stability when updating other fields
     * Verifies: completedAt doesn't change when updating title/description
     */
    it('should not change completedAt when updating other fields', async () => {
      // Create and complete a task
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });
      const taskId = createRes.body.data.id;

      await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: true });

      const getRes1 = await request(app).get(`/api/tasks/${taskId}`);
      const originalCompletedAt = getRes1.body.data.completedAt;

      // Update title and description (not completed field)
      await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Title', description: 'Updated Description' });

      const getRes2 = await request(app).get(`/api/tasks/${taskId}`);
      expect(getRes2.body.data.completedAt).toBe(originalCompletedAt); // Unchanged
    });

    /**
     * Test security: reject manual completedAt in create request
     * Verifies: 400 error when trying to set completedAt manually during creation
     */
    it('should reject manual completedAt in create request', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Description',
          completedAt: '2025-11-21T10:00:00Z'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('completedAt is a read-only field and cannot be set manually');
    });

    /**
     * Test security: reject manual completedAt in update request
     * Verifies: 400 error when trying to set completedAt manually during update
     */
    it('should reject manual completedAt in update request', async () => {
      // Create a task first
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });
      const taskId = createRes.body.data.id;

      // Try to manually set completedAt
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          completed: true,
          completedAt: '2025-11-21T10:00:00Z'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('completedAt is a read-only field and cannot be set manually');
    });

    /**
     * Test completedAt timestamp accuracy
     * Verifies: completedAt is set to current time (within 1 second tolerance)
     */
    it('should set completedAt to current time when completed', async () => {
      const beforeTime = new Date();

      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });
      const taskId = createRes.body.data.id;

      await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: true });

      const afterTime = new Date();

      const getRes = await request(app).get(`/api/tasks/${taskId}`);
      const completedAt = new Date(getRes.body.data.completedAt);

      // Allow 1 second tolerance for test execution time
      expect(completedAt >= new Date(beforeTime.getTime() - 1000)).toBe(true);
      expect(completedAt <= new Date(afterTime.getTime() + 1000)).toBe(true);
    });

    /**
     * Test completedAt in GET /api/tasks response
     * Verifies: completedAt field is included in list response
     */
    it('should include completedAt in GET /api/tasks response', async () => {
      // Create one incomplete and one complete task
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Incomplete Task', description: 'Description' });

      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Complete Task', description: 'Description' });

      await request(app)
        .put(`/api/tasks/${createRes.body.data.id}`)
        .send({ completed: true });

      // Get all tasks
      const res = await request(app).get('/api/tasks');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty('completedAt');
      expect(res.body.data[1]).toHaveProperty('completedAt');
    });

    /**
     * Test completedAt in GET /api/tasks/:id response
     * Verifies: completedAt field is included in single task response
     */
    it('should include completedAt in GET /api/tasks/:id response', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });
      const taskId = createRes.body.data.id;

      const res = await request(app).get(`/api/tasks/${taskId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('completedAt');
      expect(res.body.data.completedAt).toBeNull(); // New task is incomplete
    });

    /**
     * Test completedAt in POST response
     * Verifies: completedAt is included in create response
     */
    it('should include completedAt in POST response', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('completedAt');
      expect(res.body.data.completedAt).toBeNull();
    });

    /**
     * Test completedAt in PUT response
     * Verifies: completedAt is included in update response
     */
    it('should include completedAt in PUT response', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Description' });
      const taskId = createRes.body.data.id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: true });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('completedAt');
      expect(res.body.data.completedAt).not.toBeNull();
    });
  });

  describe('Status Filtering', () => {
    beforeEach(async () => {
      // Create mix of completed and incomplete tasks for filtering tests
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Incomplete Task 1', description: 'Not done yet' });

      const task2 = await request(app)
        .post('/api/tasks')
        .send({ title: 'Completed Task 1', description: 'Done' });

      await request(app)
        .put(`/api/tasks/${task2.body.data.id}`)
        .send({ completed: true });

      await request(app)
        .post('/api/tasks')
        .send({ title: 'Incomplete Task 2', description: 'Still working' });

      const task4 = await request(app)
        .post('/api/tasks')
        .send({ title: 'Completed Task 2', description: 'Finished' });

      await request(app)
        .put(`/api/tasks/${task4.body.data.id}`)
        .send({ completed: true });
    });

    it('should return all tasks when status=all', async () => {
      const res = await request(app)
        .get('/api/tasks?status=all')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(4);
      expect(res.body.data).toHaveLength(4);
    });

    it('should return only completed tasks when status=completed', async () => {
      const res = await request(app)
        .get('/api/tasks?status=completed')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.every(task => task.completed === true)).toBe(true);
      expect(res.body.data[0].title).toContain('Completed');
      expect(res.body.data[1].title).toContain('Completed');
    });

    it('should return only incomplete tasks when status=incomplete', async () => {
      const res = await request(app)
        .get('/api/tasks?status=incomplete')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.every(task => task.completed === false)).toBe(true);
      expect(res.body.data[0].title).toContain('Incomplete');
      expect(res.body.data[1].title).toContain('Incomplete');
    });

    it('should default to all tasks when status is not provided', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(4);
    });

    it('should return 400 for invalid status value', async () => {
      const res = await request(app)
        .get('/api/tasks?status=invalid')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid query parameters');
      expect(res.body.details).toBeDefined();
      expect(res.body.details[0].message).toContain('all, completed, incomplete');
    });

    it('should work with pagination for completed tasks', async () => {
      const res = await request(app)
        .get('/api/tasks?status=completed&page=1&limit=1')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].completed).toBe(true);
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(true);
    });

    it('should work with pagination for incomplete tasks', async () => {
      const res = await request(app)
        .get('/api/tasks?status=incomplete&page=1&limit=1')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].completed).toBe(false);
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(true);
    });

    it('should handle case insensitive status values', async () => {
      const res = await request(app)
        .get('/api/tasks?status=COMPLETED')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      // All tasks should be completed
      for (const task of res.body.data) {
        expect(task.completed).toBe(true);
      }
    });

    it('should return empty array when no completed tasks exist', async () => {
      // Delete all existing tasks first
      const allTasks = await request(app).get('/api/tasks');
      for (const task of allTasks.body.data) {
        await request(app).delete(`/api/tasks/${task.id}`);
      }

      // Create only incomplete tasks
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Only Incomplete', description: 'Not done' });

      const res = await request(app)
        .get('/api/tasks?status=completed')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return empty array when no incomplete tasks exist', async () => {
      // Delete all existing tasks first
      const allTasks = await request(app).get('/api/tasks');
      for (const task of allTasks.body.data) {
        await request(app).delete(`/api/tasks/${task.id}`);
      }

      // Create only completed tasks
      const task = await request(app)
        .post('/api/tasks')
        .send({ title: 'Only Completed', description: 'Done' });

      await request(app)
        .put(`/api/tasks/${task.body.data.id}`)
        .send({ completed: true });

      const res = await request(app)
        .get('/api/tasks?status=incomplete')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('Sorting', () => {
    beforeEach(async () => {
      // Create tasks with varying properties for sorting tests
      // Task 1: Older, title "Zebra Task"
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Zebra Task', description: 'Last alphabetically' });

      // Wait 10ms to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      // Task 2: Middle, title "Middle Task", will be completed
      const task2 = await request(app)
        .post('/api/tasks')
        .send({ title: 'Middle Task', description: 'Will be completed' });

      await request(app)
        .put(`/api/tasks/${task2.body.data.id}`)
        .send({ completed: true });

      await new Promise(resolve => setTimeout(resolve, 10));

      // Task 3: Newer, title "Alpha Task"
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Alpha Task', description: 'First alphabetically' });
    });

    it('should sort by createdAt ascending', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=createdAt&sortOrder=asc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      // Oldest first (Zebra Task)
      expect(res.body.data[0].title).toBe('Zebra Task');
      expect(res.body.data[2].title).toBe('Alpha Task');
    });

    it('should sort by createdAt descending (default)', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=createdAt&sortOrder=desc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      // Newest first (Alpha Task)
      expect(res.body.data[0].title).toBe('Alpha Task');
      expect(res.body.data[2].title).toBe('Zebra Task');
    });

    it('should sort by title ascending', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=title&sortOrder=asc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0].title).toBe('Alpha Task');
      expect(res.body.data[1].title).toBe('Middle Task');
      expect(res.body.data[2].title).toBe('Zebra Task');
    });

    it('should sort by title descending', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=title&sortOrder=desc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0].title).toBe('Zebra Task');
      expect(res.body.data[1].title).toBe('Middle Task');
      expect(res.body.data[2].title).toBe('Alpha Task');
    });

    it('should sort by completed status ascending (incomplete first)', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=completed&sortOrder=asc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      // First two should be incomplete
      expect(res.body.data[0].completed).toBe(false);
      expect(res.body.data[1].completed).toBe(false);
      // Last one should be completed
      expect(res.body.data[2].completed).toBe(true);
      expect(res.body.data[2].title).toBe('Middle Task');
    });

    it('should sort by completed status descending (completed first)', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=completed&sortOrder=desc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      // First one should be completed
      expect(res.body.data[0].completed).toBe(true);
      expect(res.body.data[0].title).toBe('Middle Task');
      // Last two should be incomplete
      expect(res.body.data[1].completed).toBe(false);
      expect(res.body.data[2].completed).toBe(false);
    });

    it('should handle case insensitive sortBy values', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=TITLE&sortOrder=ASC')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].title).toBe('Alpha Task');
    });

    it('should combine sorting with filtering', async () => {
      const res = await request(app)
        .get('/api/tasks?status=incomplete&sortBy=title&sortOrder=asc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].title).toBe('Alpha Task');
      expect(res.body.data[1].title).toBe('Zebra Task');
      // All should be incomplete
      expect(res.body.data.every(task => !task.completed)).toBe(true);
    });

    it('should combine sorting with pagination', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=title&sortOrder=asc&page=1&limit=2')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].title).toBe('Alpha Task');
      expect(res.body.data[1].title).toBe('Middle Task');
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.hasNextPage).toBe(true);
    });

    it('should use default sort (createdAt desc) when no sort params provided', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      // Should be newest first by default
      expect(res.body.data[0].title).toBe('Alpha Task');
      expect(res.body.data[2].title).toBe('Zebra Task');
    });

    it('should reject invalid sortBy values', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=invalid')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid query parameters');
      expect(res.body.details[0].field).toBe('sortBy');
    });

    it('should reject invalid sortOrder values', async () => {
      const res = await request(app)
        .get('/api/tasks?sortOrder=invalid')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid query parameters');
      expect(res.body.details[0].field).toBe('sortOrder');
    });

    it('should sort by updatedAt when tasks are updated', async () => {
      // Get all tasks to get their IDs
      const allTasks = await request(app).get('/api/tasks');
      const zebraTask = allTasks.body.data.find(t => t.title === 'Zebra Task');

      // Wait and update the Zebra Task (oldest)
      await new Promise(resolve => setTimeout(resolve, 10));
      await request(app)
        .put(`/api/tasks/${zebraTask.id}`)
        .send({ description: 'Updated description' });

      // Sort by updatedAt desc - Zebra Task should be first now
      const res = await request(app)
        .get('/api/tasks?sortBy=updatedAt&sortOrder=desc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].title).toBe('Zebra Task');
      expect(res.body.data[0].description).toBe('Updated description');
    });
  });

  describe('GET /api/tasks/stats', () => {
    /**
     * Test basic stats endpoint functionality
     * Verifies: 200 status, success flag, all required fields in response
     */
    it('should return 200 with correct response structure', async () => {
      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('completed');
      expect(res.body.data).toHaveProperty('incomplete');
      expect(res.body.data).toHaveProperty('completionRate');
      expect(res.body.data).toHaveProperty('recentlyCompleted');
      expect(res.body.data).toHaveProperty('recentlyCreated');
    });

    /**
     * Test empty task list handling
     * Verifies: All counts are 0, completion rate is "0.00%" (no division by zero error)
     */
    it('should handle empty task list (0 tasks)', async () => {
      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.completed).toBe(0);
      expect(res.body.data.incomplete).toBe(0);
      expect(res.body.data.completionRate).toBe('0.00%');
      expect(res.body.data.recentlyCompleted).toBe(0);
      expect(res.body.data.recentlyCreated).toBe(0);
    });

    /**
     * Test total count calculation
     * Verifies: Total equals sum of completed + incomplete
     */
    it('should return correct total count', async () => {
      // Create 5 tasks
      await request(app).post('/api/tasks').send({ title: 'Task 1' });
      await request(app).post('/api/tasks').send({ title: 'Task 2' });
      await request(app).post('/api/tasks').send({ title: 'Task 3' });
      await request(app).post('/api/tasks').send({ title: 'Task 4' });
      await request(app).post('/api/tasks').send({ title: 'Task 5' });

      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.data.total).toBe(5);
    });

    /**
     * Test completed and incomplete count calculation
     * Verifies: Counts are accurate and total = completed + incomplete
     */
    it('should return correct completed/incomplete counts', async () => {
      // Create 5 tasks
      const task1 = await request(app).post('/api/tasks').send({ title: 'Task 1' });
      const task2 = await request(app).post('/api/tasks').send({ title: 'Task 2' });
      const task3 = await request(app).post('/api/tasks').send({ title: 'Task 3' });
      await request(app).post('/api/tasks').send({ title: 'Task 4' });
      await request(app).post('/api/tasks').send({ title: 'Task 5' });

      // Mark 3 as completed
      await request(app)
        .put(`/api/tasks/${task1.body.data.id}`)
        .send({ completed: true });
      await request(app)
        .put(`/api/tasks/${task2.body.data.id}`)
        .send({ completed: true });
      await request(app)
        .put(`/api/tasks/${task3.body.data.id}`)
        .send({ completed: true });

      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.data.total).toBe(5);
      expect(res.body.data.completed).toBe(3);
      expect(res.body.data.incomplete).toBe(2);
    });

    /**
     * Test completion rate calculation
     * Verifies: Percentage is calculated correctly
     */
    it('should calculate completion rate correctly', async () => {
      // Create 5 tasks
      const task1 = await request(app).post('/api/tasks').send({ title: 'Task 1' });
      const task2 = await request(app).post('/api/tasks').send({ title: 'Task 2' });
      const task3 = await request(app).post('/api/tasks').send({ title: 'Task 3' });
      await request(app).post('/api/tasks').send({ title: 'Task 4' });
      await request(app).post('/api/tasks').send({ title: 'Task 5' });

      // Mark 3 as completed (3/5 = 60%)
      await request(app)
        .put(`/api/tasks/${task1.body.data.id}`)
        .send({ completed: true });
      await request(app)
        .put(`/api/tasks/${task2.body.data.id}`)
        .send({ completed: true });
      await request(app)
        .put(`/api/tasks/${task3.body.data.id}`)
        .send({ completed: true });

      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.data.completionRate).toBe('60.00%');
    });

    /**
     * Test completion rate formatting
     * Verifies: Always formatted with 2 decimal places
     */
    it('should format completion rate with 2 decimal places', async () => {
      // Create 3 tasks
      const task1 = await request(app).post('/api/tasks').send({ title: 'Task 1' });
      await request(app).post('/api/tasks').send({ title: 'Task 2' });
      await request(app).post('/api/tasks').send({ title: 'Task 3' });

      // Mark 1 as completed (1/3 = 33.333...%)
      await request(app)
        .put(`/api/tasks/${task1.body.data.id}`)
        .send({ completed: true });

      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.data.completionRate).toBe('33.33%');
    });

    /**
     * Test all incomplete tasks scenario
     * Verifies: 0% completion rate when no tasks are completed
     */
    it('should handle all incomplete tasks (0% completion)', async () => {
      // Create 3 incomplete tasks
      await request(app).post('/api/tasks').send({ title: 'Task 1' });
      await request(app).post('/api/tasks').send({ title: 'Task 2' });
      await request(app).post('/api/tasks').send({ title: 'Task 3' });

      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.data.total).toBe(3);
      expect(res.body.data.completed).toBe(0);
      expect(res.body.data.incomplete).toBe(3);
      expect(res.body.data.completionRate).toBe('0.00%');
    });

    /**
     * Test all completed tasks scenario
     * Verifies: 100% completion rate when all tasks are completed
     */
    it('should handle all completed tasks (100% completion)', async () => {
      // Create 3 tasks and complete all
      const task1 = await request(app).post('/api/tasks').send({ title: 'Task 1' });
      const task2 = await request(app).post('/api/tasks').send({ title: 'Task 2' });
      const task3 = await request(app).post('/api/tasks').send({ title: 'Task 3' });

      await request(app)
        .put(`/api/tasks/${task1.body.data.id}`)
        .send({ completed: true });
      await request(app)
        .put(`/api/tasks/${task2.body.data.id}`)
        .send({ completed: true });
      await request(app)
        .put(`/api/tasks/${task3.body.data.id}`)
        .send({ completed: true });

      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.data.total).toBe(3);
      expect(res.body.data.completed).toBe(3);
      expect(res.body.data.incomplete).toBe(0);
      expect(res.body.data.completionRate).toBe('100.00%');
    });

    /**
     * Test recently created count (last 7 days)
     * Verifies: Only tasks created within last 168 hours are counted
     */
    it('should count recently created tasks (last 7 days)', async () => {
      // Create tasks with different creation dates
      const now = new Date();

      // Task created just now (should count)
      await request(app).post('/api/tasks').send({ title: 'Recent Task 1' });

      // Task created 3 days ago (should count)
      const task2 = await request(app).post('/api/tasks').send({ title: 'Recent Task 2' });
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      Task.findById(task2.body.data.id).createdAt = threeDaysAgo.toISOString();

      // Task created 6 days ago (should count)
      const task3 = await request(app).post('/api/tasks').send({ title: 'Recent Task 3' });
      const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      Task.findById(task3.body.data.id).createdAt = sixDaysAgo.toISOString();

      // Task created 8 days ago (should NOT count)
      const task4 = await request(app).post('/api/tasks').send({ title: 'Old Task' });
      const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      Task.findById(task4.body.data.id).createdAt = eightDaysAgo.toISOString();

      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.data.total).toBe(4);
      expect(res.body.data.recentlyCreated).toBe(3); // Only first 3 tasks
    });

    /**
     * Test recently completed count (last 7 days)
     * Verifies: Only tasks completed within last 168 hours are counted
     */
    it('should count recently completed tasks (last 7 days)', async () => {
      // Create tasks and complete them at different times
      const now = new Date();

      // Task completed just now (should count)
      const task1 = await request(app).post('/api/tasks').send({ title: 'Task 1' });
      await request(app)
        .put(`/api/tasks/${task1.body.data.id}`)
        .send({ completed: true });

      // Task completed 5 days ago (should count)
      const task2 = await request(app).post('/api/tasks').send({ title: 'Task 2' });
      await request(app)
        .put(`/api/tasks/${task2.body.data.id}`)
        .send({ completed: true });
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      Task.findById(task2.body.data.id).completedAt = fiveDaysAgo.toISOString();

      // Task completed 10 days ago (should NOT count)
      const task3 = await request(app).post('/api/tasks').send({ title: 'Task 3' });
      await request(app)
        .put(`/api/tasks/${task3.body.data.id}`)
        .send({ completed: true });
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      Task.findById(task3.body.data.id).completedAt = tenDaysAgo.toISOString();

      // Incomplete task (should NOT count)
      await request(app).post('/api/tasks').send({ title: 'Task 4' });

      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.data.total).toBe(4);
      expect(res.body.data.completed).toBe(3);
      expect(res.body.data.recentlyCompleted).toBe(2); // Only first 2 completed tasks
    });

    /**
     * Test that recently completed uses completedAt, not updatedAt
     * Verifies: Tasks completed long ago but updated recently are not counted as recently completed
     */
    it('should use completedAt (not updatedAt) for recently completed count', async () => {
      const now = new Date();

      // Task completed 10 days ago
      const task1 = await request(app).post('/api/tasks').send({ title: 'Old Completed Task' });
      await request(app)
        .put(`/api/tasks/${task1.body.data.id}`)
        .send({ completed: true });
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      Task.findById(task1.body.data.id).completedAt = tenDaysAgo.toISOString();

      // Update the task today (changes updatedAt but not completedAt)
      await request(app)
        .put(`/api/tasks/${task1.body.data.id}`)
        .send({ title: 'Updated Title' });

      const res = await request(app)
        .get('/api/tasks/stats')
        .expect(200);

      expect(res.body.data.completed).toBe(1);
      expect(res.body.data.recentlyCompleted).toBe(0); // Should NOT count because completedAt is 10 days ago
    });
  });
});
