#!/usr/bin/env node

/**
 * Setup script to create .env.local file with MongoDB and JWT configuration
 * Run: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

// Generate a secure random JWT secret
function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('Please manually add the following to your .env.local file:\n');
  console.log('MONGODB_URI=mongodb://localhost:27017/northerncapitalhotel');
  console.log(`JWT_SECRET=${generateJWTSecret()}\n`);
  process.exit(0);
}

// Read .env.example
let envContent = '';
if (fs.existsSync(envExamplePath)) {
  envContent = fs.readFileSync(envExamplePath, 'utf8');
}

// Replace placeholder values
const jwtSecret = generateJWTSecret();
envContent = envContent.replace(
  'JWT_SECRET=your-super-secret-jwt-key-change-this-in-production',
  `JWT_SECRET=${jwtSecret}`
);

// Write to .env.local
fs.writeFileSync(envPath, envContent);

console.log('✅ .env.local file created successfully!\n');
console.log('📝 Configuration:');
console.log('   - MongoDB URI: mongodb://localhost:27017/northerncapitalhotel');
console.log('   - JWT Secret: Generated securely\n');
console.log('🚀 Next steps:');
console.log('   1. Make sure MongoDB is running locally');
console.log('   2. Run: npm run dev');
console.log('   3. Test authentication at http://localhost:3000/auth\n');
console.log('💡 Tip: Update MONGODB_URI in .env.local if using MongoDB Atlas\n');
