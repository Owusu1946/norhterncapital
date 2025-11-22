import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/staff/all
 * Get all staff members (admin only)
 */
export async function GET(request: NextRequest) {
  console.log("👥 GET /api/staff/all - Fetching all staff members");
  
  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    console.log("✅ Admin authenticated:", user.email);

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Get all staff members
    const staff = await User.find({ role: "staff" })
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .lean();

    console.log("📦 Fetched", staff.length, "staff members");

    // Format staff data
    const formattedStaff = staff.map((member) => ({
      id: member._id.toString(),
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      name: `${member.firstName} ${member.lastName}`,
      phone: member.phone || "",
      role: member.role,
      staffRole: member.staffRole || "Receptionist",
      allowedMenus: member.allowedMenus || ["Dashboard", "Bookings", "Guests"],
      isActive: member.isActive,
      createdAt: member.createdAt,
    }));

    console.log("✅ Returning", formattedStaff.length, "formatted staff members");
    
    return successResponse({ staff: formattedStaff });
  } catch (error: any) {
    console.error("❌ Get all staff error:", error);
    console.error("Error stack:", error.stack);
    return errorResponse("Failed to fetch staff members", 500);
  }
}
