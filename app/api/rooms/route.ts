import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import RoomType from "@/models/RoomType";
import Room from "@/models/Room";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/rooms
 * Get all rooms with filtering options
 */
export async function GET(request: NextRequest) {
  console.log("🚪 GET /api/rooms - Fetching rooms");
  
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const roomTypeSlug = searchParams.get("roomType");
    const status = searchParams.get("status");

    // Connect to database
    await connectDB();

    // Build query
    const query: any = { isActive: true };
    if (roomTypeSlug) query.roomTypeSlug = roomTypeSlug;
    if (status) query.status = status;

    // Get rooms with room type info populated
    const rooms = await Room.find(query)
      .populate("roomTypeId", "name slug pricePerNight size bedType")
      .sort({ roomNumber: 1 })
      .lean();

    // Format room data
    const formattedRooms = rooms.map((room) => ({
      id: room._id.toString(),
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId._id.toString(),
      roomTypeSlug: room.roomTypeSlug,
      roomTypeName: room.roomTypeName,
      floor: room.floor,
      status: room.status,
      notes: room.notes,
      isActive: room.isActive,
      createdAt: room.createdAt,
    }));

    return successResponse({ rooms: formattedRooms });
  } catch (error: any) {
    console.error("❌ Get rooms error:", error);
    return errorResponse("Failed to fetch rooms", 500);
  }
}

/**
 * POST /api/rooms
 * Create a new room (admin only)
 */
export async function POST(request: NextRequest) {
  console.log("🚪 POST /api/rooms - Creating new room");
  
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
      roomNumber,
      roomTypeId,
      floor,
      notes,
    } = body;

    console.log("📝 Creating room:", { roomNumber, roomTypeId });

    // Validate required fields
    if (!roomNumber || !roomTypeId) {
      return errorResponse("Room number and room type are required", 400);
    }

    // Connect to database
    await connectDB();

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber: roomNumber.trim() });
    if (existingRoom) {
      return errorResponse(`Room ${roomNumber} already exists`, 400);
    }

    // Get room type information
    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) {
      return errorResponse("Invalid room type", 400);
    }

    // Check if room count limit has been reached
    const currentRoomCount = await Room.countDocuments({
      roomTypeId: roomType._id,
      isActive: true,
    });

    if (currentRoomCount >= roomType.totalRooms) {
      return errorResponse(
        `Cannot add more rooms. Maximum of ${roomType.totalRooms} rooms allowed for ${roomType.name}. Currently ${currentRoomCount} rooms exist.`,
        400
      );
    }

    // Extract floor from room number if not provided
    let roomFloor = floor;
    if (!roomFloor && roomNumber.length > 0) {
      const firstDigit = parseInt(roomNumber[0]);
      if (!isNaN(firstDigit) && firstDigit > 0) {
        roomFloor = firstDigit;
      } else {
        roomFloor = 1;
      }
    }

    // Create room
    const room = await Room.create({
      roomNumber: roomNumber.trim(),
      roomTypeId: roomType._id,
      roomTypeSlug: roomType.slug,
      roomTypeName: roomType.name,
      floor: roomFloor || 1,
      status: "available",
      notes: notes || "",
      isActive: true,
    });

    console.log("✅ Room created successfully:", room._id);

    // Return room data
    const roomData = {
      id: room._id.toString(),
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId.toString(),
      roomTypeSlug: room.roomTypeSlug,
      roomTypeName: room.roomTypeName,
      floor: room.floor,
      status: room.status,
      remainingCapacity: roomType.totalRooms - currentRoomCount - 1,
      totalCapacity: roomType.totalRooms,
    };

    return successResponse({ room: roomData }, "Room created successfully", 201);
  } catch (error: any) {
    console.error("❌ Create room error:", error);
    
    if (error.code === 11000) {
      return errorResponse("A room with this number already exists", 400);
    }
    
    return errorResponse("Failed to create room", 500);
  }
}

/**
 * DELETE /api/rooms
 * Delete a room (admin only)
 */
export async function DELETE(request: NextRequest) {
  console.log("🚪 DELETE /api/rooms - Deleting room");
  
  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    // Get request body
    const body = await request.json();
    const { roomId } = body;

    if (!roomId) {
      return errorResponse("Room ID is required", 400);
    }

    // Connect to database
    await connectDB();

    // Find and soft delete the room
    const room = await Room.findById(roomId);
    if (!room) {
      return errorResponse("Room not found", 404);
    }

    // Check if room is occupied
    if (room.status === "occupied") {
      return errorResponse("Cannot delete an occupied room", 400);
    }

    // Soft delete (mark as inactive)
    room.isActive = false;
    await room.save();

    console.log("✅ Room deleted successfully:", roomId);

    return successResponse({ message: "Room deleted successfully" });
  } catch (error: any) {
    console.error("❌ Delete room error:", error);
    return errorResponse("Failed to delete room", 500);
  }
}
