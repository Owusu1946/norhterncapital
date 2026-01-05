import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import RoomType from "@/models/RoomType";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/room-types/[slug]
 * Public endpoint to get a single room type by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // In Next.js 15, params is a Promise and must be awaited
    const { slug } = await params;

    if (!slug) {
      return errorResponse("Slug is required", 400);
    }

    // Connect to database
    await connectDB();

    // Find room type by slug
    const roomType = await RoomType.findOne({ slug: slug.toLowerCase(), isActive: true }).lean();

    if (!roomType) {
      return errorResponse("Room type not found", 404);
    }

    // Format room type to match the existing Room type structure
    const formattedRoomType = {
      slug: roomType.slug,
      name: roomType.name,
      description: roomType.description || "",
      longDescription: roomType.longDescription || "",
      priceFrom: roomType.pricePerNight,
      size: roomType.size || "",
      image: roomType.mainImage || "/hotel-images/4.JPG",
      gallery: roomType.gallery && roomType.gallery.length > 0
        ? roomType.gallery
        : ["/hotel-images/4.JPG", "/hotel-images/4.JPG", "/hotel-images/4.JPG"],
      perks: roomType.perks || [],
      amenities: roomType.amenities || [],
      bedType: roomType.bedType || "",
      maxGuests: roomType.maxGuests || 2,
      totalRooms: roomType.totalRooms,
      maxAdults: roomType.maxAdults,
      maxChildren: roomType.maxChildren,
    };

    return successResponse({ roomType: formattedRoomType });
  } catch (error: any) {
    console.error("❌ Get room type by slug error:", error);
    return errorResponse("Failed to fetch room type", 500);
  }
}
