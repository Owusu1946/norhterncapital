import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/logout
 * Clear admin authentication cookie
 */
export async function POST(request: NextRequest) {
  const response = successResponse(null, "Logged out successfully");
  
  // Clear auth token cookie (used for both admin and regular users)
  response.cookies.delete("auth_token");
  
  // Also clear admin_token if it exists (for backward compatibility)
  response.cookies.delete("admin_token");
  
  return response;
}
