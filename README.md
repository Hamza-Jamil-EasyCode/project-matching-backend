# Node.js Backend Server with Authentication

A complete Node.js backend server with MongoDB, JWT authentication, and user management.

## Features

- ✅ User Registration and Login
- ✅ JWT Authentication
- ✅ Password Hashing with bcrypt
- ✅ Input Validation with Joi/Celebrate
- ✅ MongoDB Integration
- ✅ Security Middleware (Helmet, CORS, Rate Limiting)
- ✅ Error Handling
- ✅ User Profile Management

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

#### Protected Routes (Require JWT Token)
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

#### Admin Routes (Require Admin Role)
- `GET /api/auth/users` - Get all users (admin only)

### Other Routes
- `GET /api/health` - Health check endpoint

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/user-auth-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "programOfStudy": "Computer Science",
    "interest": "Web Development, Machine Learning, Data Science",
    "skills": ["JavaScript", "Python", "React", "Node.js"],
    "projectIdea": "I want to build a student matching platform that connects students with similar interests and skills for collaborative projects.",
    "availabilityDate": "2024-02-01T00:00:00.000Z",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Profile (Protected)
```bash
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile (Protected)
```bash
curl -X PUT http://localhost:4000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Smith",
    "programOfStudy": "Software Engineering",
    "interest": "Mobile Development, AI, Blockchain",
    "skills": ["React Native", "TensorFlow", "Solidity"],
    "projectIdea": "Updated project idea for a mobile app with AI features.",
    "availabilityDate": "2024-03-01T00:00:00.000Z"
  }'
```

## Project Structure

```
├── controllers/
│   └── userController.js      # User controller with auth logic
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── models/
│   └── User.js               # User Mongoose model
├── routes/
│   └── authRoutes.js         # Authentication routes
├── services/
│   └── userService.js        # User business logic
├── utils/
│   └── jwt.js               # JWT utility functions
├── validation/
│   └── authValidation.js    # Input validation schemas
├── server.js                # Main server file
└── package.json             # Dependencies and scripts
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Error handling

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT tokens
- **joi**: Input validation
- **celebrate**: Express validation middleware
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **dotenv**: Environment variables
