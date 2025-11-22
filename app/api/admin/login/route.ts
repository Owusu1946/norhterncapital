import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";
import { successResponse, errorResponse, setAuthCookie } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 * Admin login endpoint - only allows admin and staff users
 */
export async function POST(request: NextRequest) {
  console.log("\n🔐 ===== ADMIN LOGIN ATTEMPT =====");
  
  try {
    // Parse request body
    console.log("📥 Parsing request body...");
    const body = await request.json();
    const { email, password } = body;
    console.log("✅ Email received:", email);
    console.log("✅ Password length:", password?.length || 0);

    // Validate required fields
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return errorResponse("Please provide email and password", 400);
    }

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Find user by email (include password for comparison)
    console.log("🔍 Looking for user:", email.toLowerCase());
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select("+password");

    if (!user) {
      console.log("❌ User not found or inactive");
      return errorResponse("Invalid email or password", 401);
    }

    console.log("✅ User found:", {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    // Check if user is admin or staff
    if (user.role !== "admin" && user.role !== "staff") {
      console.log("❌ User role is not admin/staff:", user.role);
      return errorResponse("Access denied. Admin privileges required.", 403);
    }

    console.log("✅ User has admin/staff role:", user.role);

    // Compare passwords
    console.log("🔒 Comparing passwords...");
    const isPasswordValid = await user.comparePassword(password);
    console.log("Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return errorResponse("Invalid email or password", 401);
    }

    console.log("✅ Password is valid");

    // Generate JWT token
    console.log("🎫 Generating JWT token...");
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      staffRole: user.staffRole || "",
      allowedMenus: user.allowedMenus || [],
    });
    console.log("✅ Token generated (length):", token.length);

    // Prepare user data (exclude password)
    const userData = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      country: user.country,
      role: user.role,
      staffRole: user.staffRole || "",
      allowedMenus: user.allowedMenus || [],
    };

    console.log("📦 User data prepared:", userData);

    // Create response with auth cookie
    const response = successResponse(
      { user: userData, token },
      "Admin login successful"
    );

    // Set HTTP-only cookie
    console.log("🍪 Setting auth_token cookie...");
    response.cookies.set({
      name: "auth_token",  // Changed to auth_token for consistency
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours for admin sessions
      path: "/",  // Changed from "/admin" to "/" for broader access
    });

    console.log("✅ Cookie set successfully");
    console.log("🎉 Admin login successful!");
    console.log("===== END ADMIN LOGIN =====\n");

    return response;
  } catch (error: any) {
    console.error("❌ Admin login error:", error);
    console.error("Error stack:", error.stack);
    console.log("===== END ADMIN LOGIN (ERROR) =====\n");
    return errorResponse("Login failed. Please try again.", 500);
  }
}
