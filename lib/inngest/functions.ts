import { inngest } from "./client";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { sendReportEmail } from "@/lib/email";

/**
 * Background function to generate comprehensive reports
 * Triggered by AI chatbot when user requests detailed reports
 */
export const generateReport = inngest.createFunction(
    {
        id: "generate-hotel-report",
        name: "Generate Hotel Report",
    },
    { event: "hotel/report.generate" },
    async ({ event, step }) => {
        const { reportType, startDate, endDate, userEmail } = event.data;

        // Step 1: Connect to database
        await step.run("connect-database", async () => {
            await connectDB();
            return { status: "connected" };
        });

        // Step 2: Gather booking data
        const bookingData = await step.run("gather-booking-data", async () => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const bookings = await Booking.find({
                createdAt: { $gte: start, $lte: end },
                paymentStatus: "paid"
            })
                .select("roomName totalAmount nights adults children createdAt bookingStatus")
                .lean();

            return {
                count: bookings.length,
                bookings
            };
        });

        // Step 3: Calculate analytics
        const analytics = await step.run("calculate-analytics", async () => {
            const bookings = bookingData.bookings;

            const totalRevenue = bookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0);
            const avgBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;
            const totalNights = bookings.reduce((sum: number, b: any) => sum + b.nights, 0);
            const avgNights = bookings.length > 0 ? totalNights / bookings.length : 0;

            // Room performance
            const roomStats: Record<string, { count: number; revenue: number }> = {};
            bookings.forEach((b: any) => {
                if (!roomStats[b.roomName]) {
                    roomStats[b.roomName] = { count: 0, revenue: 0 };
                }
                roomStats[b.roomName].count++;
                roomStats[b.roomName].revenue += b.totalAmount;
            });

            // Sort by revenue
            const topRooms = Object.entries(roomStats)
                .map(([name, stats]) => ({ name, ...stats }))
                .sort((a, b) => b.revenue - a.revenue);

            return {
                totalBookings: bookings.length,
                totalRevenue,
                avgBookingValue: Math.round(avgBookingValue),
                avgNights: Math.round(avgNights * 10) / 10,
                topRooms: topRooms.slice(0, 5),
                insights: generateInsights({
                    totalBookings: bookings.length,
                    totalRevenue,
                    avgBookingValue: Math.round(avgBookingValue),
                    avgNights: Math.round(avgNights * 10) / 10,
                    topRooms: topRooms.slice(0, 5)
                })
            };
        });

        // Step 4: Generate report summary
        const report = await step.run("generate-summary", async () => {
            return {
                reportType,
                period: { start: startDate, end: endDate },
                generatedAt: new Date().toISOString(),
                summary: {
                    ...analytics,
                    insights: generateInsights(analytics)
                }
            };
        });

        // Step 5: Generate PDF and Send Email
        await step.run("generate-pdf-and-email", async () => {
            const doc = new jsPDF() as any;
            const logoColor: [number, number, number] = [1, 164, 255]; // Northern Capital Blue

            // Header
            doc.setFillColor(logoColor[0], logoColor[1], logoColor[2]);
            doc.rect(0, 0, 210, 40, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text("NORTHERN CAPITAL HOTEL", 105, 18, { align: "center" });
            doc.setFontSize(10);
            doc.text(`${reportType.toUpperCase()} PERFORMANCE REPORT`, 105, 28, { align: "center" });

            // Period info
            doc.setTextColor(51, 51, 51);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`Period: ${startDate} to ${endDate}`, 15, 50);
            doc.setFont("helvetica", "normal");
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 57);

            // Summary Stats table
            autoTable(doc, {
                startY: 65,
                head: [["Metric", "Value"]],
                body: [
                    ["Total Bookings", analytics.totalBookings],
                    ["Total Revenue", `GHS ${analytics.totalRevenue.toLocaleString()}`],
                    ["Average Booking Value", `GHS ${analytics.avgBookingValue.toLocaleString()}`],
                    ["Average Stay Duration", `${analytics.avgNights} nights`]
                ],
                theme: "striped",
                headStyles: { fillColor: logoColor },
                styles: { fontSize: 10, cellPadding: 5 }
            });

            // Top Rooms table
            const finalY = (doc as any).lastAutoTable?.finalY ?? 100;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Top Performing Room Types", 15, finalY + 15);

            autoTable(doc, {
                startY: finalY + 20,
                head: [["Room Type", "Bookings", "Revenue"]],
                body: analytics.topRooms.map((room: any) => [
                    room.name,
                    room.count,
                    `GHS ${room.revenue.toLocaleString()}`
                ]),
                theme: "grid",
                headStyles: { fillColor: [75, 85, 99] } // Gray header
            });

            // AI Insights
            const nextY = (doc as any).lastAutoTable?.finalY ?? 150;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("AI Insights & Observations", 15, nextY + 15);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            let y = nextY + 22;
            analytics.insights.forEach((insight: string) => {
                doc.text(`• ${insight}`, 15, y);
                y += 8;
            });

            // Footer
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${totalPages}`, 105, 285, { align: "center" });
                doc.text("Confidential - Northern Capital Hotel Internal Report", 105, 290, { align: "center" });
            }

            const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

            await sendReportEmail(
                userEmail,
                `${reportType.toUpperCase()} Report: ${startDate} to ${endDate}`,
                `Your ${reportType} report for the requested period is ready. Please find the PDF attachment below.`,
                {
                    filename: `Hotel_Report_${startDate}_to_${endDate}.pdf`,
                    content: pdfBuffer
                }
            );

            return { status: "sent" };
        });

        return {
            success: true,
            report
        };
    }
);

/**
 * Generate AI-style insights from analytics
 */
function generateInsights(analytics: any): string[] {
    const insights: string[] = [];

    if (analytics.totalBookings > 0) {
        insights.push(`You processed ${analytics.totalBookings} bookings during this period.`);
    }

    if (analytics.avgBookingValue > 500) {
        insights.push(`Great average booking value of GHS ${analytics.avgBookingValue}!`);
    }

    if (analytics.topRooms.length > 0) {
        insights.push(`${analytics.topRooms[0].name} was your top performer with GHS ${analytics.topRooms[0].revenue.toLocaleString()} revenue.`);
    }

    if (analytics.avgNights > 2) {
        insights.push(`Guests are staying an average of ${analytics.avgNights} nights - good retention!`);
    }

    return insights;
}

/**
 * All Inngest functions to register
 */
export const functions = [generateReport];
