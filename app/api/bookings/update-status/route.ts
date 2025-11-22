import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * PUT /api/bookings/update-status
 * Update booking status (admin only)
 */
export async function PUT(request: NextRequest) {
  console.log("\n📝 ===== UPDATE BOOKING STATUS =====");
  
  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    console.log("✅ Admin authenticated:", user.email);

    // Parse request body
    const body = await request.json();
    const { bookingId, bookingStatus } = body;

    console.log("📦 Request data:", { bookingId, bookingStatus });

    // Validate required fields
    if (!bookingId || !bookingStatus) {
      console.log("❌ Missing required fields");
      return errorResponse("Booking ID and status are required", 400);
    }

    // Validate status value
    const validStatuses = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];
    if (!validStatuses.includes(bookingStatus)) {
      console.log("❌ Invalid status:", bookingStatus);
      return errorResponse("Invalid booking status", 400);
    }

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Find and update booking
    console.log("🔍 Finding booking:", bookingId);
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.log("❌ Booking not found");
      return errorResponse("Booking not found", 404);
    }

    console.log("✅ Booking found:", booking.guestEmail);
    console.log("📝 Old status:", booking.bookingStatus);
    console.log("📝 New status:", bookingStatus);

    // Update booking status
    booking.bookingStatus = bookingStatus;
    await booking.save();

    console.log("✅ Booking status updated successfully");
    console.log("===== END UPDATE BOOKING STATUS =====\n");

    return successResponse(
      {
        booking: {
          id: booking._id.toString(),
          bookingStatus: booking.bookingStatus,
        },
      },
      "Booking status updated successfully"
    );
  } catch (error: any) {
    console.error("❌ Update booking status error:", error);
    console.error("Error stack:", error.stack);
    console.log("===== END UPDATE BOOKING STATUS (ERROR) =====\n");
    return errorResponse("Failed to update booking status", 500);
  }
}
