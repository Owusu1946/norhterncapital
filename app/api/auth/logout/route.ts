import { NextRequest } from "next/server";
import { successResponse, clearAuthCookie } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout
 * Clear authentication cookie
 */
export async function POST(request: NextRequest) {
  const response = successResponse(null, "Logged out successfully");
  return clearAuthCookie(response);
}
