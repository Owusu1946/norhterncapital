import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateWithDB } from "@/lib/authMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * PUT /api/user/update-profile
 * Update user profile information
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authenticateWithDB(request);
    if (error) return error;

    // Parse request body
    const body = await request.json();
    const { firstName, lastName, phone, country } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return errorResponse("First name and last name are required", 400);
    }

    // Connect to database
    await connectDB();

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || user.phone,
        country: country?.trim() || user.country,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return errorResponse("User not found", 404);
    }

    // Prepare response data
    const userData = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      country: updatedUser.country,
      role: updatedUser.role,
    };

    return successResponse(
      { user: userData },
      "Profile updated successfully"
    );
  } catch (error: any) {
    console.error("Update profile error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return errorResponse(messages[0], 400);
    }

    return errorResponse("Failed to update profile", 500);
  }
}
