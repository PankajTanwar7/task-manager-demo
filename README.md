# Task Manager API

A simple RESTful API for managing tasks, built with Express.js and in-memory storage.

## Features

- Create, read, update, and delete tasks
- Input validation with express-validator
- Comprehensive test coverage with Jest
- CORS enabled for cross-origin requests
- Centralized error handling
- Health check endpoint

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

### Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the API health status.

**Response:**
```json
{
  "success": true,
  "message": "Task Manager API is running"
}
```

### Create Task

```
POST /api/tasks
```

Create a new task.

**Request Body:**
```json
{
  "title": "Task title (required, 1-200 characters)",
  "description": "Task description (optional, max 1000 characters)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Task title",
    "description": "Task description",
    "completed": false,
    "createdAt": "2025-11-21T10:30:00.000Z"
  }
}
```

### Get All Tasks

```
GET /api/tasks
```

Retrieve all tasks.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "createdAt": "2025-11-21T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### Get Single Task

```
GET /api/tasks/:id
```

Retrieve a specific task by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Task title",
    "description": "Task description",
    "completed": false,
    "createdAt": "2025-11-21T10:30:00.000Z"
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Task not found"
}
```

### Update Task

```
PUT /api/tasks/:id
```

Update an existing task.

**Request Body:**
```json
{
  "title": "Updated title (optional)",
  "description": "Updated description (optional)",
  "completed": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated title",
    "description": "Updated description",
    "completed": true,
    "createdAt": "2025-11-21T10:30:00.000Z"
  }
}
```

### Delete Task

```
DELETE /api/tasks/:id
```

Delete a task.

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## Project Structure

```
task-manager-demo/
├── src/
│   ├── models/
│   │   └── Task.js              # Task model and data operations
│   ├── controllers/
│   │   └── taskController.js    # Request handlers
│   ├── middleware/
│   │   ├── validation.js        # Input validation middleware
│   │   └── errorHandler.js      # Global error handler
│   ├── routes/
│   │   └── tasks.js             # API route definitions
│   ├── app.js                   # Express app configuration
│   └── server.js                # Application entry point
├── tests/
│   └── tasks.test.js            # API tests
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Project dependencies
└── README.md                    # This file
```

## Architecture

The application follows a layered architecture:

1. **Routes** (`src/routes/`) - Define API endpoints and apply middleware
2. **Middleware** (`src/middleware/`) - Validation and error handling
3. **Controllers** (`src/controllers/`) - Handle requests and responses
4. **Models** (`src/models/`) - Data operations and business logic

## Error Handling

All errors are handled by the centralized error handler middleware:

- **400** - Validation errors (invalid input)
- **404** - Resource not found
- **500** - Internal server errors

Error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Only for validation errors
}
```

## Input Validation

Input validation is performed using express-validator:

- **Title**: Required, 1-200 characters
- **Description**: Optional, max 1000 characters
- **Completed**: Boolean (true/false)

## Testing

The project uses Jest and Supertest for testing:

- Unit tests for all API endpoints
- Test coverage for happy paths and error cases
- Automatic database reset between tests

Run tests with:

```bash
npm test
```

## License

MIT
