import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/orders/next-number
 * Get the next order number for display
 */
export async function GET() {
    try {
        await connectDB();

        const lastOrder = await Order.findOne().sort({ orderNumber: -1 }).select("orderNumber");
        const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;

        return successResponse({ orderNumber: nextOrderNumber });
    } catch (error: any) {
        console.error("Error getting next order number:", error);
        return errorResponse("Failed to get order number", 500);
    }
}
