import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/orders
 * Get orders (optionally filtered by status or date)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");

        await connectDB();

        const query: any = {};
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("processedBy", "firstName lastName");

        return successResponse({ orders });
    } catch (error: any) {
        console.error("Error fetching orders:", error);
        return errorResponse("Failed to fetch orders", 500);
    }
}

/**
 * POST /api/pos/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            items,
            subtotal,
            tax,
            total,
            paymentMethod,
            amountPaid,
            change,
            customerName,
            orderType,
            processedBy
        } = body;

        if (!items || items.length === 0) {
            return errorResponse("Order must have at least one item", 400);
        }

        if (!paymentMethod || !amountPaid) {
            return errorResponse("Payment method and amount are required", 400);
        }

        await connectDB();

        // Get next order number
        const lastOrder = await Order.findOne().sort({ orderNumber: -1 }).select("orderNumber");
        const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;

        // Create order
        const order = await Order.create({
            orderNumber: nextOrderNumber,
            items: items.map((item: any) => ({
                menuItem: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
            })),
            subtotal,
            tax,
            total,
            paymentMethod: paymentMethod.toLowerCase(),
            amountPaid: parseFloat(amountPaid),
            change: parseFloat(change) || 0,
            customerName,
            orderType: orderType || "dine-in",
            status: "completed",
            processedBy,
        });

        return successResponse({
            order,
            orderNumber: nextOrderNumber
        }, "Order created successfully", 201);
    } catch (error: any) {
        console.error("Error creating order:", error);
        return errorResponse("Failed to create order", 500);
    }
}
