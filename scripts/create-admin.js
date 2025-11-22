#!/usr/bin/env node

/**
 * Script to create admin users
 * Usage: node scripts/create-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/northerncapitalhotel';

// User Schema (same as in models/User.ts)
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: String,
  country: String,
  role: {
    type: String,
    enum: ['guest', 'admin', 'staff'],
    default: 'guest',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    console.log('\n🔐 Northern Capital Hotel - Admin User Creator\n');
    console.log('━'.repeat(50));
    
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin details
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const email = await question('Email: ');
    const phone = await question('Phone (optional): ');
    const country = await question('Country (optional): ');
    const password = await question('Password (min. 6 characters): ');
    const role = await question('Role (admin/staff) [admin]: ') || 'admin';

    // Validate inputs
    if (!firstName || !lastName || !email || !password) {
      console.log('\n❌ Error: First name, last name, email, and password are required.');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('\n❌ Error: Password must be at least 6 characters.');
      process.exit(1);
    }

    if (role !== 'admin' && role !== 'staff') {
      console.log('\n❌ Error: Role must be either "admin" or "staff".');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('\n❌ Error: A user with this email already exists.');
      
      // Ask if they want to update the role
      const update = await question('\nUpdate existing user to admin/staff? (yes/no): ');
      if (update.toLowerCase() === 'yes' || update.toLowerCase() === 'y') {
        existingUser.role = role;
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        if (phone) existingUser.phone = phone;
        if (country) existingUser.country = country;
        
        // Update password if provided
        const salt = await bcrypt.genSalt(12);
        existingUser.password = await bcrypt.hash(password, salt);
        
        await existingUser.save();
        
        console.log('\n✅ User updated successfully!');
        console.log('\n📋 User Details:');
        console.log('━'.repeat(50));
        console.log(`Name:  ${existingUser.firstName} ${existingUser.lastName}`);
        console.log(`Email: ${existingUser.email}`);
        console.log(`Role:  ${existingUser.role}`);
        console.log('━'.repeat(50));
      }
      
      await mongoose.disconnect();
      rl.close();
      process.exit(0);
    }

    // Hash password
    console.log('\n🔒 Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
      country: country.trim() || undefined,
      role: role,
      isActive: true,
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📋 Admin Details:');
    console.log('━'.repeat(50));
    console.log(`ID:    ${adminUser._id}`);
    console.log(`Name:  ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role:  ${adminUser.role}`);
    console.log(`Phone: ${adminUser.phone || 'N/A'}`);
    console.log('━'.repeat(50));
    console.log('\n🎉 You can now login at: http://localhost:3000/admin/login\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    rl.close();
  }
}

// Run the script
createAdmin();
