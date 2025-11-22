import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics
 * Get analytics data (admin only)
 */
export async function GET(request: NextRequest) {
  console.log("📊 GET /api/analytics - Fetching analytics data");
  
  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    console.log("✅ Admin authenticated:", user.email);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "last_7_days"; // today, last_7_days, this_month

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "last_7_days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    console.log("📅 Date range:", { range, startDate, endDate: now });

    // Get all bookings in range
    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: now }
    }).lean();

    console.log("📦 Found", bookings.length, "bookings in range");

    // Calculate daily revenue for chart
    const dailyRevenue: { [key: string]: { revenue: number; count: number; nights: number } } = {};
    
    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyRevenue[dateKey]) {
        dailyRevenue[dateKey] = { revenue: 0, count: 0, nights: 0 };
      }
      
      dailyRevenue[dateKey].revenue += booking.totalAmount || 0;
      dailyRevenue[dateKey].count += 1;
      dailyRevenue[dateKey].nights += booking.nights || 0;
    });

    // Format for chart
    const revenueSeries = Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date,
        revenue: data.revenue,
        adr: data.nights > 0 ? Math.round(data.revenue / data.nights) : 0,
        occupancy: 0.75, // Mock occupancy for now
        bookings: data.count,
      }));

    // Calculate channel breakdown
    const channelBreakdown: { [key: string]: { revenue: number; nights: number; count: number } } = {};
    
    bookings.forEach((booking) => {
      const channel = booking.bookingSource || "website";
      
      if (!channelBreakdown[channel]) {
        channelBreakdown[channel] = { revenue: 0, nights: 0, count: 0 };
      }
      
      channelBreakdown[channel].revenue += booking.totalAmount || 0;
      channelBreakdown[channel].nights += booking.nights || 0;
      channelBreakdown[channel].count += 1;
    });

    const channels = Object.entries(channelBreakdown).map(([channel, data]) => ({
      channel: channel === "walk_in" ? "Walk-in" : channel === "website" ? "Website" : channel === "agent" ? "Agent" : "Phone",
      revenue: data.revenue,
      nights: data.nights,
      bookings: data.count,
    }));

    // Calculate totals
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalNights = bookings.reduce((sum, b) => sum + (b.nights || 0), 0);
    const avgDailyRate = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;
    
    // Today's data
    const today = new Date().toISOString().split('T')[0];
    const todayData = dailyRevenue[today] || { revenue: 0, count: 0, nights: 0 };

    // Payment status breakdown
    const paidBookings = bookings.filter(b => b.paymentStatus === "paid").length;
    const pendingBookings = bookings.filter(b => b.paymentStatus === "pending").length;
    const totalBookings = bookings.length;

    const analytics = {
      range,
      startDate,
      endDate: now,
      totals: {
        totalRevenue,
        totalBookings,
        totalNights,
        avgDailyRate,
        todayRevenue: todayData.revenue,
        todayBookings: todayData.count,
        paidBookings,
        pendingBookings,
        avgOccupancy: 0.75, // Mock for now
      },
      revenueSeries,
      channels,
    };

    console.log("✅ Analytics calculated successfully");
    
    return successResponse({ analytics });
  } catch (error: any) {
    console.error("❌ Get analytics error:", error);
    console.error("Error stack:", error.stack);
    return errorResponse("Failed to fetch analytics", 500);
  }
}
