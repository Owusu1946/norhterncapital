import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/logout
 * Clear admin authentication cookie
 */
export async function POST(request: NextRequest) {
  const response = successResponse(null, "Logged out successfully");

  // Clear admin auth token cookie
  response.cookies.delete("admin_auth_token");

  // Also clear old tokens if they exist (for backward compatibility)
  response.cookies.delete("auth_token");
  response.cookies.delete("admin_token");

  return response;
}
