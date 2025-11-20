const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { validateCreateTask, validateUpdateTask, validateTaskId } = require('../middleware/validation');

// POST /api/tasks - Create a new task
router.post('/', validateCreateTask, taskController.createTask);

// GET /api/tasks - Get all tasks
router.get('/', taskController.getAllTasks);

// GET /api/tasks/:id - Get a single task
router.get('/:id', validateTaskId, taskController.getTaskById);

// PUT /api/tasks/:id - Update a task
router.put('/:id', validateTaskId, validateUpdateTask, taskController.updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', validateTaskId, taskController.deleteTask);

module.exports = router;
