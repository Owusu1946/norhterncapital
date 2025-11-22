import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdminRole } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/fix-staff-menus
 * Fix/migrate existing staff users to add default allowedMenus
 * Admin only endpoint
 */
export async function POST(request: NextRequest) {
  console.log("🔧 POST /api/admin/fix-staff-menus - Fixing staff menu permissions");
  
  try {
    // Authenticate admin (only admin, not staff)
    const { user, error } = await requireAdminRole(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    console.log("✅ Admin authenticated:", user.email);

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Find all staff users without proper allowedMenus
    const staffWithoutMenus = await User.find({
      role: "staff",
      $or: [
        { allowedMenus: { $exists: false } },
        { allowedMenus: { $size: 0 } },
        { allowedMenus: null }
      ]
    });

    console.log(`📊 Found ${staffWithoutMenus.length} staff users without proper menu permissions`);

    const updatedStaff = [];

    // Update each staff user with default menus
    for (const staff of staffWithoutMenus) {
      // Set default menus based on their staffRole
      let defaultMenus = ["Dashboard", "Bookings", "Guests"];
      
      // Customize based on staffRole
      if (staff.staffRole === "Manager") {
        defaultMenus = ["Dashboard", "Analytics", "Guests", "Bookings", "Payments", "Staff"];
      } else if (staff.staffRole === "Receptionist" || staff.staffRole === "Front Desk") {
        defaultMenus = ["Dashboard", "Bookings", "Guests", "Messages"];
      } else if (staff.staffRole === "Housekeeping") {
        defaultMenus = ["Dashboard", "Rooms"];
      }

      staff.allowedMenus = defaultMenus;
      await staff.save();
      
      updatedStaff.push({
        id: staff._id.toString(),
        email: staff.email,
        name: `${staff.firstName} ${staff.lastName}`,
        staffRole: staff.staffRole,
        allowedMenus: defaultMenus
      });
      
      console.log(`✅ Updated ${staff.firstName} ${staff.lastName} with menus: ${defaultMenus.join(", ")}`);
    }

    return successResponse(
      { 
        updated: updatedStaff.length,
        staff: updatedStaff
      }, 
      `Successfully updated ${updatedStaff.length} staff members with menu permissions`
    );
  } catch (error: any) {
    console.error("❌ Fix staff menus error:", error);
    console.error("Error stack:", error.stack);
    return errorResponse("Failed to fix staff menu permissions", 500);
  }
}

/**
 * GET /api/admin/fix-staff-menus
 * Check how many staff need menu fixes
 * Admin only endpoint
 */
export async function GET(request: NextRequest) {
  console.log("🔍 GET /api/admin/fix-staff-menus - Checking staff menu status");
  
  try {
    // Authenticate admin
    const { user, error } = await requireAdminRole(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    console.log("✅ Admin authenticated:", user.email);

    // Connect to database
    await connectDB();

    // Count staff users without proper allowedMenus
    const staffWithoutMenus = await User.countDocuments({
      role: "staff",
      $or: [
        { allowedMenus: { $exists: false } },
        { allowedMenus: { $size: 0 } },
        { allowedMenus: null }
      ]
    });

    // Get all staff with their menu status
    const allStaff = await User.find({ role: "staff" })
      .select("email firstName lastName staffRole allowedMenus")
      .lean();

    const staffStatus = allStaff.map(staff => ({
      email: staff.email,
      name: `${staff.firstName} ${staff.lastName}`,
      staffRole: staff.staffRole,
      hasMenus: staff.allowedMenus && staff.allowedMenus.length > 0,
      menuCount: staff.allowedMenus ? staff.allowedMenus.length : 0,
      allowedMenus: staff.allowedMenus || []
    }));

    return successResponse({
      needsFix: staffWithoutMenus,
      totalStaff: allStaff.length,
      staffStatus
    });
  } catch (error: any) {
    console.error("❌ Check staff menus error:", error);
    return errorResponse("Failed to check staff menu status", 500);
  }
}
