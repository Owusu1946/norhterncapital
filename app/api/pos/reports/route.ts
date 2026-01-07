import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import MenuItem from "@/models/MenuItem";
import MenuCategory from "@/models/MenuCategory";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/reports
 * Get comprehensive reports data with optional date filtering
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");

        // Default Date ranges
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        // Determine filter range
        let filterStart = new Date(now.getFullYear(), now.getMonth(), 1); // Default: This Month
        let filterEnd = new Date(now);
        filterEnd.setHours(23, 59, 59, 999);

        // If custom dates provided
        if (startDateParam) {
            filterStart = new Date(startDateParam);
            filterStart.setHours(0, 0, 0, 0);
        }
        if (endDateParam) {
            filterEnd = new Date(endDateParam);
            filterEnd.setHours(23, 59, 59, 999);
        }

        // ensure filterEnd is after filterStart
        if (filterEnd < filterStart) {
            filterEnd = new Date(filterStart);
            filterEnd.setHours(23, 59, 59, 999);
        }


        // Comparison ranges (for "This Month" vs "Last Month" cards - these stay fixed relative to NOW for the dashboard context, 
        // OR we could make them relative to the selection. For simpler UX, the summary cards usually show current status, 
        // while the main charts/tables reflect the selection. 
        // However, the user asked to "filter report and revenue". 
        // Let's make the "Financial Summary" reflect the SELECTED range, and keep "Growth" relative to the previous period of same length.

        const selectionDuration = filterEnd.getTime() - filterStart.getTime();
        const previousPeriodStart = new Date(filterStart.getTime() - selectionDuration);
        const previousPeriodEnd = new Date(filterStart.getTime() - 1); // Day before start

        // Standard ranges for specific cards (Today, This Week) - keep these as absolute "Current Status" indicators
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());

        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        // Run all queries in parallel
        const [
            allTimeStats,
            selectedPeriodStats,
            previousPeriodStats,
            todayStats, // Keep fixed
            thisWeekStats, // Keep fixed
            thisMonthStats, // Keep fixed (for the specific card)
            bestSellingItems,
            revenueByPaymentMethod,
            dailyRevenue,
            orderTypeBreakdown,
            categoryStats,
            totalMenuItems,
            totalCategories,
        ] = await Promise.all([
            // All-time stats
            Order.aggregate([
                { $match: { status: "completed" } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$total" },
                        totalOrders: { $sum: 1 },
                        avgOrderValue: { $avg: "$total" },
                    },
                },
            ]),
            // Selected Period Stats (Replaces "This Month" in the main view if filtered, or acts as the main filtered metric)
            Order.aggregate([
                { $match: { createdAt: { $gte: filterStart, $lte: filterEnd }, status: "completed" } },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$total" },
                        orders: { $sum: 1 },
                    },
                },
            ]),
            // Previous Period Stats (for growth calculation based on selection)
            Order.aggregate([
                { $match: { createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd }, status: "completed" } },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$total" },
                        orders: { $sum: 1 },
                    },
                },
            ]),
            // Today stats (Fixed context)
            Order.aggregate([
                { $match: { createdAt: { $gte: today }, status: "completed" } },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$total" },
                        orders: { $sum: 1 },
                    },
                },
            ]),
            // This week stats (Fixed context)
            Order.aggregate([
                { $match: { createdAt: { $gte: thisWeekStart }, status: "completed" } },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$total" },
                        orders: { $sum: 1 },
                    },
                },
            ]),
            // This Month stats (Fixed context for the specific card)
            Order.aggregate([
                { $match: { createdAt: { $gte: thisMonthStart }, status: "completed" } },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$total" },
                        orders: { $sum: 1 },
                    },
                },
            ]),
            // Best selling items (in selected range)
            Order.aggregate([
                { $match: { createdAt: { $gte: filterStart, $lte: filterEnd }, status: "completed" } },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.name",
                        totalQuantity: { $sum: "$items.quantity" },
                        totalRevenue: { $sum: "$items.subtotal" },
                        orderCount: { $sum: 1 },
                    },
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 10 },
            ]),
            // Revenue by payment method (in selected range)
            Order.aggregate([
                { $match: { createdAt: { $gte: filterStart, $lte: filterEnd }, status: "completed" } },
                {
                    $group: {
                        _id: "$paymentMethod",
                        total: { $sum: "$total" },
                        count: { $sum: 1 },
                    },
                },
            ]),
            // Daily revenue (in selected range)
            Order.aggregate([
                { $match: { createdAt: { $gte: filterStart, $lte: filterEnd }, status: "completed" } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        revenue: { $sum: "$total" },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            // Order type breakdown (in selected range)
            Order.aggregate([
                { $match: { createdAt: { $gte: filterStart, $lte: filterEnd }, status: "completed" } },
                {
                    $group: {
                        _id: "$orderType",
                        count: { $sum: 1 },
                        revenue: { $sum: "$total" },
                    },
                },
            ]),
            // Orders by category (through items) - Not currently used in frontend but good to have
            Order.aggregate([
                { $match: { createdAt: { $gte: filterStart, $lte: filterEnd }, status: "completed" } },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.name",
                        quantity: { $sum: "$items.quantity" },
                        revenue: { $sum: "$items.subtotal" },
                    },
                },
                { $sort: { revenue: -1 } },
                { $limit: 5 },
            ]),
            // Total menu items
            MenuItem.countDocuments({ isActive: true }),
            // Total categories
            MenuCategory.countDocuments({ isActive: true }),
        ]);

        // Extract stats
        const allTime = allTimeStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
        const selectedPeriod = selectedPeriodStats[0] || { revenue: 0, orders: 0 };
        const previousPeriod = previousPeriodStats[0] || { revenue: 0, orders: 0 };

        const todayStat = todayStats[0] || { revenue: 0, orders: 0 };
        const thisWeek = thisWeekStats[0] || { revenue: 0, orders: 0 };
        const thisMonth = thisMonthStats[0] || { revenue: 0, orders: 0 };

        // Calculate growth based on SELECTED PERIOD vs PREVIOUS PERIOD
        const growth = previousPeriod.revenue > 0
            ? ((selectedPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100
            : selectedPeriod.revenue > 0 ? 100 : 0;

        // Format best sellers
        const bestSellers = bestSellingItems.map((item: any, index: number) => ({
            rank: index + 1,
            name: item._id,
            quantity: item.totalQuantity,
            revenue: item.totalRevenue,
            orders: item.orderCount,
        }));

        // Format payment methods
        const paymentMethods = revenueByPaymentMethod.map((p: any) => ({
            method: p._id,
            revenue: p.total,
            orders: p.count,
        }));

        // Format daily revenue
        const dailyData = dailyRevenue.map((d: any) => ({
            date: d._id,
            revenue: d.revenue,
            orders: d.orders,
        }));

        // Format order types
        const orderTypes = orderTypeBreakdown.map((o: any) => ({
            type: o._id,
            count: o.count,
            revenue: o.revenue,
            orders: o.count
        }));

        return successResponse({
            financial: {
                allTime: {
                    revenue: allTime.totalRevenue,
                    orders: allTime.totalOrders,
                    avgOrderValue: allTime.avgOrderValue,
                },
                selectedPeriod: {
                    revenue: selectedPeriod.revenue,
                    orders: selectedPeriod.orders
                },
                thisMonth: thisMonth, // Keep specific card data
                thisWeek: thisWeek,   // Keep specific card data
                today: todayStat,     // Keep specific card data
                growth: Math.round(growth),
            },
            bestSellers,
            paymentMethods,
            dailyRevenue: dailyData,
            orderTypes,
            inventory: {
                totalItems: totalMenuItems,
                totalCategories: totalCategories,
            },
            meta: {
                startDate: filterStart,
                endDate: filterEnd
            }
        });
    } catch (error: any) {
        console.error("Reports API error:", error);
        return errorResponse("Failed to fetch reports", 500);
    }
}
