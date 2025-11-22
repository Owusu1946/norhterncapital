import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/staff/create
 * Create a new staff member (admin only)
 */
export async function POST(request: NextRequest) {
  console.log("👤 POST /api/staff/create - Creating new staff member");
  
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
      email,
      password,
      firstName,
      lastName,
      phone,
      staffRole,
      allowedMenus,
    } = body;

    console.log("📝 Creating staff with data:", { email, firstName, lastName, staffRole, allowedMenus });

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      console.log("❌ Missing required fields");
      return errorResponse("Email, password, first name, and last name are required", 400);
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format");
      return errorResponse("Invalid email format", 400);
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Password too short");
      return errorResponse("Password must be at least 6 characters", 400);
    }

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("❌ User already exists with this email");
      return errorResponse("A user with this email already exists", 400);
    }

    // Prepare allowed menus array
    const menuList = allowedMenus && Array.isArray(allowedMenus) && allowedMenus.length > 0 
      ? allowedMenus 
      : ["Dashboard", "Bookings", "Guests"];

    console.log("📋 Setting allowed menus:", menuList);

    // Create staff user
    const staff = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone: phone || "",
      role: "staff",
      staffRole: staffRole || "Receptionist",
      allowedMenus: menuList,
      isActive: true,
    });

    // Save the user
    await staff.save();

    // Verify the saved data
    console.log("✅ Staff saved with allowedMenus:", staff.allowedMenus);

    console.log("✅ Staff member created successfully:", staff._id);

    // Return staff data (without password)
    const staffData = {
      id: staff._id.toString(),
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      phone: staff.phone,
      role: staff.role,
      staffRole: staff.staffRole,
      allowedMenus: staff.allowedMenus,
      isActive: staff.isActive,
      createdAt: staff.createdAt,
    };

    return successResponse({ staff: staffData }, "Staff member created successfully", 201);
  } catch (error: any) {
    console.error("❌ Create staff error:", error);
    console.error("Error stack:", error.stack);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return errorResponse("A user with this email already exists", 400);
    }
    
    return errorResponse("Failed to create staff member", 500);
  }
}
