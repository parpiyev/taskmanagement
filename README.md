## API Documentation

### Authentication Endpoints

#### POST /api/auth/register

Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user" // optional, defaults to "user", can be "admin"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login

Login user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

#### GET /api/auth/me

Get current user profile.

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### Task Endpoints

#### GET /api/tasks

Get tasks (users see only their tasks, admins see all).

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `userId` (admin only): Filter tasks by specific user

**Response:**

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "task_id",
        "title": "Task Title",
        "description": "Task Description",
        "completed": false,
        "user": {
          "_id": "user_id",
          "email": "user@example.com"
        },
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### POST /api/tasks

Create a new task.

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Request Body:**

```json
{
  "title": "New Task",
  "description": "Task description"
}
```

#### GET /api/tasks/:id

Get specific task.

#### PUT /api/tasks/:id

Update task.

**Request Body:**

```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "completed": true
}
```

#### PATCH /api/tasks/:id/toggle

Toggle task completion status.

#### DELETE /api/tasks/:id

Delete task.

### Analytics Endpoints (Admin Only)

#### GET /api/analytics

Get comprehensive analytics.

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalTasks": 100,
    "completedTasks": 75,
    "pendingTasks": 25,
    "completionRate": 75.0,
    "tasksByUser": [
      {
        "user": "user_id",
        "email": "user@example.com",
        "totalTasks": 20,
        "completedTasks": 15,
        "completionRate": 75.0
      }
    ],
    "tasksCreatedLastWeek": 10,
    "tasksCompletedLastWeek": 8,
    "completionTrend": [
      {
        "_id": "2025-01-01",
        "count": 5
      }
    ],
    "creationTrend": [
      {
        "_id": "2025-01-01",
        "count": 3
      }
    ]
  }
}
```

#### GET /api/analytics/user/:userId

Get statistics for specific user.

## Quick Start Guide

1. **Clone and Setup:**

```bash
git clone <your-repo-url>
cd task-management-backend
npm install
```

2. **Environment Setup:**

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Development:**

```bash
npm run dev
```

4. **Production Build:**

```bash
npm run build
npm start
```

5. **Docker Deployment:**

```bash
docker-compose up -d
```

6. **Create Admin User:**

```bash
# Use the registration endpoint with role: "admin"
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

## Security Features

1. **Password Security:** bcrypt with salt rounds
2. **JWT Authentication:** Secure token-based auth
3. **Rate Limiting:** API and login attempt limiting
4. **Input Validation:** Request validation and sanitization
5. **CORS:** Configurable cross-origin requests
6. **Helmet:** Security headers
7. **Role-based Access Control:** User and admin roles
8. **MongoDB Injection Protection:** Mongoose built-in protection

## Performance Features

1. **Database Indexing:** Optimized queries
2. **Pagination:** Efficient data loading
3. **MongoDB Aggregation:** Complex analytics queries
4. **Connection Pooling:** MongoDB connection optimization
5. **Error Handling:** Comprehensive error management
6. **Logging:** Request and error logging

This backend is production-ready and includes all the features specified in your requirements!
