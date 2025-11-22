import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    // Connect to database
    await connectDB();

    // Find user by ID
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return errorResponse("User not found", 404);
    }

    // Prepare user data
    const userData = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      country: user.country,
      role: user.role,
    };

    return successResponse({ user: userData });
  } catch (error: any) {
    console.error("Get user error:", error);
    return errorResponse("Failed to get user data", 500);
  }
}
