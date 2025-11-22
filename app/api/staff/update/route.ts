import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * PUT /api/staff/update
 * Update a staff member (admin only)
 */
export async function PUT(request: NextRequest) {
  console.log("✏️ PUT /api/staff/update - Updating staff member");
  
  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    console.log("✅ Admin authenticated:", user.email);

    // Get request body
    const body = await request.json();
    const {
      staffId,
      firstName,
      lastName,
      phone,
      staffRole,
      allowedMenus,
      isActive,
    } = body;

    console.log("📝 Updating staff:", staffId);

    // Validate required fields
    if (!staffId) {
      console.log("❌ Missing staff ID");
      return errorResponse("Staff ID is required", 400);
    }

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Find staff member
    const staff = await User.findOne({ _id: staffId, role: "staff" });
    if (!staff) {
      console.log("❌ Staff member not found");
      return errorResponse("Staff member not found", 404);
    }

    // Update fields
    if (firstName) staff.firstName = firstName;
    if (lastName) staff.lastName = lastName;
    if (phone !== undefined) staff.phone = phone;
    if (staffRole) staff.staffRole = staffRole;
    if (allowedMenus !== undefined) {
      // Ensure allowedMenus is an array and has at least Dashboard
      staff.allowedMenus = Array.isArray(allowedMenus) && allowedMenus.length > 0 
        ? allowedMenus 
        : ["Dashboard"];
      console.log("📋 Updating allowedMenus to:", staff.allowedMenus);
    }
    if (isActive !== undefined) staff.isActive = isActive;

    await staff.save();
    
    // Verify the save
    console.log("✅ Staff updated with allowedMenus:", staff.allowedMenus);

    console.log("✅ Staff member updated successfully");

    // Return updated staff data
    const staffData = {
      id: staff._id.toString(),
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      name: `${staff.firstName} ${staff.lastName}`,
      phone: staff.phone,
      role: staff.role,
      staffRole: staff.staffRole,
      allowedMenus: staff.allowedMenus,
      isActive: staff.isActive,
    };

    return successResponse({ staff: staffData }, "Staff member updated successfully");
  } catch (error: any) {
    console.error("❌ Update staff error:", error);
    console.error("Error stack:", error.stack);
    return errorResponse("Failed to update staff member", 500);
  }
}
