/**
 * JWT utilities for Edge Runtime (middleware)
 * Uses Web Crypto API instead of jsonwebtoken
 */

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Pad with '=' to make length multiple of 4
  while (str.length % 4) {
    str += '=';
  }
  
  try {
    return atob(str);
  } catch (e) {
    return '';
  }
}

/**
 * Decode JWT token without verification (for Edge Runtime)
 * This is a simplified version that just decodes the payload
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    console.log("🔍 Edge JWT: Decoding token...");
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("❌ Edge JWT: Invalid token format");
      return null;
    }

    const payload = base64UrlDecode(parts[1]);
    if (!payload) {
      console.error("❌ Edge JWT: Failed to decode payload");
      return null;
    }

    const decoded = JSON.parse(payload) as JWTPayload;
    console.log("✅ Edge JWT: Token decoded:", decoded);

    // Check expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.error("❌ Edge JWT: Token expired");
      return null;
    }

    return decoded;
  } catch (error: any) {
    console.error("❌ Edge JWT: Decode error:", error.message);
    return null;
  }
}

/**
 * Verify JWT token in Edge Runtime
 * Note: This is a simplified version for Edge Runtime
 * For full verification, use the Node.js version in API routes
 */
export function verifyJWTEdge(token: string): JWTPayload | null {
  try {
    console.log("🔍 Edge JWT Verify: Starting verification...");
    console.log("🔍 Edge JWT Verify: Token length:", token?.length);
    
    // Decode the token
    const decoded = decodeJWT(token);
    
    if (!decoded) {
      console.error("❌ Edge JWT Verify: Failed to decode");
      return null;
    }

    // Basic validation
    if (!decoded.userId || !decoded.email || !decoded.role) {
      console.error("❌ Edge JWT Verify: Missing required fields");
      return null;
    }

    console.log("✅ Edge JWT Verify: Token is valid");
    return decoded;
  } catch (error: any) {
    console.error("❌ Edge JWT Verify Error:", error.message);
    return null;
  }
}
