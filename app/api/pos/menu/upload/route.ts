import { NextRequest } from "next/server";
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
 * POST /api/pos/menu/upload
 * Upload menu item images to Cloudinary
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return errorResponse("No file provided", 400);
        }

        // Verify Cloudinary config
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return errorResponse("Server configuration error: Cloudinary credentials missing", 500);
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
            const uploadOptions: any = {
                folder: "northern_capital/menu",
                resource_type: "auto",
                transformation: [
                    { width: 400, height: 400, crop: "fill" },
                    { quality: "auto" },
                ],
            };

            const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
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
            return successResponse({ url: result.secure_url }, "Image uploaded successfully");
        }

        return errorResponse("Upload failed", 500);
    } catch (error: any) {
        console.error("Menu image upload error:", error);
        return errorResponse(`Failed to upload image: ${error.message}`, 500);
    }
}
