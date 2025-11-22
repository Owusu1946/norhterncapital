# Admin Authentication System

## 🔐 Overview

Complete admin authentication system for Northern Capital Hotel with secure login, role-based access control, and admin user management scripts.

---

## 🚀 Quick Start

### 1. Create Your First Admin User

**Interactive Mode:**
```bash
npm run create-admin
```

**Quick Mode (Command Line):**
```bash
npm run quick-admin admin@hotel.com admin123 John Doe admin
```

Or directly:
```bash
node scripts/quick-admin.js admin@hotel.com password123 John Doe admin
```

### 2. Login to Admin Panel

Visit: `http://localhost:3000/admin/login`

Use the credentials you just created.

---

## 📋 Features

### ✅ **Secure Authentication**
- Bcrypt password hashing (12 rounds)
- JWT tokens with 8-hour expiration
- HTTP-only cookies
- Role-based access control (admin/staff)
- Automatic session validation

### ✅ **Admin Login Page**
- Beautiful dark-themed UI
- Password visibility toggle
- Error handling
- Loading states
- Responsive design

### ✅ **Route Protection**
- Middleware protects all `/admin/*` routes
- Automatic redirect to login if not authenticated
- Role verification (admin/staff only)
- Token expiration handling

### ✅ **Admin User Scripts**
- Interactive admin creation
- Quick command-line creation
- Update existing users
- Role management

---

## 🛠️ Admin User Management

### Create Admin User (Interactive)

```bash
npm run create-admin
```

This will prompt you for:
- First Name
- Last Name
- Email
- Phone (optional)
- Country (optional)
- Password
- Role (admin/staff)

### Create Admin User (Quick)

```bash
npm run quick-admin <email> <password> <firstName> <lastName> [role]
```

**Examples:**

```bash
# Create admin user
npm run quick-admin admin@hotel.com SecurePass123 John Doe admin

# Create staff user
npm run quick-admin staff@hotel.com StaffPass456 Jane Smith staff
```

### Update Existing User to Admin

If a user already exists, the script will ask if you want to update them:

```bash
npm run create-admin
# Enter existing email
# Choose 'yes' to update role and password
```

---

## 🔑 Roles

### **Admin**
- Full access to all admin features
- Can manage bookings, users, payments
- Can view analytics and reports
- Can manage staff

### **Staff**
- Access to admin panel
- Can manage bookings
- Can view reports
- Limited administrative access

### **Guest**
- Regular user (no admin access)
- Can only access customer-facing pages

---

## 🌐 API Endpoints

### Admin Login
**POST** `/api/admin/login`

```json
{
  "email": "admin@hotel.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@hotel.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin"
    },
    "token": "..."
  }
}
```

### Admin Logout
**POST** `/api/admin/logout`

Clears the `admin_token` cookie.

---

## 🔒 Security Features

### 1. **Password Security**
- Bcrypt hashing with 12 salt rounds
- Minimum 6 characters required
- Never stored in plain text

### 2. **Session Security**
- HTTP-only cookies (prevents XSS)
- Secure flag in production (HTTPS only)
- SameSite: lax (CSRF protection)
- 8-hour session timeout

### 3. **Role-Based Access**
- Middleware checks role on every request
- Only admin/staff can access `/admin/*`
- Automatic redirect for unauthorized users

### 4. **Token Validation**
- JWT signature verification
- Expiration checking
- Role verification
- User active status check

---

## 📁 File Structure

```
app/
├── admin/
│   ├── login/
│   │   └── page.tsx              # Admin login page
│   └── [other admin pages]       # Protected by middleware
│
├── api/
│   └── admin/
│       ├── login/route.ts        # Admin login endpoint
│       └── logout/route.ts       # Admin logout endpoint
│
lib/
├── adminMiddleware.ts            # Admin authentication helpers
├── jwt.ts                        # JWT utilities
└── apiResponse.ts                # API response helpers

models/
└── User.ts                       # User model (with role field)

scripts/
├── create-admin.js               # Interactive admin creator
└── quick-admin.js                # Quick admin creator

middleware.ts                     # Next.js middleware (route protection)
```

---

## 🎯 Usage Examples

### Example 1: Create Super Admin

```bash
npm run quick-admin superadmin@hotel.com SuperSecure123! Super Admin admin
```

### Example 2: Create Staff Member

```bash
npm run quick-admin reception@hotel.com Staff123 Sarah Johnson staff
```

### Example 3: Interactive Creation

```bash
npm run create-admin

# Follow prompts:
First Name: Kenneth
Last Name: Owusu
Email: kenneth@hotel.com
Phone: +233 24 123 4567
Country: Ghana
Password: MySecurePass123
Role (admin/staff) [admin]: admin
```

---

## 🔐 Login Flow

```
1. User visits /admin (or any /admin/* route)
   ↓
2. Middleware checks for admin_token cookie
   ↓
3. If no token → Redirect to /admin/login
   ↓
4. User enters credentials
   ↓
5. POST /api/admin/login
   ↓
6. Verify email & password
   ↓
7. Check role (must be admin or staff)
   ↓
8. Generate JWT token
   ↓
9. Set admin_token cookie (8 hours)
   ↓
10. Redirect to /admin dashboard
    ↓
11. Middleware validates token on each request
```

---

## 🛡️ Middleware Protection

The middleware automatically:
- ✅ Protects all `/admin/*` routes
- ✅ Allows `/admin/login` without authentication
- ✅ Redirects unauthenticated users to login
- ✅ Redirects authenticated users away from login
- ✅ Verifies JWT token on every request
- ✅ Checks user role (admin/staff only)
- ✅ Handles expired tokens

---

## 📊 Admin Dashboard Access

After logging in, admins can access:
- `/admin` - Dashboard
- `/admin/bookings` - Manage bookings
- `/admin/payments` - View payments
- `/admin/guests` - Manage guests
- `/admin/staff` - Manage staff
- `/admin/analytics` - View analytics
- `/admin/profile` - Admin profile
- `/admin/settings` - System settings

---

## 🧪 Testing

### Test Admin Login

```bash
# 1. Create test admin
npm run quick-admin test@admin.com test123 Test Admin admin

# 2. Visit login page
http://localhost:3000/admin/login

# 3. Login with credentials
Email: test@admin.com
Password: test123

# 4. Should redirect to /admin dashboard
```

### Test Unauthorized Access

```bash
# 1. Visit admin page without login
http://localhost:3000/admin

# 2. Should redirect to /admin/login
```

---

## 🔧 Environment Variables

Add to `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/northerncapitalhotel

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Node Environment
NODE_ENV=development
```

---

## 🚨 Troubleshooting

### Issue: "User already exists"
**Solution**: Use the interactive script and choose to update the existing user.

### Issue: "Access denied. Admin privileges required"
**Solution**: Ensure the user role is set to 'admin' or 'staff', not 'guest'.

### Issue: "Invalid or expired session"
**Solution**: Login again. Sessions expire after 8 hours.

### Issue: Can't access admin pages
**Solution**: 
1. Check if MongoDB is running
2. Verify admin_token cookie exists
3. Check user role in database
4. Clear cookies and login again

---

## 📝 Default Admin Credentials

**For Development Only:**

You can create a default admin:

```bash
npm run quick-admin admin@northerncapital.com admin123 Admin User admin
```

**⚠️ IMPORTANT:** Change these credentials in production!

---

## 🎉 Summary

✅ **Admin login page** - Beautiful, secure, responsive  
✅ **Role-based access** - Admin and staff roles  
✅ **Route protection** - Middleware guards all admin routes  
✅ **Secure sessions** - 8-hour JWT tokens with HTTP-only cookies  
✅ **Admin scripts** - Easy user creation and management  
✅ **Password security** - Bcrypt hashing with 12 rounds  
✅ **Token validation** - Automatic verification on every request  

**Your admin system is production-ready!** 🚀

---

**Built with ❤️ for Northern Capital Hotel**
