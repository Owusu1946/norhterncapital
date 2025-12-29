import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/all
 * Get all bookings (admin only) with pagination and filters
 */
export async function GET(request: NextRequest) {
  console.log("📥 GET /api/bookings/all - Fetching all bookings");

  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    console.log("✅ Admin authenticated:", user.email, "Role:", user.role);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status"); // bookingStatus filter
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search"); // Search by email or name

    const expiringSoon = searchParams.get("expiringSoon") === "true";

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Build query
    const query: any = {};

    if (status) {
      query.bookingStatus = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (expiringSoon) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      query.checkOut = {
        $gte: today,
        $lt: tomorrow
      };
      // Only include active guests
      query.bookingStatus = { $in: ["confirmed", "checked_in"] };
    }

    if (search) {
      query.$or = [
        { guestEmail: { $regex: search, $options: "i" } },
        { guestFirstName: { $regex: search, $options: "i" } },
        { guestLastName: { $regex: search, $options: "i" } },
        { guestPhone: { $regex: search, $options: "i" } },
      ];
    }

    console.log("🔍 Query filters:", { page, limit, status, paymentStatus, search });

    // Get total count for pagination
    const total = await Booking.countDocuments(query);
    console.log("📊 Total bookings found:", total);

    // Get bookings with pagination (optimized with indexes)
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 }) // Latest first
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v")
      .lean();

    console.log("📦 Fetched", bookings.length, "bookings");

    // Format bookings
    const formattedBookings = bookings.map((booking) => ({
      id: booking._id.toString(),
      bookingReference: `NCH-${booking._id.toString().slice(-8).toUpperCase()}`,
      guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      guestCountry: booking.guestCountry,
      roomName: booking.roomName,
      roomSlug: booking.roomSlug,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      adults: booking.adults,
      children: booking.children,
      totalGuests: booking.totalGuests,
      numberOfRooms: booking.numberOfRooms,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      bookingStatus: booking.bookingStatus,
      bookingSource: booking.bookingSource,
      createdAt: booking.createdAt,
    }));

    console.log("✅ Returning", formattedBookings.length, "formatted bookings");

    return successResponse({
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("❌ Get all bookings error:", error);
    console.error("Error stack:", error.stack);
    return errorResponse("Failed to fetch bookings", 500);
  }
}
