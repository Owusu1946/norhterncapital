import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings/cancel
 * Cancel a booking (usually due to payment failure or timeout)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, reason } = body;

    if (!bookingId) {
      return errorResponse("Booking ID is required", 400);
    }

    // Connect to database
    await connectDB();

    // Update booking status to cancelled and payment to failed
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: "cancelled",
        paymentStatus: "failed",
        cancellationReason: reason || "Payment failed or timeout",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    console.log(`❌ Booking ${bookingId} cancelled: ${reason || "Payment failed"}`);

    return successResponse(
      { booking },
      "Booking cancelled"
    );
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return errorResponse("Failed to cancel booking", 500);
  }
}
