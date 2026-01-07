import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * PUT /api/pos/auth/update-password
 * Update current user's password
 */
export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get("pos_auth_token")?.value;

        if (!token) {
            return errorResponse("Not authenticated", 401);
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return errorResponse("Invalid token", 401);
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return errorResponse("Please provide current and new password", 400);
        }

        if (newPassword.length < 6) {
            return errorResponse("New password must be at least 6 characters", 400);
        }

        await connectDB();

        const user = await User.findById(decoded.userId).select("+password");

        if (!user) {
            return errorResponse("User not found", 404);
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return errorResponse("Incorrect current password", 400);
        }

        // Update password
        user.password = newPassword;
        await user.save();

        return successResponse(null, "Password updated successfully");

    } catch (error: any) {
        console.error("Update password error:", error);
        return errorResponse("Failed to update password", 500);
    }
}
