/**
 * Migration script to add allowedMenus to existing staff users
 * Run this script to update staff users who don't have allowedMenus set
 */

import mongoose from "mongoose";
import connectDB from "../lib/mongodb";
import User from "../models/User";

async function migrateStaffMenus() {
  console.log("🚀 Starting staff menu migration...");

  try {
    // Connect to database
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Find all staff users without allowedMenus or with empty allowedMenus
    const staffWithoutMenus = await User.find({
      role: "staff",
      $or: [
        { allowedMenus: { $exists: false } },
        { allowedMenus: { $size: 0 } },
        { allowedMenus: null }
      ]
    });

    console.log(`📊 Found ${staffWithoutMenus.length} staff users without proper menu permissions`);

    if (staffWithoutMenus.length === 0) {
      console.log("✅ All staff users already have menu permissions set!");
      process.exit(0);
    }

    // Update each staff user with default menus
    for (const staff of staffWithoutMenus) {
      // Set default menus based on their role
      let defaultMenus = ["Dashboard", "Bookings", "Guests"];
      
      // You can customize based on staffRole if needed
      if (staff.staffRole === "Manager") {
        defaultMenus = ["Dashboard", "Analytics", "Guests", "Bookings", "Payments", "Staff"];
      } else if (staff.staffRole === "Receptionist" || staff.staffRole === "Front Desk") {
        defaultMenus = ["Dashboard", "Bookings", "Guests", "Messages"];
      } else if (staff.staffRole === "Housekeeping") {
        defaultMenus = ["Dashboard", "Rooms"];
      }

      staff.allowedMenus = defaultMenus;
      await staff.save();
      
      console.log(`✅ Updated ${staff.firstName} ${staff.lastName} (${staff.email}) with menus: ${defaultMenus.join(", ")}`);
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log(`✅ Updated ${staffWithoutMenus.length} staff users with menu permissions`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
    process.exit(0);
  }
}

// Run the migration
migrateStaffMenus();
