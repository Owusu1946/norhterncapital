import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import AiInsight from "@/models/AiInsight";
import mongoose from "mongoose";
import { inngest } from "@/lib/inngest/client";

/**
 * Execute tool calls from Gemini
 * Returns structured data that the AI can use to formulate responses
 */
export async function executeToolCall(
    toolName: string,
    args: Record<string, any>
): Promise<any> {
    await connectDB();

    switch (toolName) {
        case "getBookingStats":
            return await getBookingStats(args.period);
        case "getExpiringBookings":
            return await getExpiringBookings(args.limit || 10);
        case "searchBookings":
            return await searchBookings(args.query, args.status || "all");
        case "getRevenueReport":
            return await getRevenueReport(args.startDate, args.endDate);
        case "getRoomTypePerformance":
            return await getRoomTypePerformance(args.period);
        case "getTodaySnapshot":
            return await getTodaySnapshot();
        case "getPaymentSummary":
            return await getPaymentSummary(args.period);
        case "getPendingPayments":
            return await getPendingPayments(args.limit || 10);
        case "getGuestProfile":
            return await getGuestProfile(args.email);
        case "getBookingDetails":
            return await getBookingDetails(args.bookingId);
        case "getTopGuests":
            return await getTopGuests(args.sortBy || "revenue", args.limit || 10);
        case "getOccupancyTrends":
            return await getOccupancyTrends(args.startDate, args.endDate);
        case "requestRevenueReport":
            return await requestRevenueReport(args.startDate, args.endDate, args.email, args.reportType || "revenue");
        case "updateBookingStatus":
            return await updateBookingStatus(args.bookingId, args.status, args.note);
        case "updatePaymentStatus":
            return await updatePaymentStatus(args.bookingId, args.status, args.amountPaid);
        case "updateStayStatus":
            return await updateStayStatus(args.bookingId, args.status);
        case "getRevenueForecast":
            return await getRevenueForecast(args.targetMonth);
        case "getOccupancyWarnings":
            return await getOccupancyWarnings(args.weeksAhead || 4);
        case "saveInsight":
            return await saveInsight(args.category, args.content, args.tags, args.importance);
        case "searchKnowledgeBase":
            return await searchKnowledgeBase(args.query, args.category);
        default:
            return { error: `Unknown tool: ${toolName} ` };
    }
}

/**
 * Get booking statistics for a period
 */
async function getBookingStats(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
        case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
        case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case "year":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        default:
            startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const stats = await Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: "$bookingStatus",
                count: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
            }
        }
    ]);

    const totals = {
        period,
        totalBookings: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        checkedIn: 0,
        checkedOut: 0,
        totalRevenue: 0
    };

    stats.forEach((s: any) => {
        totals.totalBookings += s.count;
        totals.totalRevenue += s.revenue;
        switch (s._id) {
            case "confirmed": totals.confirmed = s.count; break;
            case "pending": totals.pending = s.count; break;
            case "cancelled": totals.cancelled = s.count; break;
            case "checked_in": totals.checkedIn = s.count; break;
            case "checked_out": totals.checkedOut = s.count; break;
        }
    });

    return totals;
}

/**
 * Get bookings expiring (checking out) today
 */
async function getExpiringBookings(limit: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await Booking.find({
        checkOut: { $gte: today, $lt: tomorrow },
        bookingStatus: { $in: ["confirmed", "checked_in"] }
    })
        .limit(limit)
        .select("guestFirstName guestLastName roomName checkIn checkOut totalAmount paymentStatus")
        .lean();

    return {
        count: bookings.length,
        bookings: bookings.map((b: any) => ({
            id: b._id.toString(),
            guest: `${b.guestFirstName} ${b.guestLastName} `,
            room: b.roomName,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            amount: b.totalAmount,
            paymentStatus: b.paymentStatus
        }))
    };
}

/**
 * Search bookings by query
 */
async function searchBookings(query: string, status: string) {
    const filter: any = {
        $or: [
            { guestFirstName: { $regex: query, $options: "i" } },
            { guestLastName: { $regex: query, $options: "i" } },
            { guestEmail: { $regex: query, $options: "i" } },
            { guestPhone: { $regex: query, $options: "i" } },
            { paymentReference: { $regex: query, $options: "i" } },
            {
                $expr: {
                    $regexMatch: {
                        input: { $concat: ["$guestFirstName", " ", "$guestLastName"] },
                        regex: query,
                        options: "i"
                    }
                }
            }
        ]
    };

    if (status !== "all") {
        filter.bookingStatus = status;
    }

    const bookings = await Booking.find(filter)
        .limit(10)
        .sort({ createdAt: -1 })
        .select("guestFirstName guestLastName guestEmail guestPhone roomName checkIn checkOut totalAmount bookingStatus paymentStatus")
        .lean();

    return {
        count: bookings.length,
        query,
        status,
        bookings: bookings.map((b: any) => ({
            id: b._id.toString(),
            guest: `${b.guestFirstName} ${b.guestLastName} `,
            email: b.guestEmail,
            phone: b.guestPhone,
            room: b.roomName,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            amount: b.totalAmount,
            bookingStatus: b.bookingStatus,
            paymentStatus: b.paymentStatus
        }))
    };
}

/**
 * Get revenue report for date range
 */
async function getRevenueReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const revenue = await Booking.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                paymentStatus: "paid"
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                bookings: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const totalRevenue = revenue.reduce((sum: number, r: any) => sum + r.revenue, 0);
    const totalBookings = revenue.reduce((sum: number, r: any) => sum + r.bookings, 0);

    return {
        period: { start: startDate, end: endDate },
        totalRevenue,
        totalBookings,
        dailyBreakdown: revenue.map((r: any) => ({
            date: r._id,
            bookings: r.bookings,
            revenue: r.revenue
        }))
    };
}

/**
 * Get room type performance metrics
 */
async function getRoomTypePerformance(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
        case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        default:
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    const performance = await Booking.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: "paid" } },
        {
            $group: {
                _id: "$roomName",
                bookings: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
                avgNights: { $avg: "$nights" }
            }
        },
        { $sort: { revenue: -1 } }
    ]);

    return {
        period,
        roomTypes: performance.map((p: any) => ({
            name: p._id,
            bookings: p.bookings,
            revenue: p.revenue,
            avgNights: Math.round(p.avgNights * 10) / 10
        }))
    };
}

/**
 * Get today's operational snapshot
 */
async function getTodaySnapshot() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [arrivals, departures, newBookings, pendingPayments] = await Promise.all([
        Booking.countDocuments({
            checkIn: { $gte: today, $lt: tomorrow },
            bookingStatus: { $in: ["confirmed", "checked_in"] }
        }),
        Booking.countDocuments({
            checkOut: { $gte: today, $lt: tomorrow },
            bookingStatus: { $in: ["confirmed", "checked_in"] }
        }),
        Booking.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow }
        }),
        Booking.countDocuments({
            paymentStatus: "pending"
        })
    ]);

    const currentGuests = await Booking.countDocuments({
        bookingStatus: "checked_in"
    });

    const todayRevenue = await Booking.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    return {
        date: today.toISOString().split("T")[0],
        arrivals,
        departures,
        newBookingsToday: newBookings,
        currentlyCheckedIn: currentGuests,
        pendingPayments,
        todayRevenue: todayRevenue[0]?.total || 0
    };
}

/**
 * Get payment summary for a period
 */
async function getPaymentSummary(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
        case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
        case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case "year":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        default:
            startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const payments = await Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: "$paymentStatus",
                count: { $sum: 1 },
                total: { $sum: "$totalAmount" }
            }
        }
    ]);

    const summary = {
        period,
        paid: { count: 0, total: 0 },
        pending: { count: 0, total: 0 },
        failed: { count: 0, total: 0 },
        refunded: { count: 0, total: 0 },
        totalCollected: 0,
        totalOutstanding: 0
    };

    payments.forEach((p: any) => {
        switch (p._id) {
            case "paid":
                summary.paid = { count: p.count, total: p.total };
                summary.totalCollected = p.total;
                break;
            case "pending":
                summary.pending = { count: p.count, total: p.total };
                summary.totalOutstanding += p.total;
                break;
            case "failed":
                summary.failed = { count: p.count, total: p.total };
                summary.totalOutstanding += p.total;
                break;
            case "refunded":
                summary.refunded = { count: p.count, total: p.total };
                break;
        }
    });

    return summary;
}

/**
 * Get bookings with pending payments
 */
async function getPendingPayments(limit: number) {
    const bookings = await Booking.find({
        paymentStatus: { $in: ["pending", "failed"] }
    })
        .limit(limit)
        .sort({ createdAt: -1 })
        .select("guestFirstName guestLastName guestEmail guestPhone roomName checkIn checkOut totalAmount paymentStatus bookingStatus createdAt")
        .lean();

    return {
        count: bookings.length,
        totalOutstanding: bookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0),
        bookings: bookings.map((b: any) => ({
            guest: `${b.guestFirstName} ${b.guestLastName} `,
            email: b.guestEmail,
            phone: b.guestPhone,
            room: b.roomName,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            amount: b.totalAmount,
            paymentStatus: b.paymentStatus,
            bookingStatus: b.bookingStatus,
            bookedOn: b.createdAt
        }))
    };
}

/**
 * Get guest profile by email
 */
async function getGuestProfile(email: string) {
    const bookings = await Booking.find({ guestEmail: email.toLowerCase() })
        .sort({ createdAt: -1 })
        .select("guestFirstName guestLastName guestPhone guestCountry roomName checkIn checkOut totalAmount nights bookingStatus paymentStatus createdAt additionalServices specialRequests")
        .lean();

    if (bookings.length === 0) {
        return { error: `No guest found with email: ${email} ` };
    }

    const firstBooking = bookings[bookings.length - 1] as any;
    const lastBooking = bookings[0] as any;

    const totalSpent = bookings.reduce((sum: number, b: any) =>
        b.paymentStatus === "paid" ? sum + b.totalAmount : sum, 0);
    const totalNights = bookings.reduce((sum: number, b: any) => sum + b.nights, 0);

    const favoriteRoom = bookings.reduce((acc: any, b: any) => {
        acc[b.roomName] = (acc[b.roomName] || 0) + 1;
        return acc;
    }, {});
    const mostBookedRoom = Object.entries(favoriteRoom).sort((a: any, b: any) => b[1] - a[1])[0];

    return {
        guest: {
            name: `${firstBooking.guestFirstName} ${firstBooking.guestLastName} `,
            email,
            phone: lastBooking.guestPhone,
            country: lastBooking.guestCountry
        },
        stats: {
            totalBookings: bookings.length,
            totalSpent,
            totalNights,
            averageSpend: Math.round(totalSpent / bookings.length),
            favoriteRoom: mostBookedRoom ? mostBookedRoom[0] : null,
            firstStay: firstBooking.createdAt,
            lastStay: lastBooking.createdAt
        },
        recentBookings: bookings.slice(0, 5).map((b: any) => ({
            room: b.roomName,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            amount: b.totalAmount,
            status: b.bookingStatus,
            paymentStatus: b.paymentStatus
        }))
    };
}

/**
 * Get booking details by ID
 */
async function getBookingDetails(bookingId: string) {
    let booking;

    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(bookingId)) {
        booking = await Booking.findById(bookingId).lean();
    }

    // If not found, try by payment reference
    if (!booking) {
        booking = await Booking.findOne({
            $or: [
                { paymentReference: bookingId },
                { paystackReference: bookingId }
            ]
        }).lean();
    }

    if (!booking) {
        return { error: `Booking not found: ${bookingId} ` };
    }

    const b = booking as any;
    return {
        id: b._id,
        guest: {
            name: `${b.guestFirstName} ${b.guestLastName} `,
            email: b.guestEmail,
            phone: b.guestPhone,
            country: b.guestCountry
        },
        room: {
            name: b.roomName,
            number: b.roomNumber,
            pricePerNight: b.pricePerNight,
            numberOfRooms: b.numberOfRooms
        },
        dates: {
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            nights: b.nights
        },
        guests: {
            adults: b.adults,
            children: b.children,
            total: b.totalGuests
        },
        payment: {
            total: b.totalAmount,
            status: b.paymentStatus,
            method: b.paymentMethod,
            reference: b.paymentReference
        },
        status: b.bookingStatus,
        source: b.bookingSource,
        additionalServices: b.additionalServices,
        specialRequests: b.specialRequests,
        createdAt: b.createdAt
    };
}

/**
 * Get top guests by bookings or revenue
 */
async function getTopGuests(sortBy: string, limit: number) {
    const guests = await Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
            $group: {
                _id: "$guestEmail",
                name: { $first: { $concat: ["$guestFirstName", " ", "$guestLastName"] } },
                phone: { $first: "$guestPhone" },
                bookings: { $sum: 1 },
                totalSpent: { $sum: "$totalAmount" },
                totalNights: { $sum: "$nights" },
                lastVisit: { $max: "$checkOut" }
            }
        },
        { $sort: sortBy === "bookings" ? { bookings: -1 } : { totalSpent: -1 } },
        { $limit: limit }
    ]);

    return {
        sortedBy: sortBy,
        guests: guests.map((g: any) => ({
            name: g.name,
            email: g._id,
            phone: g.phone,
            bookings: g.bookings,
            totalSpent: g.totalSpent,
            totalNights: g.totalNights,
            lastVisit: g.lastVisit
        }))
    };
}

/**
 * Get occupancy trends (check-ins and check-outs by date)
 */
async function getOccupancyTrends(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [checkInTrends, checkOutTrends] = await Promise.all([
        Booking.aggregate([
            {
                $match: {
                    checkIn: { $gte: start, $lte: end },
                    bookingStatus: { $ne: "cancelled" }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkIn" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Booking.aggregate([
            {
                $match: {
                    checkOut: { $gte: start, $lte: end },
                    bookingStatus: { $ne: "cancelled" }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkOut" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])
    ]);

    // Merge trends into a single daily map
    const dailyMap: Record<string, { checkIns: number, checkOuts: number }> = {};

    checkInTrends.forEach(item => {
        dailyMap[item._id] = { ...dailyMap[item._id], checkIns: item.count };
    });

    checkOutTrends.forEach(item => {
        dailyMap[item._id] = { ...dailyMap[item._id], checkOuts: item.count };
    });

    const trends = Object.entries(dailyMap).map(([date, counts]) => ({
        date,
        checkIns: counts.checkIns || 0,
        checkOuts: counts.checkOuts || 0
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
        period: { start: startDate, end: endDate },
        totalCheckIns: checkInTrends.reduce((sum, item) => sum + item.count, 0),
        totalCheckOuts: checkOutTrends.reduce((sum, item) => sum + item.count, 0),
        dailyTrends: trends
    };
}

/**
 * Trigger background report generation
 */
async function requestRevenueReport(startDate: string, endDate: string, email: string, reportType: string) {
    try {
        await inngest.send({
            name: "hotel/report.generate",
            data: {
                reportType,
                startDate,
                endDate,
                userEmail: email
            }
        });

        return {
            success: true,
            message: `Report scheduled for ${email}.`,
            status: "scheduled"
        };
    } catch (error: any) {
        console.error("Failed to schedule report:", error);
        return {
            success: false,
            error: "Failed to schedule report. Please try again later."
        };
    }
}

/**
 * Update booking status (confirm/cancel)
 */
async function updateBookingStatus(bookingId: string, status: string, note?: string) {
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return { error: "Booking not found" };

        booking.bookingStatus = status as any;
        if (note) {
            booking.specialRequests = (booking.specialRequests || "") + `\n[AI Update]: ${note}`;
        }

        await booking.save();

        return {
            success: true,
            message: `Booking ${booking.paymentReference || booking._id} has been marked as ${status}.`,
            booking: {
                id: booking._id,
                status: booking.bookingStatus,
                reference: booking.paymentReference
            }
        };
    } catch (error: any) {
        return { error: `Failed to update booking: ${error.message}` };
    }
}

/**
 * Update payment status
 */
async function updatePaymentStatus(bookingId: string, status: string, amountPaid?: number) {
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return { error: "Booking not found" };

        booking.paymentStatus = status as any;
        if (amountPaid !== undefined) {
            booking.specialRequests = (booking.specialRequests || "") + `\n[AI Payment Update]: Marked as ${status} with amount ${amountPaid}`;
        }

        await booking.save();

        return {
            success: true,
            message: `Payment status for booking ${booking.paymentReference || booking._id} updated to ${status}.`,
            booking: {
                id: booking._id,
                paymentStatus: booking.paymentStatus,
                reference: booking.paymentReference
            }
        };
    } catch (error: any) {
        return { error: `Failed to update payment: ${error.message}` };
    }
}

/**
 * Update stay status (check-in/out)
 */
async function updateStayStatus(bookingId: string, status: string) {
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return { error: "Booking not found" };

        // Map AI friendly status to DB status
        const statusMap: Record<string, string> = {
            "checked-in": "checked_in",
            "checked-out": "checked_out",
            "checked_in": "checked_in",
            "checked_out": "checked_out"
        };

        const dbStatus = statusMap[status] || status;
        booking.bookingStatus = dbStatus as any;

        await booking.save();

        return {
            success: true,
            message: `Guest status for booking ${booking.paymentReference || booking._id} updated to ${dbStatus.replace('_', ' ')}.`,
            booking: {
                id: booking._id,
                status: booking.bookingStatus,
                reference: booking.paymentReference
            }
        };
    } catch (error: any) {
        return { error: `Failed to update stay status: ${error.message}` };
    }
}

/**
 * Predict revenue for a target month based on historical trends
 */
async function getRevenueForecast(targetMonth: string) {
    try {
        const targetDate = new Date(targetMonth);
        const nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);

        // 1. Get current on-the-books (OTB) revenue for target month
        const otbBookings = await Booking.find({
            checkIn: { $gte: targetDate, $lt: nextMonth },
            bookingStatus: { $ne: "cancelled" }
        }).select("totalAmount").lean();

        const otbRevenue = otbBookings.reduce((sum, b) => sum + b.totalAmount, 0);

        // 2. Get last year's same month revenue
        const lastYearStart = new Date(targetDate.getFullYear() - 1, targetDate.getMonth(), 1);
        const lastYearEnd = new Date(targetDate.getFullYear() - 1, targetDate.getMonth() + 1, 1);

        const lastYearBookings = await Booking.find({
            checkIn: { $gte: lastYearStart, $lt: lastYearEnd },
            bookingStatus: { $ne: "cancelled" }
        }).select("totalAmount").lean();

        const lastYearRevenue = lastYearBookings.reduce((sum, b) => sum + b.totalAmount, 0);

        // 3. Simple Projection Algorithm
        // (Current Year Pace vs Last Year)
        const paceModifier = lastYearRevenue > 0 ? (otbRevenue / lastYearRevenue) : 1;
        const forecastedRevenue = lastYearRevenue > 0
            ? Math.max(otbRevenue, lastYearRevenue * 1.1) // Assume 10% growth if data is sparse
            : otbRevenue * 2; // Rough estimate if no last year data

        return {
            targetMonth,
            currentOnTheBooks: otbRevenue,
            lastYearActual: lastYearRevenue,
            forecastedRevenue: Math.round(forecastedRevenue),
            confidence: lastYearRevenue > 0 ? "high" : "medium",
            insight: otbRevenue > (lastYearRevenue * 0.5)
                ? "You are pacing well ahead of last year."
                : "Booking pace is slightly slower; consider a mid-month promotion."
        };
    } catch (error: any) {
        return { error: `Failed to generate forecast: ${error.message}` };
    }
}

/**
 * Identify low occupancy weeks ahead
 */
async function getOccupancyWarnings(weeksAhead: number) {
    try {
        const warnings = [];
        const today = new Date();

        for (let i = 0; i < weeksAhead; i++) {
            const start = new Date(today);
            start.setDate(today.getDate() + (i * 7));
            const end = new Date(start);
            end.setDate(start.getDate() + 7);

            const bookings = await Booking.find({
                checkIn: { $lt: end },
                checkOut: { $gt: start },
                bookingStatus: { $ne: "cancelled" }
            }).countDocuments();

            // Threshold: If bookings are less than 3 for a week (adjust based on hotel size)
            if (bookings < 5) {
                warnings.push({
                    weekStarting: start.toLocaleDateString(),
                    currentBookings: bookings,
                    severity: bookings < 2 ? "high" : "medium",
                    recommendation: "Run a limited-time flash sale for this week."
                });
            }
        }

        return {
            weeksAnalyzed: weeksAhead,
            warningsFound: warnings.length,
            warnings
        };
    } catch (error: any) {
        return { error: `Failed to check occupancy warnings: ${error.message}` };
    }
}

/**
 * Save a new insight to the knowledge base
 */
async function saveInsight(category: string, content: string, tags: string[], importance?: number) {
    try {
        const insight = await AiInsight.create({
            category,
            content,
            relevanceTags: tags,
            importance: importance || 5
        });

        return {
            success: true,
            message: "Insight saved to long-term memory.",
            id: insight._id
        };
    } catch (error: any) {
        return { error: `Failed to save insight: ${error.message}` };
    }
}

/**
 * Search for knowledge in the memory
 */
async function searchKnowledgeBase(query: string, category?: string) {
    try {
        const filter: any = {
            $or: [
                { content: { $regex: query, $options: "i" } },
                { relevanceTags: { $in: [new RegExp(query, "i")] } }
            ]
        };

        if (category) {
            filter.category = category;
        }

        const insights = await AiInsight.find(filter)
            .sort({ importance: -1, createdAt: -1 })
            .limit(5)
            .lean();

        return {
            query,
            count: insights.length,
            results: insights.map(i => ({
                category: i.category,
                content: i.content,
                learnedAt: i.createdAt
            }))
        };
    } catch (error: any) {
        return { error: `Failed to search knowledge base: ${error.message}` };
    }
}
