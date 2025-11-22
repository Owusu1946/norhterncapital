import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings/update-payment
 * Update booking payment status after Paystack verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, paymentStatus, paystackReference, paymentReference } = body;

    if (!bookingId) {
      return errorResponse("Booking ID is required", 400);
    }

    // Connect to database
    await connectDB();

    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: paymentStatus || "paid",
        bookingStatus: paymentStatus === "paid" ? "confirmed" : "pending",
        paystackReference: paystackReference || undefined,
        paymentReference: paymentReference || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    return successResponse(
      {
        booking: {
          id: booking._id.toString(),
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.bookingStatus,
        },
      },
      "Booking payment status updated"
    );
  } catch (error: any) {
    console.error("Update payment error:", error);
    return errorResponse("Failed to update payment status", 500);
  }
}
