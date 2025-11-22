# Admin Login Debug Guide

## 🔍 What I Fixed

### 1. **Cookie Path Issue**
- **Problem**: Cookie was set with `path: "/admin"` which limited its scope
- **Fix**: Changed to `path: "/"` so cookie is accessible across all routes

### 2. **Added Comprehensive Logging**
- ✅ Server-side API logging (detailed step-by-step)
- ✅ Client-side login logging (request/response tracking)
- ✅ Middleware logging (route protection verification)

---

## 🧪 How to Test

### Step 1: Clear Browser Data
```
1. Open DevTools (F12)
2. Go to Application tab
3. Clear all cookies
4. Clear local storage
5. Refresh page
```

### Step 2: Login with Your Admin Account
```
Email: admin@admin.com
Password: admin123
```

### Step 3: Check Console Logs

**Browser Console (Client):**
```
🔐 ===== CLIENT: ADMIN LOGIN STARTED =====
📧 Email: admin@admin.com
🔒 Password length: 8
📤 Sending login request to /api/admin/login...
📥 Response status: 200
📥 Response ok: true
📦 Response data: { success: true, ... }
✅ Login successful!
👤 User data: { id: "...", email: "...", role: "admin" }
🎫 Token received: Yes
🔄 Redirecting to /admin...
✅ Redirect initiated
===== CLIENT: ADMIN LOGIN ENDED =====
```

**Server Console (Terminal):**
```
🔐 ===== ADMIN LOGIN ATTEMPT =====
📥 Parsing request body...
✅ Email received: admin@admin.com
✅ Password length: 8
📡 Connecting to MongoDB...
✅ Connected to MongoDB
🔍 Looking for user: admin@admin.com
✅ User found: { id: "...", email: "...", role: "admin", isActive: true }
✅ User has admin/staff role: admin
🔒 Comparing passwords...
Password valid: true
✅ Password is valid
🎫 Generating JWT token...
✅ Token generated (length): 200+
📦 User data prepared: { ... }
🍪 Setting admin_token cookie...
✅ Cookie set successfully
🎉 Admin login successful!
===== END ADMIN LOGIN =====
```

**Middleware Console:**
```
🛡️ Middleware: Checking path: /admin
🔒 Protected admin route detected
🍪 Admin token present: true
🔍 Verifying token...
Token decoded: ✅ Valid
👤 User role: admin
✅ Access granted
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Spinning forever, nothing happens"
**Possible Causes:**
1. MongoDB not running
2. Network error
3. CORS issue
4. Cookie not being set

**Check:**
```bash
# Check if MongoDB is running
mongosh

# Check server logs in terminal
# Should see detailed login logs
```

### Issue 2: "Invalid credentials" error
**Check:**
1. Email is correct (case-insensitive)
2. Password is correct
3. User exists in database
4. User role is 'admin' or 'staff'

**Verify in MongoDB:**
```bash
mongosh
use northerncapitalhotel
db.users.findOne({ email: "admin@admin.com" })
```

### Issue 3: Redirects to login immediately after login
**Possible Causes:**
1. Cookie not being set
2. Cookie path issue (FIXED)
3. Token generation failed

**Check Browser DevTools:**
```
Application → Cookies → localhost
Look for: admin_token
```

### Issue 4: "Access denied" error
**Check:**
- User role must be 'admin' or 'staff', not 'guest'

---

## 📊 What the Logs Tell You

### Server Logs

| Log Message | Meaning |
|------------|---------|
| `📥 Parsing request body...` | API received the request |
| `✅ Connected to MongoDB` | Database connection OK |
| `✅ User found` | User exists in database |
| `✅ User has admin/staff role` | User has correct permissions |
| `Password valid: true` | Password matches |
| `✅ Token generated` | JWT created successfully |
| `✅ Cookie set successfully` | Cookie sent to browser |
| `🎉 Admin login successful!` | Everything worked! |

### Client Logs

| Log Message | Meaning |
|------------|---------|
| `📤 Sending login request` | Form submitted |
| `📥 Response status: 200` | Server responded OK |
| `✅ Login successful!` | API returned success |
| `🎫 Token received: Yes` | Token in response |
| `🔄 Redirecting to /admin` | Navigation started |

### Middleware Logs

| Log Message | Meaning |
|------------|---------|
| `🍪 Admin token present: true` | Cookie found |
| `Token decoded: ✅ Valid` | Token is valid |
| `👤 User role: admin` | User has admin role |
| `✅ Access granted` | Allowed to access page |

---

## 🔧 Quick Fixes

### Fix 1: Clear Everything and Retry
```bash
# 1. Stop server (Ctrl+C)
# 2. Clear browser cookies
# 3. Restart server
npm run dev
# 4. Try login again
```

### Fix 2: Recreate Admin User
```bash
# Delete old admin
mongosh
use northerncapitalhotel
db.users.deleteOne({ email: "admin@admin.com" })

# Create new admin
npm run quick-admin admin@admin.com admin123 Admin User admin
```

### Fix 3: Check JWT Secret
```bash
# Make sure JWT_SECRET is set in .env.local
echo $env:JWT_SECRET  # Windows PowerShell
# or
echo $JWT_SECRET      # Linux/Mac

# If not set, add to .env.local:
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Browser console shows "Login successful!"
2. ✅ Server console shows "Admin login successful!"
3. ✅ You're redirected to `/admin` dashboard
4. ✅ Cookie `admin_token` appears in DevTools
5. ✅ No error messages in console
6. ✅ Middleware allows access to admin pages

---

## 📞 Still Having Issues?

Check these in order:

1. **MongoDB Running?**
   ```bash
   mongosh
   # Should connect without error
   ```

2. **User Exists?**
   ```bash
   mongosh
   use northerncapitalhotel
   db.users.findOne({ email: "admin@admin.com" })
   # Should return user object
   ```

3. **Environment Variables?**
   ```bash
   # Check .env.local exists with:
   MONGODB_URI=mongodb://localhost:27017/northerncapitalhotel
   JWT_SECRET=your-secret-key
   ```

4. **Server Running?**
   ```bash
   npm run dev
   # Should show "Ready on http://localhost:3000"
   ```

5. **Browser Console Errors?**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

---

## 🎯 Expected Flow

```
1. Visit /admin/login
   ↓
2. Enter credentials
   ↓
3. Click "Sign In"
   ↓
4. [CLIENT] Send POST to /api/admin/login
   ↓
5. [SERVER] Verify credentials
   ↓
6. [SERVER] Generate JWT token
   ↓
7. [SERVER] Set admin_token cookie
   ↓
8. [SERVER] Return success response
   ↓
9. [CLIENT] Receive response
   ↓
10. [CLIENT] Redirect to /admin
    ↓
11. [MIDDLEWARE] Check admin_token
    ↓
12. [MIDDLEWARE] Verify token
    ↓
13. [MIDDLEWARE] Allow access
    ↓
14. ✅ Admin dashboard loads
```

---

**All logs are now active! Check your browser console and server terminal for detailed debugging information.** 🔍✨
