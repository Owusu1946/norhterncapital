import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import RoomType from "@/models/RoomType";
import Room from "@/models/Room";
import Service from "@/models/Service"; // Import Service model for population
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/room-types
 * Get all room types with room count information
 */
export async function GET(request: NextRequest) {
  console.log("🏨 GET /api/room-types - Fetching all room types");

  try {
    // Connect to database
    await connectDB();

    // Get all room types with populated services
    // Explicitly pass Service model to ensure it's used and registered
    const roomTypes = await RoomType.find({ isActive: true })
      .populate({ path: 'services', model: Service })
      .sort({ createdAt: -1 })
      .lean();

    // Get room count for each room type
    const roomTypesWithCount = await Promise.all(
      roomTypes.map(async (roomType) => {
        const createdRoomCount = await Room.countDocuments({
          roomTypeId: roomType._id,
          isActive: true,
        });

        const availableRoomCount = await Room.countDocuments({
          roomTypeId: roomType._id,
          status: "available",
          isActive: true,
        });

        return {
          id: roomType._id.toString(),
          slug: roomType.slug,
          name: roomType.name,
          description: roomType.description,
          longDescription: roomType.longDescription,
          pricePerNight: roomType.pricePerNight,
          size: roomType.size,
          bedType: roomType.bedType,
          maxGuests: roomType.maxGuests,
          maxAdults: roomType.maxAdults,
          maxChildren: roomType.maxChildren,
          totalRooms: roomType.totalRooms,
          createdRooms: createdRoomCount,
          availableRooms: availableRoomCount,
          amenities: roomType.amenities,
          perks: roomType.perks,
          services: roomType.services || [],
          mainImage: roomType.mainImage,
          gallery: roomType.gallery,
          isActive: roomType.isActive,
          createdAt: roomType.createdAt,
        };
      })
    );

    return successResponse({ roomTypes: roomTypesWithCount });
  } catch (error: any) {
    console.error("❌ Get room types error:", error);
    // Return actual error message for debugging (revert this before final prod if sensitive)
    return errorResponse(`Failed to fetch room types: ${error.message}`, 500);
  }
}

/**
 * POST /api/room-types
 * Create a new room type (admin only)
 */
export async function POST(request: NextRequest) {
  console.log("🏨 POST /api/room-types - Creating new room type");

  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    console.log("✅ Admin authenticated:", user.email);

    // Get request body
    const body = await request.json();
    const {
      slug,
      name,
      description,
      longDescription,
      pricePerNight,
      size,
      bedType,
      maxGuests,
      maxAdults,
      maxChildren,
      totalRooms,
      amenities,
      perks,
      services,
      mainImage,
      gallery,
    } = body;

    console.log("📝 Creating room type:", { slug, name, totalRooms });

    // Parse numeric fields safely
    const numericPrice = Number(pricePerNight);
    const numericTotalRooms = Number(totalRooms);
    let numericMaxGuests = maxGuests !== undefined && maxGuests !== null ? Number(maxGuests) : NaN;
    let numericMaxAdults = maxAdults !== undefined && maxAdults !== null ? Number(maxAdults) : NaN;
    let numericMaxChildren = maxChildren !== undefined && maxChildren !== null ? Number(maxChildren) : 0;

    // Derive maxGuests if not explicitly provided or invalid
    if (!Number.isFinite(numericMaxGuests) || numericMaxGuests < 1) {
      const baseAdults = Number.isFinite(numericMaxAdults) && numericMaxAdults > 0 ? numericMaxAdults : 2;
      const baseChildren = Number.isFinite(numericMaxChildren) && numericMaxChildren >= 0 ? numericMaxChildren : 0;
      numericMaxGuests = baseAdults + baseChildren;
      console.log("ℹ️ Derived maxGuests from adults/children:", {
        numericMaxGuests,
        baseAdults,
        baseChildren,
      });
    }

    // Validate required fields (allow 0/false where valid)
    if (!slug || !name || !Number.isFinite(numericPrice) || !Number.isFinite(numericTotalRooms)) {
      console.warn("⚠️ Missing core required fields when creating room type", {
        slug,
        name,
        pricePerNight,
        totalRooms,
      });
      return errorResponse("Missing required fields", 400);
    }

    // Validate numeric fields
    if (numericPrice < 0 || numericMaxGuests < 1 || numericTotalRooms < 1) {
      return errorResponse("Invalid numeric values", 400);
    }

    // Connect to database
    await connectDB();

    // Check if slug already exists
    const existingRoomType = await RoomType.findOne({ slug: slug.toLowerCase() });
    if (existingRoomType) {
      return errorResponse("A room type with this slug already exists", 400);
    }

    // Create room type
    const roomType = await RoomType.create({
      slug: slug.toLowerCase(),
      name,
      description: description || "",
      longDescription: longDescription || "",
      pricePerNight: numericPrice,
      size: size || "",
      bedType: bedType || "",
      maxGuests: numericMaxGuests,
      maxAdults: Number.isFinite(numericMaxAdults) && numericMaxAdults > 0 ? numericMaxAdults : numericMaxGuests,
      maxChildren: Number.isFinite(numericMaxChildren) && numericMaxChildren >= 0 ? numericMaxChildren : 0,
      totalRooms: numericTotalRooms,
      amenities: amenities || [],
      perks: perks || [],
      services: services || [],
      mainImage: mainImage || "",
      gallery: gallery || [],
      isActive: true,
    });

    console.log("✅ Room type created successfully:", roomType._id);

    // Return room type data
    const roomTypeData = {
      id: roomType._id.toString(),
      slug: roomType.slug,
      name: roomType.name,
      description: roomType.description,
      pricePerNight: roomType.pricePerNight,
      totalRooms: roomType.totalRooms,
      createdRooms: 0, // No rooms created yet
      availableRooms: 0,
    };

    return successResponse({ roomType: roomTypeData }, "Room type created successfully", 201);
  } catch (error: any) {
    console.error("❌ Create room type error:", error);

    if (error.code === 11000) {
      return errorResponse("A room type with this slug already exists", 400);
    }

    return errorResponse("Failed to create room type", 500);
  }
}
