import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";
import { successResponse, errorResponse, setAuthCookie } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return errorResponse("Please provide email and password", 400);
    }

    // Connect to database
    await connectDB();

    // Find user by email (include password for comparison)
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select("+password");

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Prepare user data (exclude password)
    const userData = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      country: user.country,
      role: user.role,
    };

    // Create response with auth cookie
    const response = successResponse(
      { user: userData, token },
      "Login successful"
    );

    // Set HTTP-only cookie
    return setAuthCookie(response, token);
  } catch (error: any) {
    console.error("Login error:", error);
    return errorResponse("Login failed. Please try again.", 500);
  }
}
