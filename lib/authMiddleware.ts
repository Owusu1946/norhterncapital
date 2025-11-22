import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";
import { errorResponse } from "./apiResponse";
import connectDB from "./mongodb";
import User from "@/models/User";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload & { dbUser?: any };
}

/**
 * Middleware to verify JWT token and attach user to request
 * Usage: const { user, error } = await authenticate(request);
 */
export async function authenticate(
  request: NextRequest
): Promise<{ user: JWTPayload | null; error: any }> {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return { user: null, error: errorResponse("Not authenticated", 401) };
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return { user: null, error: errorResponse("Invalid or expired token", 401) };
    }

    return { user: decoded, error: null };
  } catch (error) {
    return { user: null, error: errorResponse("Authentication failed", 401) };
  }
}

/**
 * Middleware to verify JWT token and fetch user from database
 * Usage: const { user, error } = await authenticateWithDB(request);
 */
export async function authenticateWithDB(
  request: NextRequest
): Promise<{ user: any | null; error: any }> {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return { user: null, error: errorResponse("Not authenticated", 401) };
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return { user: null, error: errorResponse("Invalid or expired token", 401) };
    }

    // Connect to database
    await connectDB();

    // Find user by ID
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return { user: null, error: errorResponse("User not found", 404) };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: errorResponse("Authentication failed", 401) };
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(user: any, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}
