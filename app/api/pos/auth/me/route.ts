import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/auth/me
 * Get current staff user info
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("pos_auth_token")?.value;

        if (!token) {
            return errorResponse("Not authenticated", 401);
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return errorResponse("Invalid or expired token", 401);
        }

        await connectDB();

        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return errorResponse("User not found", 404);
        }

        const userData = {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            staffRole: user.staffRole,
        };

        return successResponse({ user: userData });
    } catch (error) {
        return errorResponse("Failed to get user info", 500);
    }
}
