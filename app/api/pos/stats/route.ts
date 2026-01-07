import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/stats
 * Get dashboard statistics - optimized for fast loading
 */
export async function GET() {
    try {
        await connectDB();

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get yesterday for comparison
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Run all queries in parallel for speed
        const [
            todayOrders,
            yesterdayOrders,
            allTimeOrders,
            topItems,
            hourlySales,
            categoryIncome,
        ] = await Promise.all([
            // Today's orders aggregate
            Order.aggregate([
                { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: "completed" } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$total" },
                        totalOrders: { $sum: 1 },
                        dineInCount: { $sum: { $cond: [{ $eq: ["$orderType", "dine-in"] }, 1, 0] } },
                        takeawayCount: { $sum: { $cond: [{ $eq: ["$orderType", "takeaway"] }, 1, 0] } },
                    },
                },
            ]),
            // Yesterday's orders for comparison
            Order.aggregate([
                { $match: { createdAt: { $gte: yesterday, $lt: today }, status: "completed" } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$total" },
                        totalOrders: { $sum: 1 },
                    },
                },
            ]),
            // All time totals
            Order.countDocuments({ status: "completed" }),
            // Top selling items (from all orders)
            Order.aggregate([
                { $match: { status: "completed" } },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.name",
                        totalQuantity: { $sum: "$items.quantity" },
                        totalRevenue: { $sum: "$items.subtotal" },
                    },
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 4 },
            ]),
            // Hourly sales for today
            Order.aggregate([
                { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: "completed" } },
                {
                    $group: {
                        _id: { $hour: "$createdAt" },
                        sales: { $sum: "$total" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            // All-time income by payment method (as category proxy)
            Order.aggregate([
                { $match: { status: "completed" } },
                {
                    $group: {
                        _id: "$paymentMethod",
                        total: { $sum: "$total" },
                    },
                },
            ]),
        ]);

        // Extract today's stats
        const todayStats = todayOrders[0] || {
            totalRevenue: 0,
            totalOrders: 0,
            dineInCount: 0,
            takeawayCount: 0,
        };

        // Extract yesterday's stats for trends
        const yesterdayStats = yesterdayOrders[0] || {
            totalRevenue: 0,
            totalOrders: 0,
        };

        // Calculate trends (percentage change)
        const revenueTrend = yesterdayStats.totalRevenue > 0
            ? ((todayStats.totalRevenue - yesterdayStats.totalRevenue) / yesterdayStats.totalRevenue) * 100
            : todayStats.totalRevenue > 0 ? 100 : 0;

        const ordersTrend = yesterdayStats.totalOrders > 0
            ? ((todayStats.totalOrders - yesterdayStats.totalOrders) / yesterdayStats.totalOrders) * 100
            : todayStats.totalOrders > 0 ? 100 : 0;

        // Format trending dishes
        const trendingDishes = topItems.map((item: any, index: number) => ({
            id: index.toString(),
            name: item._id,
            totalOrders: item.totalQuantity,
            totalRevenue: item.totalRevenue,
        }));

        // Format hourly sales data (fill gaps with 0)
        const hourlyData: { hour: number; time: string; sales: number }[] = [];
        for (let h = 6; h <= 23; h++) {
            const found = hourlySales.find((item: any) => item._id === h);
            const hour12 = h > 12 ? h - 12 : h;
            const ampm = h >= 12 ? "pm" : "am";
            hourlyData.push({
                hour: h,
                time: `${hour12}:00${ampm}`,
                sales: found ? found.sales : 0,
            });
        }

        // Format income by category
        const incomeByCategory = categoryIncome.map((item: any) => ({
            name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            value: item.total,
        }));

        // Calculate total income
        const totalIncome = incomeByCategory.reduce((sum: number, item: any) => sum + item.value, 0);

        return successResponse({
            today: {
                revenue: todayStats.totalRevenue,
                orders: todayStats.totalOrders,
                dineIn: todayStats.dineInCount,
                takeaway: todayStats.takeawayCount,
            },
            trends: {
                revenue: Math.round(revenueTrend),
                orders: Math.round(ordersTrend),
            },
            allTime: {
                totalOrders: allTimeOrders,
                totalIncome,
            },
            trendingDishes,
            hourlySales: hourlyData,
            incomeByCategory,
        });
    } catch (error: any) {
        console.error("Stats API error:", error);
        return errorResponse("Failed to fetch stats", 500);
    }
}
