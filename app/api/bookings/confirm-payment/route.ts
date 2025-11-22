import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { sendBookingConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings/confirm-payment
 * Confirm a booking after successful payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, reference } = body;

    if (!bookingId) {
      return errorResponse("Booking ID is required", 400);
    }

    // Connect to database
    await connectDB();

    // Update booking status to confirmed and payment to paid
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: "confirmed",
        paymentStatus: "paid",
        paymentReference: reference,
        paystackReference: reference,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    console.log(`✅ Booking ${bookingId} confirmed with payment reference: ${reference}`);

    // Automatically assign an available room for this booking's room type
    try {
      const assignedRoom = await Room.findOne({
        roomTypeSlug: booking.roomSlug,
        status: "available",
        isActive: true,
      }).sort({ roomNumber: 1 });

      if (assignedRoom) {
        assignedRoom.status = "occupied";
        await assignedRoom.save();

        booking.roomNumber = assignedRoom.roomNumber;
        await booking.save();

        console.log(
          `🏨 Assigned room ${assignedRoom.roomNumber} to booking ${bookingId} and marked it occupied`
        );
      } else {
        console.warn(
          `⚠️ No available rooms found for type ${booking.roomSlug} when confirming booking ${bookingId}`
        );
      }
    } catch (assignError) {
      console.error("Failed to auto-assign room on booking confirmation:", assignError);
    }

    // Send booking confirmation email (best-effort, non-blocking for API response)
    try {
      const bookingIdString = booking._id.toString();
      const bookingReference = `NCH-${bookingIdString.slice(-8).toUpperCase()}`;

      await sendBookingConfirmationEmail({
        guestFirstName: booking.guestFirstName,
        guestLastName: booking.guestLastName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        guestCountry: booking.guestCountry,
        roomName: booking.roomName,
        roomImage: booking.roomImage,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        adults: booking.adults,
        children: booking.children,
        totalGuests: booking.totalGuests,
        numberOfRooms: booking.numberOfRooms,
        totalAmount: booking.totalAmount,
        bookingReference,
      });

      console.log(`📧 Booking confirmation email sent to ${booking.guestEmail}`);
    } catch (emailError) {
      console.error("Failed to send booking confirmation email:", emailError);
      // Do not fail the API response if email sending fails
    }

    return successResponse(
      { booking },
      "Booking confirmed successfully"
    );
  } catch (error: any) {
    console.error("Error confirming booking payment:", error);
    return errorResponse("Failed to confirm booking payment", 500);
  }
}
