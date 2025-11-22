import { NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/me
 * Get current admin user data
 */
export async function GET(request: NextRequest) {
  console.log("📥 GET /api/admin/me - Fetching admin user data");
  
  // Authenticate admin
  const { user, error } = await authenticateAdmin(request);
  if (error) {
    console.log("❌ Authentication failed");
    return error;
  }

  console.log("✅ Admin authenticated:", user.email);

  // Prepare user data (exclude sensitive fields)
  const userData = {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || "",
    country: user.country || "",
    role: user.role,
    staffRole: user.staffRole || "",
    allowedMenus: user.allowedMenus || [],
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  console.log("📦 Returning user data");
  return successResponse({ user: userData }, "Admin user data retrieved");
}
