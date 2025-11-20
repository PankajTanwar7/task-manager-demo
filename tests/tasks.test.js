const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/Task');

// Clear tasks before each test
beforeEach(() => {
  Task.deleteAll();
});

describe('Task API Endpoints', () => {
  describe('POST /api/tasks', () => {
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
    it('should return empty array when no tasks exist', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should return all tasks', async () => {
      // Create test tasks
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
    it('should return a task by ID', async () => {
      const task = Task.create('Test Task', 'Test Description');

      const res = await request(app).get(`/api/tasks/${task.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(task.id);
      expect(res.body.data.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app).get('/api/tasks/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Task not found');
    });
  });

  describe('PUT /api/tasks/:id', () => {
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

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .put('/api/tasks/999')
        .send({
          title: 'Updated'
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

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
    it('should delete a task', async () => {
      const task = Task.create('Task to delete', 'Description');

      const res = await request(app).delete(`/api/tasks/${task.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Task deleted successfully');

      // Verify task is deleted
      const tasks = Task.findAll();
      expect(tasks).toHaveLength(0);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app).delete('/api/tasks/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
