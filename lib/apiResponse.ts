import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Error response helper
 */
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Set HTTP-only cookie for JWT token
 */
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete("auth_token");
  return response;
}
