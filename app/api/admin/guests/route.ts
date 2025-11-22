import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { verifyToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/guests
 * Get all guests from bookings for the admin guests page
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      console.log("No auth token found in cookies");
      return errorResponse("Please log in to access this page", 401);
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log("Invalid or expired token");
      return errorResponse("Session expired. Please log in again.", 401);
    }
    
    // Debug role information
    console.log("🔍 Guests API - Full decoded token:", JSON.stringify(decoded));
    console.log("🔍 Guests API - User role (raw):", decoded.role);
    console.log("🔍 Guests API - User role type:", typeof decoded.role);
    console.log("🔍 Guests API - User role length:", decoded.role?.length);
    console.log("🔍 Guests API - Role trimmed:", decoded.role?.trim());
    console.log("🔍 Guests API - Role lowercase:", decoded.role?.toLowerCase());
    
    // Check if user has admin or staff role (with normalization)
    const normalizedRole = decoded.role?.toLowerCase()?.trim();
    const hasPermission = normalizedRole === "admin" || normalizedRole === "staff";
    
    console.log("🔍 Guests API - Normalized role:", normalizedRole);
    console.log("🔍 Guests API - Has permission:", hasPermission);
    
    if (!hasPermission) {
      console.log(`❌ Insufficient permissions: user role is '${decoded.role}' (normalized: '${normalizedRole}')`);
      return errorResponse("You don't have permission to access this page", 403);
    }
    
    console.log("✅ Guests API - Authorization successful for role:", decoded.role);

    // Connect to database
    await connectDB();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all";

    // Build query based on filter
    let query: any = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "checked_in") {
      query.bookingStatus = "checked_in";
    } else if (filter === "upcoming") {
      query.bookingStatus = { $in: ["confirmed", "pending"] };
      query.checkIn = { $gte: today };
    } else if (filter === "checked_out") {
      query.bookingStatus = "checked_out";
    } else if (filter !== "all") {
      // For "all", we want active bookings (not cancelled)
      query.bookingStatus = { $ne: "cancelled" };
    }

    // Fetch bookings
    let bookings = await Booking.find(query)
      .sort({ checkIn: -1 })
      .lean();

    // If no bookings exist and filter is "all", provide sample data
    if (bookings.length === 0 && filter === "all") {
      console.log("No bookings found, returning sample data");
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const in3Days = new Date(today);
      in3Days.setDate(in3Days.getDate() + 3);
      
      // Create sample booking data (cast as any to avoid TypeScript issues with partial data)
      bookings = [
        {
          _id: new mongoose.Types.ObjectId(),
          guestFirstName: "John",
          guestLastName: "Doe",
          guestEmail: "john.doe@example.com",
          guestPhone: "+233 20 123 4567",
          guestCountry: "Ghana",
          roomName: "Deluxe Suite",
          roomSlug: "deluxe-suite",
          roomImage: "/hero.jpg",
          pricePerNight: 250,
          nights: 2,
          checkIn: tomorrow,
          checkOut: in3Days,
          adults: 2,
          children: 0,
          totalGuests: 2,
          numberOfRooms: 1,
          totalAmount: 500,
          additionalServices: [],
          paymentStatus: "pending",
          paymentMethod: "card",
          bookingStatus: "confirmed",
          bookingSource: "website",
          specialRequests: "",
          createdAt: today,
        } as any,
      ];
    }

    // Transform bookings to guest format
    const guests = bookings.map((booking: any) => ({
      id: booking._id.toString(),
      bookingReference: `NCH-${booking._id.toString().slice(-8).toUpperCase()}`,
      fullName: `${booking.guestFirstName} ${booking.guestLastName}`,
      email: booking.guestEmail,
      phone: booking.guestPhone,
      country: booking.guestCountry,
      roomName: booking.roomName,
      roomNumber: booking.roomNumber || "Unassigned",
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      adults: booking.adults,
      children: booking.children,
      totalGuests: booking.totalGuests,
      numberOfRooms: booking.numberOfRooms,
      totalAmount: booking.totalAmount,
      amountPaid: booking.paymentStatus === "paid" ? booking.totalAmount : 0,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      bookingSource: booking.bookingSource,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt,
      // Determine guest status based on booking status and dates
      status: determineGuestStatus(booking),
    }));

    return successResponse({ guests });
  } catch (error: any) {
    console.error("Error fetching guests:", error);
    return errorResponse("Failed to fetch guests", 500);
  }
}

/**
 * PUT /api/admin/guests
 * Update guest status (check-in, check-out)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return errorResponse("Please log in to access this page", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse("Session expired. Please log in again.", 401);
    }
    
    if (decoded.role !== "admin" && decoded.role !== "staff") {
      return errorResponse("You don't have permission to perform this action", 403);
    }

    const body = await request.json();
    const { bookingId, status, roomNumber } = body;

    if (!bookingId || !status) {
      return errorResponse("Booking ID and status are required", 400);
    }

    // Connect to database
    await connectDB();

    // Map guest status to booking status
    let bookingStatus: string;
    switch (status) {
      case "checked_in":
        bookingStatus = "checked_in";
        break;
      case "checked_out":
        bookingStatus = "checked_out";
        break;
      case "upcoming":
        bookingStatus = "confirmed";
        break;
      default:
        return errorResponse("Invalid status", 400);
    }

    // Update booking
    const updateData: any = {
      bookingStatus,
      updatedAt: new Date(),
    };

    // Add room number if provided
    if (roomNumber) {
      updateData.roomNumber = roomNumber;
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    // Update room status based on guest status
    try {
      let effectiveRoomNumber = roomNumber || booking.roomNumber;

      // If checking in and no room is assigned yet, auto-assign one
      if (status === "checked_in" && !effectiveRoomNumber) {
        const autoRoom = await Room.findOne({
          roomTypeSlug: booking.roomSlug,
          status: "available",
          isActive: true,
        }).sort({ roomNumber: 1 });

        if (autoRoom) {
          autoRoom.status = "occupied";
          await autoRoom.save();

          booking.roomNumber = autoRoom.roomNumber;
          await booking.save();

          effectiveRoomNumber = autoRoom.roomNumber;
          console.log(
            `🏨 Auto-assigned room ${autoRoom.roomNumber} on check-in for booking ${bookingId}`
          );
        }
      }

      if (effectiveRoomNumber) {
        const room = await Room.findOne({ roomNumber: effectiveRoomNumber });

        if (room) {
          if (status === "checked_in") {
            room.status = "occupied";
          } else if (status === "checked_out") {
            room.status = "available";
          }

          await room.save();
        }
      }
    } catch (roomError) {
      console.error("Failed to update room status for guest status change:", roomError);
    }

    console.log(`✅ Guest ${booking.guestFirstName} ${booking.guestLastName} status updated to ${status}`);

    return successResponse(
      { 
        booking,
        message: `Guest ${status === "checked_in" ? "checked in" : status === "checked_out" ? "checked out" : "updated"} successfully`
      }
    );
  } catch (error: any) {
    console.error("Error updating guest status:", error);
    return errorResponse("Failed to update guest status", 500);
  }
}

// Helper function to determine guest status
function determineGuestStatus(booking: any): "upcoming" | "checked_in" | "checked_out" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkIn = new Date(booking.checkIn);
  checkIn.setHours(0, 0, 0, 0);
  
  if (booking.bookingStatus === "checked_in") {
    return "checked_in";
  } else if (booking.bookingStatus === "checked_out") {
    return "checked_out";
  } else if (booking.bookingStatus === "confirmed" || booking.bookingStatus === "pending") {
    if (checkIn >= today) {
      return "upcoming";
    }
  }
  
  // Default to upcoming for any other case
  return "upcoming";
}
