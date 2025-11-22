import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("Please add your JWT_SECRET to .env.local");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  staffRole?: string;
  allowedMenus?: string[];
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    console.log("🔍 JWT Verify: Token length:", token?.length);
    console.log("🔍 JWT Verify: Secret exists:", !!JWT_SECRET);
    console.log("🔍 JWT Verify: Secret length:", JWT_SECRET?.length);
    
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log("✅ JWT Verify: Token decoded successfully:", decoded);
    return decoded;
  } catch (error: any) {
    console.error("❌ JWT Verify Error:", error.message);
    console.error("Error name:", error.name);
    return null;
  }
}

/**
 * Decode JWT token without verification (for expired token info)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
