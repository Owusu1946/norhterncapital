import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/pos/auth/signup
 * Register a new staff user
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, phone, staffRole } = body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return errorResponse("Please provide all required fields", 400);
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return errorResponse("Please provide a valid email address", 400);
        }

        // Validate password length
        if (password.length < 6) {
            return errorResponse("Password must be at least 6 characters", 400);
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return errorResponse("An account with this email already exists", 409);
        }

        // Create new staff user
        const user = await User.create({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            phone,
            country: "Ghana",
            role: "staff",
            staffRole: staffRole || "Cashier",
            isActive: true,
        });

        // Generate JWT token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            staffRole: user.staffRole,
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
            "Account created successfully",
            201
        );

        // Set POS-specific HTTP-only cookie
        response.cookies.set({
            name: "pos_auth_token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("POS Signup error:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return errorResponse(messages[0], 400);
        }

        if (error.code === 11000) {
            return errorResponse("An account with this email already exists", 409);
        }

        return errorResponse("Signup failed. Please try again.", 500);
    }
}
