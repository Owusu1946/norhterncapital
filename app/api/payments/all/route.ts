import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/payments/all
 * Get all payments from bookings (admin only)
 */
export async function GET(request: NextRequest) {
  console.log("📥 GET /api/payments/all - Fetching all payments");
  
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
    const paymentStatus = searchParams.get("paymentStatus");
    const paymentMethod = searchParams.get("paymentMethod");
    const search = searchParams.get("search");

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Build query - only get bookings with payment info
    const query: any = {
      totalAmount: { $gt: 0 }
    };
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    if (search) {
      query.$or = [
        { guestEmail: { $regex: search, $options: "i" } },
        { guestFirstName: { $regex: search, $options: "i" } },
        { guestLastName: { $regex: search, $options: "i" } },
        { transactionReference: { $regex: search, $options: "i" } },
      ];
    }

    console.log("🔍 Query filters:", { paymentStatus, paymentMethod, search });

    // Get payments (bookings with payment info)
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 }) // Latest first
      .select("-__v")
      .lean();

    console.log("📦 Fetched", bookings.length, "payments");

    // Format payments
    const payments = bookings.map((booking) => ({
      id: booking._id.toString(),
      date: booking.createdAt,
      guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
      guestEmail: booking.guestEmail,
      roomName: booking.roomName,
      paymentMethod: booking.paymentMethod || "cash",
      paymentStatus: booking.paymentStatus || "pending",
      amount: booking.totalAmount,
      transactionReference: booking.transactionReference || `NCH-${booking._id.toString().slice(-8).toUpperCase()}`,
      bookingReference: `NCH-${booking._id.toString().slice(-8).toUpperCase()}`,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    }));

    console.log("✅ Returning", payments.length, "formatted payments");
    
    return successResponse({ payments });
  } catch (error: any) {
    console.error("❌ Get all payments error:", error);
    console.error("Error stack:", error.stack);
    return errorResponse("Failed to fetch payments", 500);
  }
}
