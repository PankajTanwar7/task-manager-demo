// Task Model - In-Memory Storage
// This can be easily replaced with a database later

let tasks = [];
let nextId = 1;

class Task {
  constructor(title, description) {
    this.id = nextId++;
    this.title = title;
    this.description = description || '';
    this.completed = false;
    this.createdAt = new Date().toISOString();
  }

  static create(title, description) {
    const task = new Task(title, description);
    tasks.push(task);
    return task;
  }

  static findAll() {
    return tasks;
  }

  static findById(id) {
    return tasks.find(task => task.id === parseInt(id));
  }

  static update(id, updates) {
    const task = this.findById(id);
    if (!task) return null;

    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.completed !== undefined) task.completed = updates.completed;

    return task;
  }

  static delete(id) {
    const index = tasks.findIndex(task => task.id === parseInt(id));
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
