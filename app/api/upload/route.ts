import { NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload
 * Upload images for room types
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      return error;
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return errorResponse("No files provided", 400);
    }

    const uploadedUrls: string[] = [];

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "rooms");
    await mkdir(uploadsDir, { recursive: true });

    for (const file of files) {
      if (!file || typeof file === "string") continue;
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split(".").pop();
      const filename = `room-${timestamp}-${randomString}.${extension}`;
      
      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filepath = path.join(uploadsDir, filename);
      
      await writeFile(filepath, buffer);
      
      // Return public URL
      uploadedUrls.push(`/uploads/rooms/${filename}`);
    }

    return successResponse({ urls: uploadedUrls }, "Images uploaded successfully");
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return errorResponse("Failed to upload images", 500);
  }
}
