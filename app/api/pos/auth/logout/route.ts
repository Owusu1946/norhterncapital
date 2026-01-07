import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/pos/auth/logout
 * Logout staff user
 */
export async function POST(request: NextRequest) {
    try {
        const response = successResponse({}, "Logged out successfully");

        // Clear POS auth cookie
        response.cookies.set({
            name: "pos_auth_token",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        });

        return response;
    } catch (error) {
        return errorResponse("Logout failed", 500);
    }
}
