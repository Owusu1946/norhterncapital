import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings/create
 * Create a new booking (super fast with optimized MongoDB)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      // Guest details
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      guestCountry,
      specialRequests,

      // Room details
      roomSlug,
      roomName,
      roomImage,
      pricePerNight,
      numberOfRooms,
      roomNumber,

      // Dates
      checkIn,
      checkOut,
      nights,

      // Guests
      adults,
      children,
      totalGuests,

      // Services
      additionalServices,

      // Payment
      totalAmount,
      paymentMethod,
      paymentReference,
      paystackReference,

      // Source & status (optional overrides)
      bookingSource,
      paymentStatus,
      bookingStatus,
    } = body;

    // Validate required fields
    if (
      !guestFirstName ||
      !guestLastName ||
      !guestEmail ||
      !guestPhone ||
      !guestCountry ||
      !roomSlug ||
      !roomName ||
      !checkIn ||
      !checkOut ||
      !nights ||
      !adults ||
      !totalAmount
    ) {
      return errorResponse("Please provide all required booking details", 400);
    }

    // Validate dates
    let checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Get today's date at midnight for comparison (allow same-day bookings)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Set check-in date to midnight for fair comparison
    const checkInDateOnly = new Date(checkInDate);
    checkInDateOnly.setHours(0, 0, 0, 0);

    // Auto-adjust if check-in is within last 2 days (likely timezone/date picker issue)
    const daysDiff = Math.floor((today.getTime() - checkInDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    if (checkInDateOnly < today && daysDiff <= 2) {
      console.log(`⚠️ Auto-adjusting check-in from ${checkIn} to today`);
      checkInDate = new Date(today);
    } else if (checkInDateOnly < today) {
      return errorResponse(
        `Check-in date cannot be in the past. Check-in: ${checkIn}, Today: ${today.toISOString().split('T')[0]}`,
        400
      );
    }

    if (checkOutDate <= checkInDate) {
      return errorResponse("Check-out date must be after check-in date", 400);
    }

    // Connect to database (with connection pooling)
    await connectDB();

    // Get user ID if authenticated (optional)
    let userId = null;
    const token = request.cookies.get("auth_token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    const effectiveBookingSource = bookingSource || "website";

    let finalPaymentStatus: "pending" | "paid" | "failed" | "refunded" = "pending";
    let finalBookingStatus: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" = "pending";

    if (paystackReference) {
      // Online card payment via Paystack
      finalPaymentStatus = "paid";
      finalBookingStatus = "confirmed";
    } else if (effectiveBookingSource === "walk_in") {
      // Front desk / walk-in bookings can control status
      finalPaymentStatus = (paymentStatus as any) || "paid";
      finalBookingStatus = (bookingStatus as any) || "confirmed";
    } else {
      // Default website behaviour without Paystack reference
      finalPaymentStatus = (paymentStatus as any) || "pending";
      finalBookingStatus = (bookingStatus as any) || "pending";
    }

    // Create booking document
    const booking = await Booking.create({
      // User
      userId: userId || undefined,

      // Guest details
      guestEmail: guestEmail.toLowerCase(),
      guestFirstName,
      guestLastName,
      guestPhone,
      guestCountry,
      specialRequests: specialRequests || undefined,

      // Room details
      roomSlug,
      roomName,
      roomImage: roomImage || "/hotel-images/4.JPG",
      pricePerNight: Number(pricePerNight),
      numberOfRooms: Number(numberOfRooms) || 1,
      roomNumber: roomNumber ? String(roomNumber).trim() : undefined,

      // Dates
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: Number(nights),

      // Guests
      adults: Number(adults),
      children: Number(children) || 0,
      totalGuests: Number(totalGuests) || Number(adults),

      // Services
      additionalServices: additionalServices || [],

      // Payment
      totalAmount: Number(totalAmount),
      paymentMethod: paymentMethod || "card",
      paymentStatus: finalPaymentStatus,
      paymentReference: paymentReference || undefined,
      paystackReference: paystackReference || undefined,

      // Status
      bookingStatus: finalBookingStatus,
      bookingSource: effectiveBookingSource,
    });

    // Prepare response data
    const bookingData = {
      id: booking._id.toString(),
      bookingReference: `NCH-${booking._id.toString().slice(-8).toUpperCase()}`,
      guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
      guestEmail: booking.guestEmail,
      roomName: booking.roomName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      totalAmount: booking.totalAmount,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
    };

    return successResponse(
      { booking: bookingData },
      "Booking created successfully",
      201
    );
  } catch (error: any) {
    console.error("Booking creation error:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return errorResponse(messages[0], 400);
    }

    return errorResponse("Failed to create booking. Please try again.", 500);
  }
}
