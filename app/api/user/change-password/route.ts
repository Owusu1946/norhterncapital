import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateWithDB } from "@/lib/authMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * PUT /api/user/change-password
 * Change user password
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authenticateWithDB(request);
    if (error) return error;

    // Parse request body
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return errorResponse("Current password and new password are required", 400);
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return errorResponse("New password must be at least 6 characters", 400);
    }

    // Connect to database
    await connectDB();

    // Get user with password field
    const userWithPassword = await User.findById(user._id).select("+password");

    if (!userWithPassword) {
      return errorResponse("User not found", 404);
    }

    // Verify current password
    const isPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return errorResponse("Current password is incorrect", 401);
    }

    // Update password (will be hashed by pre-save hook)
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    return successResponse(
      null,
      "Password changed successfully"
    );
  } catch (error: any) {
    console.error("Change password error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return errorResponse(messages[0], 400);
    }

    return errorResponse("Failed to change password", 500);
  }
}
