# Backend Setup Guide - Northern Capital Hotel

## 🚀 MongoDB Authentication Backend

This guide will help you set up the MongoDB authentication backend for the hotel management system.

## Prerequisites

- MongoDB installed locally or MongoDB Atlas account
- Node.js 18+ installed
- npm or yarn package manager

## 📦 Installation

The required dependencies have been installed:
- `mongoose` - MongoDB ODM for Node.js
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation and verification
- `cookie` - Cookie parsing

## 🔧 Configuration

### 1. Set up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/northerncapitalhotel

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Generate a secure JWT secret:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2. Start MongoDB

**Local MongoDB:**
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

**MongoDB Atlas:**
- Use your Atlas connection string in `MONGODB_URI`
- Example: `mongodb+srv://username:password@cluster.mongodb.net/northerncapitalhotel`

### 3. Start the Development Server

```bash
npm run dev
```

## 🏗️ Architecture Overview

### Backend Structure

```
app/api/auth/
├── signup/route.ts    # POST - Register new user
├── login/route.ts     # POST - Authenticate user
├── logout/route.ts    # POST - Clear auth cookie
└── me/route.ts        # GET - Get current user

lib/
├── mongodb.ts         # MongoDB connection with pooling
├── jwt.ts             # JWT utilities
├── apiResponse.ts     # API response helpers
└── authMiddleware.ts  # Authentication middleware

models/
└── User.ts            # User model with bcrypt hashing
```

### Key Features

✅ **Optimized MongoDB Connection**
- Connection pooling (maxPoolSize: 10)
- Automatic reconnection
- Cached connections in development
- Fast server selection (5s timeout)

✅ **Security Best Practices**
- Bcrypt password hashing (12 salt rounds)
- HTTP-only cookies (XSS protection)
- JWT tokens with 7-day expiration
- CSRF protection (SameSite: lax)
- Password never returned in API responses

✅ **Performance Optimizations**
- Indexed email field for fast lookups
- Compound indexes for common queries
- Connection caching across requests
- Minimal database queries

✅ **Type Safety**
- Full TypeScript support
- Mongoose schema validation
- Type-safe API responses

## 📡 API Endpoints

### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+233 24 123 4567",
  "country": "Ghana"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+233 24 123 4567",
      "country": "Ghana",
      "role": "guest"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

### GET /api/auth/me
Get current authenticated user (requires auth cookie).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### POST /api/auth/logout
Clear authentication cookie.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 🔐 Authentication Flow

1. **Signup/Login**: User submits credentials
2. **Password Hashing**: Bcrypt hashes password (12 rounds)
3. **JWT Generation**: Server creates JWT with user data
4. **Cookie Setting**: HTTP-only cookie set with JWT
5. **Subsequent Requests**: Cookie automatically sent
6. **Token Verification**: Server verifies JWT on protected routes

## 🛡️ Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Cookies**: HTTPS only in production
- **SameSite Protection**: CSRF mitigation
- **Token Expiration**: 7-day JWT lifetime
- **Email Validation**: Regex pattern matching
- **Password Minimum**: 6 characters required
- **Active User Check**: Inactive users can't login

## 🚀 Performance Optimizations

### Connection Pooling
```typescript
maxPoolSize: 10 // Reuse up to 10 connections
```

### Indexed Fields
```typescript
email: { index: true }  // Fast user lookups
{ email: 1, isActive: 1 }  // Compound index
```

### Connection Caching
```typescript
// Cached connection in development
global.mongoose = { conn, promise }
```

### Fast Timeouts
```typescript
serverSelectionTimeoutMS: 5000  // 5s instead of 30s
socketTimeoutMS: 45000  // Close idle sockets
```

## 🧪 Testing

### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📝 User Model Schema

```typescript
{
  email: String (unique, indexed, lowercase)
  password: String (hashed, not returned)
  firstName: String
  lastName: String
  phone: String (optional)
  country: String (optional)
  role: "guest" | "admin" | "staff" (default: "guest")
  isActive: Boolean (default: true)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## 🔄 Frontend Integration

The `AuthContext` has been updated to use the new API endpoints:
- Signup: Calls `/api/auth/signup`
- Login: Calls `/api/auth/login`
- Logout: Calls `/api/auth/logout`
- Session Check: Calls `/api/auth/me` on mount

All authentication is now handled by MongoDB with JWT tokens!

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running locally or check your connection string.

### JWT Secret Missing
```
Error: Please add your JWT_SECRET to .env.local
```
**Solution**: Add `JWT_SECRET` to your `.env.local` file.

### Cookie Not Being Set
**Solution**: Ensure `credentials: "include"` is set in fetch requests.

## 📚 Next Steps

1. ✅ MongoDB authentication implemented
2. 🔜 Add password reset functionality
3. 🔜 Implement email verification
4. 🔜 Add OAuth providers (Google, Facebook)
5. 🔜 Create admin dashboard authentication
6. 🔜 Add booking API endpoints
7. 🔜 Implement payment processing

---

**Built with ❤️ for Northern Capital Hotel**
