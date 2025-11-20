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

  static findAll() {
    return tasks;
  }

  static findById(id) {
    // ID is already converted to int by validation middleware
    return tasks.find(task => task.id === id);
  }

  static update(id, updates) {
    const task = this.findById(id);
    if (!task) return null;

    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.completed !== undefined) task.completed = updates.completed;

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
}

module.exports = Task;
