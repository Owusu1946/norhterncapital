import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/stats
 * Get booking statistics (counts by status, expiring soon, etc.)
 */
export async function GET(request: NextRequest) {
    try {
        // Authenticate admin
        const { error } = await authenticateAdmin(request);
        if (error) return error;

        await connectDB();

        // Calculate "Today" for Expiring Soon logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Run aggregations in parallel for performance
        const [stats, expiringCount] = await Promise.all([
            // Aggregation for status counts
            Booking.aggregate([
                {
                    $group: {
                        _id: "$bookingStatus",
                        count: { $sum: 1 },
                        totalAmount: { $sum: "$totalAmount" }
                    }
                }
            ]),
            // Count for expiring soon (checkout is today, active status)
            Booking.countDocuments({
                checkOut: { $gte: today, $lt: tomorrow },
                bookingStatus: { $in: ["confirmed", "checked_in"] }
            })
        ]);

        // Process aggregation results
        const counts = {
            total: 0,
            confirmed: 0,
            pending: 0,
            cancelled: 0,
            checked_in: 0,
            checked_out: 0,
            expiringToday: expiringCount
        };

        let totalRevenue = 0;

        stats.forEach((item: any) => {
            const status = item._id as keyof typeof counts;
            if (counts.hasOwnProperty(status)) {
                counts[status] = item.count;
            }
            counts.total += item.count;
            totalRevenue += item.totalAmount; // This is naive total revenue (includes cancelled etc if not filtered)
        });

        return successResponse({
            counts,
            totalRevenue,
        });

    } catch (error: any) {
        console.error("Stats error:", error);
        return errorResponse("Failed to fetch booking stats", 500);
    }
}
