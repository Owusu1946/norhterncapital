import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/staff/fix-menus
 * Fix existing staff users by adding default allowedMenus
 */
export async function GET(request: NextRequest) {
  console.log("🔧 GET /api/staff/fix-menus - Fixing staff menu permissions");
  
  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    // Only allow admin to run this fix
    if (user.role !== "admin") {
      console.log("❌ Only admin can run this fix");
      return errorResponse("Only admin can run this fix", 403);
    }

    console.log("✅ Admin authenticated:", user.email);

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Find all staff users without allowedMenus
    const staffWithoutMenus = await User.find({
      role: "staff",
      $or: [
        { allowedMenus: { $exists: false } },
        { allowedMenus: { $size: 0 } },
        { allowedMenus: null }
      ]
    });

    console.log(`📦 Found ${staffWithoutMenus.length} staff users without menu permissions`);

    // Update each staff user with default menus
    const defaultMenus = ["Dashboard", "Bookings", "Guests"];
    const updates = [];

    for (const staff of staffWithoutMenus) {
      staff.allowedMenus = defaultMenus;
      staff.staffRole = staff.staffRole || "Receptionist";
      await staff.save();
      
      updates.push({
        id: staff._id.toString(),
        email: staff.email,
        name: `${staff.firstName} ${staff.lastName}`,
        allowedMenus: staff.allowedMenus,
        staffRole: staff.staffRole
      });
      
      console.log(`✅ Fixed menu permissions for: ${staff.email}`);
    }

    // Also ensure admin users have empty allowedMenus (they see all)
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      if (!admin.allowedMenus) {
        admin.allowedMenus = [];
        await admin.save();
        console.log(`✅ Fixed admin permissions for: ${admin.email}`);
      }
    }

    console.log("✅ All staff menu permissions fixed");
    
    return successResponse({ 
      fixed: updates.length,
      users: updates
    }, `Fixed menu permissions for ${updates.length} staff users`);
  } catch (error: any) {
    console.error("❌ Fix menus error:", error);
    console.error("Error stack:", error.stack);
    return errorResponse("Failed to fix menu permissions", 500);
  }
}
