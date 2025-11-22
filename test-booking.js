#!/usr/bin/env node

/**
 * Test script for booking API
 * Run: node test-booking.js
 */

const API_URL = 'http://localhost:3000';

async function testCreateBooking() {
  console.log('🧪 Testing Booking Creation...\n');

  const bookingData = {
    guestFirstName: 'Test',
    guestLastName: 'User',
    guestEmail: 'test@example.com',
    guestPhone: '+233 24 123 4567',
    guestCountry: 'Ghana',
    specialRequests: 'Late check-in please',
    
    roomSlug: 'executive-suite',
    roomName: 'Executive Suite',
    roomImage: '/rooms/executive.jpg',
    pricePerNight: 450,
    numberOfRooms: 1,
    
    checkIn: '2025-12-01',
    checkOut: '2025-12-05',
    nights: 4,
    
    adults: 2,
    children: 1,
    totalGuests: 3,
    
    additionalServices: [
      { id: 'airport-pickup', name: 'Airport Pickup', price: 150 },
      { id: 'spa-package', name: 'Spa Wellness Package', price: 300 }
    ],
    
    totalAmount: 2250,
    paymentMethod: 'card'
  };

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${API_URL}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Booking created successfully!');
      console.log(`⚡ Response time: ${duration}ms\n`);
      console.log('📋 Booking Details:');
      console.log(JSON.stringify(data.data.booking, null, 2));
      console.log('\n✨ Booking saved to MongoDB!');
    } else {
      console.log('❌ Booking creation failed:');
      console.log(data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. MongoDB is running');
    console.log('   2. .env.local has MONGODB_URI and JWT_SECRET');
    console.log('   3. Development server is running (npm run dev)');
  }
}

// Run test
testCreateBooking();
