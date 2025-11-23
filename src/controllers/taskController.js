/**
 * Task Controller
 *
 * Handles HTTP request/response logic for task operations.
 * Delegates business logic to the Task model and ensures consistent
 * error handling through Express middleware.
 *
 * All controller methods follow the pattern:
 * - Extract data from req (body, params, query)
 * - Call Task model methods
 * - Return JSON response with success/error format
 * - Pass errors to next() for centralized error handling
 *
 * @module controllers/taskController
 */

const Task = require('../models/Task');
const { matchedData } = require('express-validator');

/**
 * Create a new task
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Task title (validated by middleware)
 * @param {string} [req.body.description] - Task description (optional)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends 201 JSON response with created task
 */
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

/**
 * Get all tasks with optional pagination, filtering, and sorting
 *
 * Supports query parameters:
 * - page: Page number (positive integer, default: return all)
 * - limit: Items per page (1-100, default: return all)
 * - status: Filter by status (all|completed|incomplete, default: all)
 * - sortBy: Sort field (createdAt|updatedAt|title|completed, default: createdAt)
 * - sortOrder: Sort direction (asc|desc, default: desc)
 *
 * Response format with pagination:
 * {
 *   success: true,
 *   data: [...],
 *   pagination: {
 *     total: 50,
 *     page: 2,
 *     limit: 10,
 *     totalPages: 5,
 *     hasNextPage: true,
 *     hasPrevPage: true
 *   }
 * }
 *
 * Response format without pagination:
 * {
 *   success: true,
 *   count: 50,
 *   data: [...]
 * }
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page] - Page number (validated by middleware)
 * @param {number} [req.query.limit] - Items per page (validated by middleware)
 * @param {string} [req.query.status] - Filter by status (validated by middleware)
 * @param {string} [req.query.sortBy] - Sort field (validated by middleware)
 * @param {string} [req.query.sortOrder] - Sort direction (validated by middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends 200 JSON response with tasks and pagination metadata
 */
exports.getAllTasks = (req, res, next) => {
  try {
    // Get validated and sanitized data from express-validator
    // matchedData() returns only the fields that passed validation with sanitization applied
    const validated = matchedData(req);

    // Extract pagination, filter, and sort parameters with defaults
    const page = validated.page; // Already converted to int by validator
    const limit = validated.limit; // Already converted to int by validator
    const status = validated.status || 'all'; // Already sanitized to lowercase by validator
    const sortBy = validated.sortBy || 'createdat'; // Already sanitized to lowercase by validator
    const sortOrder = validated.sortOrder || 'desc'; // Already sanitized to lowercase by validator

    // If no pagination params, return all filtered and sorted tasks (backward compatibility)
    if (!page && !limit) {
      const tasks = Task.findAll({ status, sortBy, sortOrder });
      return res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    }

    // Set defaults if only one param provided
    const actualPage = page || 1;
    const actualLimit = limit || 10;

    // Get paginated, filtered, and sorted tasks
    const tasks = Task.findAll({
      page: actualPage,
      limit: actualLimit,
      status,
      sortBy,
      sortOrder
    });
    const total = Task.count({ status });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / actualLimit);
    const hasNextPage = actualPage < totalPages;
    const hasPrevPage = actualPage > 1;

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: actualPage,
        limit: actualLimit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single task by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Task ID (validated by middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends 200 JSON response with task or 404 if not found
 */
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

/**
 * Update a task
 *
 * Supports partial updates - only provided fields will be updated.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Task ID (validated by middleware)
 * @param {Object} req.body - Request body
 * @param {string} [req.body.title] - New task title
 * @param {string} [req.body.description] - New task description
 * @param {boolean} [req.body.completed] - New completion status
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends 200 JSON response with updated task or 404 if not found
 */
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

/**
 * Delete a task
 *
 * Permanently removes a task from the system.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Task ID (validated by middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends 200 JSON response on success or 404 if not found
 */
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

/**
 * Get task statistics
 *
 * Returns aggregated statistics about all tasks including:
 * - Total counts (all, completed, incomplete)
 * - Completion rate percentage (formatted as "XX.XX%")
 * - Recent activity counts (last 7 days = 168 hours)
 *
 * No authentication required (consistent with other endpoints).
 * No query parameters - returns single statistics object.
 *
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     total: 50,
 *     completed: 30,
 *     incomplete: 20,
 *     completionRate: "60.00%",
 *     recentlyCompleted: 5,
 *     recentlyCreated: 8
 *   }
 * }
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends 200 JSON response with task statistics
 */
exports.getStats = (req, res, next) => {
  try {
    const stats = Task.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
