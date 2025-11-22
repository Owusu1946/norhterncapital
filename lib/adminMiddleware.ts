import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { errorResponse } from "./apiResponse";
import connectDB from "./mongodb";
import User from "@/models/User";

/**
 * Middleware to verify admin authentication
 * Checks for admin_token cookie and validates admin/staff role
 */
export async function authenticateAdmin(
  request: NextRequest
): Promise<{ user: any | null; error: any }> {
  try {
    // Get auth token from cookie (shared with middleware/login)
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return {
        user: null,
        error: errorResponse("Not authenticated. Please login.", 401),
      };
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        user: null,
        error: errorResponse("Invalid or expired session. Please login again.", 401),
      };
    }

    // Normalize role and check if user has admin or staff role
    const normalizedRole = decoded.role?.toLowerCase()?.trim();
    if (normalizedRole !== "admin" && normalizedRole !== "staff") {
      return {
        user: null,
        error: errorResponse("Access denied. Admin privileges required.", 403),
      };
    }

    // Connect to database
    await connectDB();

    // Find user by ID
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return { 
        user: null, 
        error: errorResponse("User not found or inactive.", 404) 
      };
    }

    // Verify user still has admin/staff role
    if (user.role !== "admin" && user.role !== "staff") {
      return { 
        user: null, 
        error: errorResponse("Access denied. Admin privileges required.", 403) 
      };
    }

    return { user, error: null };
  } catch (error) {
    return { 
      user: null, 
      error: errorResponse("Authentication failed.", 401) 
    };
  }
}

/**
 * Middleware to check if user is specifically an admin (not just staff)
 */
export async function requireAdminRole(
  request: NextRequest
): Promise<{ user: any | null; error: any }> {
  const { user, error } = await authenticateAdmin(request);
  
  if (error) return { user: null, error };
  
  if (user.role !== "admin") {
    return { 
      user: null, 
      error: errorResponse("Access denied. Admin role required.", 403) 
    };
  }
  
  return { user, error: null };
}
