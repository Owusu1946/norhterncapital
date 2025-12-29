import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import RoomType from "@/models/RoomType";
import Service from "@/models/Service"; // Import Service model for population
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/room-types
 * Public endpoint to get all active room types for display
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Ensure Service model is registered
    console.log("Service model imported:", !!Service);

    // Get all active room types with populated services
    const roomTypes = await RoomType.find({ isActive: true })
      .populate('services')
      .sort({ createdAt: -1 })
      .lean();

    // Format room types to match the existing Room type structure
    const formattedRoomTypes = roomTypes.map((roomType) => ({
      slug: roomType.slug,
      name: roomType.name,
      description: roomType.description || "",
      longDescription: roomType.longDescription || "",
      priceFrom: roomType.pricePerNight,
      size: roomType.size || "",
      image: roomType.mainImage && roomType.mainImage.trim() !== "" ? roomType.mainImage : "/hero.jpg",
      gallery: roomType.gallery && roomType.gallery.some(url => url && url.trim() !== "")
        ? roomType.gallery.filter(url => url && url.trim() !== "")
        : ["/hero.jpg", "/hero.jpg", "/hero.jpg"],
      perks: roomType.perks || [],
      amenities: roomType.amenities || [],
      services: roomType.services || [],
      bedType: roomType.bedType || "",
      maxGuests: roomType.maxGuests || 2,
      // Additional fields for room management
      totalRooms: roomType.totalRooms,
      maxAdults: roomType.maxAdults,
      maxChildren: roomType.maxChildren,
    }));

    return successResponse({ roomTypes: formattedRoomTypes });
  } catch (error: any) {
    console.error("❌ Get public room types error:", error);
    return errorResponse("Failed to fetch room types", 500);
  }
}
