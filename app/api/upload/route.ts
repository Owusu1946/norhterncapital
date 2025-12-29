import { NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload
 * Upload images for room types to Cloudinary
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

    // Verify Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ Cloudinary credentials missing");
      return errorResponse("Server configuration error: Cloudinary credentials missing", 500);
    }

    const uploadedUrls: string[] = [];
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    for (const file of files) {
      if (!file || typeof file === "string") continue;

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary using stream
      const result = await new Promise<any>((resolve, reject) => {
        const uploadOptions: any = {
          folder: "northern_capital/rooms",
          resource_type: "auto",
        };

        if (uploadPreset) {
          uploadOptions.upload_preset = uploadPreset;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(buffer);
      });

      if (result && result.secure_url) {
        uploadedUrls.push(result.secure_url);
      }
    }

    return successResponse({ urls: uploadedUrls }, "Images uploaded successfully");
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return errorResponse(`Failed to upload images: ${error.message}`, 500);
  }
}
