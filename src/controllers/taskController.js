const Task = require('../models/Task');

// Create a new task
exports.createTask = (req, res, next) => {
  try {
    const { title, description } = req.body;

    const task = Task.create(title, description);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// Get all tasks
exports.getAllTasks = (req, res, next) => {
  try {
    const tasks = Task.findAll();

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// Get a single task by ID
exports.getTaskById = (req, res, next) => {
  try {
    const task = Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// Update a task
exports.updateTask = (req, res, next) => {
  try {
    const { title, description, completed } = req.body;

    const task = Task.update(req.params.id, { title, description, completed });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// Delete a task
exports.deleteTask = (req, res, next) => {
  try {
    const deleted = Task.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
