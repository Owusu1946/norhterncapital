import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { authenticateWithDB } from "@/lib/authMiddleware";
import { successResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/my-bookings
 * Get all bookings for the authenticated user (super fast with indexes)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authenticateWithDB(request);
    if (error) return error;

    // Connect to database
    await connectDB();

    // Get bookings for user (optimized with compound index: userId + createdAt)
    const bookings = await Booking.find({
      $or: [
        { userId: user._id },
        { guestEmail: user.email.toLowerCase() }
      ]
    })
      .sort({ createdAt: -1 }) // Latest first
      .select("-__v") // Exclude version key
      .lean(); // Return plain JavaScript objects (faster)

    // Format bookings for response
    const formattedBookings = bookings.map((booking) => ({
      id: booking._id.toString(),
      bookingReference: `NCH-${booking._id.toString().slice(-8).toUpperCase()}`,
      guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      roomName: booking.roomName,
      roomImage: booking.roomImage,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      adults: booking.adults,
      children: booking.children,
      totalGuests: booking.totalGuests,
      numberOfRooms: booking.numberOfRooms,
      additionalServices: booking.additionalServices,
      specialRequests: booking.specialRequests,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      bookingStatus: booking.bookingStatus,
      bookingSource: booking.bookingSource,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }));

    return successResponse({
      bookings: formattedBookings,
      count: formattedBookings.length,
    });
  } catch (error: any) {
    console.error("Get bookings error:", error);
    return successResponse({ bookings: [], count: 0 }); // Return empty array on error
  }
}
