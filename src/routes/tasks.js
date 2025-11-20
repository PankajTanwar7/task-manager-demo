/**
 * Task Routes
 *
 * Defines all HTTP endpoints for task management operations.
 * All routes are mounted under /api/tasks in the main application.
 *
 * Routes:
 * - POST   /api/tasks       - Create a new task
 * - GET    /api/tasks       - Retrieve all tasks
 * - GET    /api/tasks/:id   - Retrieve a single task by ID
 * - PUT    /api/tasks/:id   - Update an existing task
 * - DELETE /api/tasks/:id   - Delete a task
 *
 * Middleware chain:
 * - Validation middleware (express-validator) runs before controllers
 * - Controllers handle business logic
 * - Errors are caught by centralized error handler
 *
 * @module routes/tasks
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { validateCreateTask, validateUpdateTask, validateTaskId } = require('../middleware/validation');

/**
 * POST /api/tasks - Create a new task
 * Validates title (required) and description (optional) before creation
 */
router.post('/', validateCreateTask, taskController.createTask);

/**
 * GET /api/tasks - Get all tasks
 * Returns array of all tasks with count
 */
router.get('/', taskController.getAllTasks);

/**
 * GET /api/tasks/:id - Get a single task
 * Validates ID parameter before lookup
 */
router.get('/:id', validateTaskId, taskController.getTaskById);

/**
 * PUT /api/tasks/:id - Update a task
 * Validates ID and update fields (supports partial updates)
 */
router.put('/:id', validateTaskId, validateUpdateTask, taskController.updateTask);

/**
 * DELETE /api/tasks/:id - Delete a task
 * Validates ID parameter before deletion
 */
router.delete('/:id', validateTaskId, taskController.deleteTask);

module.exports = router;
