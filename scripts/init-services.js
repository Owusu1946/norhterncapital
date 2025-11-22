const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error("❌ MongoDB connection string not found in environment variables");
  process.exit(1);
}

// Service Schema
const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ["transport", "spa", "dining", "activities", "other"]
  },
  icon: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);

// Initial services data
const initialServices = [
  {
    name: "Airport Pickup",
    description: "Luxury vehicle pickup from Kotoka International Airport",
    price: 150,
    category: "transport"
  },
  {
    name: "Airport Drop-off",
    description: "Comfortable ride to Kotoka International Airport",
    price: 120,
    category: "transport"
  },
  {
    name: "City Car Rental",
    description: "Full day car rental with driver for city exploration",
    price: 350,
    category: "transport"
  },
  {
    name: "Spa Wellness Package",
    description: "Full body massage, facial treatment, and access to wellness center",
    price: 300,
    category: "spa"
  },
  {
    name: "Couples Spa Experience",
    description: "Romantic spa session for two with champagne service",
    price: 550,
    category: "spa"
  },
  {
    name: "Express Massage",
    description: "30-minute relaxing massage therapy",
    price: 100,
    category: "spa"
  },
  {
    name: "Premium Breakfast",
    description: "Continental breakfast served in your room or executive lounge",
    price: 45,
    category: "dining"
  },
  {
    name: "Fine Dining Experience",
    description: "3-course dinner at our signature restaurant with wine pairing",
    price: 180,
    category: "dining"
  },
  {
    name: "BBQ Night",
    description: "Special BBQ dinner on the rooftop terrace",
    price: 120,
    category: "dining"
  },
  {
    name: "Accra City Tour",
    description: "Guided tour of Accra's cultural landmarks and markets",
    price: 200,
    category: "activities"
  },
  {
    name: "Beach Day Excursion",
    description: "Day trip to beautiful coastal beaches with lunch included",
    price: 250,
    category: "activities"
  },
  {
    name: "Cultural Experience",
    description: "Traditional dance show and local craft workshop",
    price: 150,
    category: "activities"
  },
  {
    name: "Laundry Service",
    description: "Same-day laundry and dry cleaning service",
    price: 50,
    category: "other"
  },
  {
    name: "Business Center Access",
    description: "24-hour access to business center with printing and scanning",
    price: 30,
    category: "other"
  }
];

async function initializeServices() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🔄 Checking existing services...");
    const existingServices = await Service.find({});
    
    if (existingServices.length > 0) {
      console.log(`ℹ️ Found ${existingServices.length} existing services`);
      console.log("Do you want to replace them? (This will delete all existing services)");
      console.log("Press Ctrl+C to cancel or wait 5 seconds to continue...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log("🗑️ Removing existing services...");
      await Service.deleteMany({});
    }

    console.log("📝 Creating services...");
    let created = 0;
    let failed = 0;

    for (const serviceData of initialServices) {
      try {
        const service = await Service.create(serviceData);
        console.log(`✅ Created: ${service.name} (${service.category})`);
        created++;
      } catch (error) {
        console.error(`❌ Failed to create ${serviceData.name}:`, error.message);
        failed++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`✅ Successfully created: ${created} services`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed} services`);
    }

    // Show all services
    console.log("\n📋 All services in database:");
    const allServices = await Service.find({}).sort({ category: 1, name: 1 });
    
    const servicesByCategory = {};
    allServices.forEach(service => {
      if (!servicesByCategory[service.category]) {
        servicesByCategory[service.category] = [];
      }
      servicesByCategory[service.category].push({
        name: service.name,
        price: service.price
      });
    });

    Object.entries(servicesByCategory).forEach(([category, services]) => {
      console.log(`\n${category.toUpperCase()}:`);
      services.forEach(service => {
        console.log(`  - ${service.name}: ₵${service.price}`);
      });
    });

    console.log("\n✅ Services initialization complete!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the initialization
initializeServices();
