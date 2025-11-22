#!/usr/bin/env node

/**
 * Quick script to create admin user with command-line arguments
 * Usage: node scripts/quick-admin.js <email> <password> <firstName> <lastName> [role]
 * Example: node scripts/quick-admin.js admin@hotel.com admin123 John Doe admin
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Get command-line arguments
const [,, email, password, firstName, lastName, role = 'admin'] = process.argv;

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/northerncapitalhotel';

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: String,
  country: String,
  role: { type: String, enum: ['guest', 'admin', 'staff'], default: 'guest' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createQuickAdmin() {
  try {
    // Validate arguments
    if (!email || !password || !firstName || !lastName) {
      console.log('\n❌ Usage: node scripts/quick-admin.js <email> <password> <firstName> <lastName> [role]');
      console.log('Example: node scripts/quick-admin.js admin@hotel.com admin123 John Doe admin\n');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('\n❌ Error: Password must be at least 6 characters.\n');
      process.exit(1);
    }

    if (role !== 'admin' && role !== 'staff') {
      console.log('\n❌ Error: Role must be either "admin" or "staff".\n');
      process.exit(1);
    }

    console.log('\n🔐 Creating admin user...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('⚠️  User already exists. Updating role and password...');
      
      const salt = await bcrypt.genSalt(12);
      existingUser.password = await bcrypt.hash(password, salt);
      existingUser.role = role;
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      await existingUser.save();
      
      console.log('✅ User updated successfully!');
    } else {
      // Hash password and create user
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const adminUser = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: role,
        isActive: true,
      });

      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Name:  ${firstName} ${lastName}`);
    console.log(`   Role:  ${role}`);
    console.log('\n🎉 Login at: http://localhost:3000/admin/login\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createQuickAdmin();
