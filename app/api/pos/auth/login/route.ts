import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/pos/auth/login
 * Authenticate staff user for POS dashboard
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return errorResponse("Please provide email and password", 400);
        }

        await connectDB();

        // Find user by email (must be staff or admin role)
        const user = await User.findOne({
            email: email.toLowerCase(),
            isActive: true,
            role: { $in: ["staff", "admin"] }
        }).select("+password");

        if (!user) {
            return errorResponse("Invalid credentials or not authorized for POS", 401);
        }

        // Compare passwords
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return errorResponse("Invalid credentials", 401);
        }

        // Generate JWT token with staff info
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            staffRole: user.staffRole,
            allowedMenus: user.allowedMenus,
        });

        // Prepare user data
        const userData = {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            staffRole: user.staffRole,
        };

        // Create response
        const response = successResponse(
            { user: userData, token },
            "Login successful"
        );

        // Set POS-specific HTTP-only cookie
        response.cookies.set({
            name: "pos_auth_token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("POS Login error:", error);
        return errorResponse("Login failed. Please try again.", 500);
    }
}
