import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import RoomType from "@/models/RoomType";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/room-types/[id]
 * Get a single room type by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      return error;
    }

    // Connect to database
    await connectDB();

    const roomType = await RoomType.findById(id).lean();
    if (!roomType) {
      return errorResponse("Room type not found", 404);
    }

    return successResponse({ roomType });
  } catch (error: any) {
    console.error("❌ Get room type error:", error);
    return errorResponse("Failed to fetch room type", 500);
  }
}

/**
 * PUT /api/room-types/[id]
 * Update a room type (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      return error;
    }

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
      mainImage,
      gallery,
    } = body;

    // Connect to database
    await connectDB();

    // Check if room type exists
    const existingRoomType = await RoomType.findById(id);
    if (!existingRoomType) {
      return errorResponse("Room type not found", 404);
    }

    // Check if slug is being changed and if new slug already exists
    if (slug && slug !== existingRoomType.slug) {
      const duplicateSlug = await RoomType.findOne({ 
        slug: slug.toLowerCase(),
        _id: { $ne: id }
      });
      if (duplicateSlug) {
        return errorResponse("A room type with this slug already exists", 400);
      }
    }

    // Update room type
    const updatedRoomType = await RoomType.findByIdAndUpdate(
      id,
      {
        slug: slug ? slug.toLowerCase() : existingRoomType.slug,
        name: name || existingRoomType.name,
        description: description !== undefined ? description : existingRoomType.description,
        longDescription: longDescription !== undefined ? longDescription : existingRoomType.longDescription,
        pricePerNight: pricePerNight !== undefined ? pricePerNight : existingRoomType.pricePerNight,
        size: size !== undefined ? size : existingRoomType.size,
        bedType: bedType !== undefined ? bedType : existingRoomType.bedType,
        maxGuests: maxGuests !== undefined ? maxGuests : existingRoomType.maxGuests,
        maxAdults: maxAdults !== undefined ? maxAdults : existingRoomType.maxAdults,
        maxChildren: maxChildren !== undefined ? maxChildren : existingRoomType.maxChildren,
        totalRooms: totalRooms !== undefined ? totalRooms : existingRoomType.totalRooms,
        amenities: amenities !== undefined ? amenities : existingRoomType.amenities,
        perks: perks !== undefined ? perks : existingRoomType.perks,
        mainImage: mainImage !== undefined ? mainImage : existingRoomType.mainImage,
        gallery: gallery !== undefined ? gallery : existingRoomType.gallery,
      },
      { new: true }
    );

    console.log("✅ Room type updated successfully:", id);

    return successResponse({ roomType: updatedRoomType }, "Room type updated successfully");
  } catch (error: any) {
    console.error("❌ Update room type error:", error);
    return errorResponse("Failed to update room type", 500);
  }
}

/**
 * DELETE /api/room-types/[id]
 * Delete a room type (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      return error;
    }

    // Connect to database
    await connectDB();

    // Check if room type exists
    const roomType = await RoomType.findById(id);
    if (!roomType) {
      return errorResponse("Room type not found", 404);
    }

    // Soft delete (mark as inactive)
    roomType.isActive = false;
    await roomType.save();

    console.log("✅ Room type deleted successfully:", id);

    return successResponse({ message: "Room type deleted successfully" });
  } catch (error: any) {
    console.error("❌ Delete room type error:", error);
    return errorResponse("Failed to delete room type", 500);
  }
}
