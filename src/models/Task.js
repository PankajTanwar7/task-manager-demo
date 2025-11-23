// Task Model - In-Memory Storage
// This can be easily replaced with a database later
//
// Note: Using module-level variables for in-memory storage.
// This is acceptable for demo purposes as Node.js JavaScript execution is single-threaded.
// When migrating to a database, proper transaction handling will ensure thread-safety.

let tasks = [];
let nextId = 1;

class Task {
  constructor(title, description, id = null) {
    // Use provided ID or generate atomically within create method
    this.id = id;
    this.title = title;
    this.description = description || '';
    this.completed = false;
    this.completedAt = null; // Timestamp when task was last marked as completed
    // Use single timestamp for consistency
    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
  }

  static create(title, description) {
    // Generate ID atomically before creating task instance
    const id = nextId++;
    const task = new Task(title, description, id);
    tasks.push(task);
    return task;
  }

  static findAll(options = {}) {
    // Apply status filter first (before sorting and pagination)
    let filteredTasks = tasks;
    const status = options.status || 'all';

    if (status !== 'all') {
      const shouldBeCompleted = status === 'completed';
      filteredTasks = tasks.filter(task => task.completed === shouldBeCompleted);
    }

    // Extract sort options (default: createdAt desc)
    const sortBy = options.sortBy || 'createdat';
    const sortOrder = options.sortOrder || 'desc';

    // Sort tasks based on specified field and order
    const sorted = [...filteredTasks].sort((a, b) => {
      let comparison = 0;

      // Perform comparison based on sortBy field
      switch (sortBy) {
        case 'createdat':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'updatedat':
          comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'completed':
          // Sort by completed status (false < true), then by createdAt as tiebreaker
          if (a.completed === b.completed) {
            comparison = new Date(a.createdAt) - new Date(b.createdAt);
          } else {
            comparison = a.completed ? 1 : -1;
          }
          break;
        default:
          // Fallback to createdAt
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }

      // If values are still equal after primary sort, use ID as final tiebreaker for deterministic ordering
      if (comparison === 0 && sortBy !== 'completed') {
        comparison = a.id - b.id;
      }

      // Apply sort order (asc or desc)
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // If no pagination options provided, return all filtered and sorted tasks (backward compatibility)
    if (!options.page && !options.limit) {
      return sorted;
    }

    // Apply pagination using slice
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return sorted.slice(startIndex, endIndex);
  }

  static count(options = {}) {
    // Apply status filter for count
    const status = options.status || 'all';

    if (status === 'all') {
      return tasks.length;
    }

    const shouldBeCompleted = status === 'completed';
    return tasks.filter(task => task.completed === shouldBeCompleted).length;
  }

  static findById(id) {
    // ID is already converted to int by validation middleware
    return tasks.find(task => task.id === id);
  }

  static update(id, updates) {
    const task = this.findById(id);
    if (!task) return null;

    // Track previous completed state for business logic
    const wasCompleted = task.completed;

    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.completed !== undefined) {
      task.completed = updates.completed;

      // Business logic: set completedAt when marking task as complete
      // Preserve existing completedAt when uncompleting (for history)
      if (!wasCompleted && task.completed) {
        task.completedAt = new Date().toISOString();
      }
    }

    // Update timestamp
    task.updatedAt = new Date().toISOString();

    return task;
  }

  static delete(id) {
    // ID is already converted to int by validation middleware
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return false;

    tasks.splice(index, 1);
    return true;
  }

  static deleteAll() {
    tasks = [];
    nextId = 1;
  }

  /**
   * Calculate task statistics in a single pass.
   *
   * Returns aggregated metrics about all tasks including:
   * - Total counts (all, completed, incomplete)
   * - Completion rate percentage
   * - Recent activity (last 7 days)
   *
   * Thread-safety: Safe in Node.js due to single-threaded event loop.
   * No task modifications can occur during iteration.
   *
   * Note: If migrating to multi-threaded environment or database,
   * ensure atomic read of task list (e.g., transaction, mutex, snapshot).
   *
   * @returns {Object} Statistics object with task metrics
   */
  static getStats() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Single-pass iteration for O(n) performance
    const stats = tasks.reduce((acc, task) => {
      acc.total++;

      if (task.completed) {
        acc.completed++;
        // Use completedAt timestamp (not updatedAt) for recently completed
        if (task.completedAt && new Date(task.completedAt) >= sevenDaysAgo) {
          acc.recentlyCompleted++;
        }
      } else {
        acc.incomplete++;
      }

      // Use createdAt timestamp for recently created
      if (new Date(task.createdAt) >= sevenDaysAgo) {
        acc.recentlyCreated++;
      }

      return acc;
    }, {
      total: 0,
      completed: 0,
      incomplete: 0,
      recentlyCompleted: 0,
      recentlyCreated: 0
    });

    // Format completion rate with 2 decimal places
    // Handle division by zero: 0 total tasks returns "0.00%"
    stats.completionRate = stats.total === 0
      ? '0.00%'
      : `${((stats.completed / stats.total) * 100).toFixed(2)}%`;

    return stats;
  }
}

module.exports = Task;
