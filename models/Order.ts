import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IOrderItem {
    menuItem: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface IOrder extends Document {
    orderNumber: number;
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: "cash" | "card" | "momo";
    amountPaid: number;
    change: number;
    customerName?: string;
    orderType: "dine-in" | "takeaway";
    status: "pending" | "completed" | "cancelled";
    processedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
    menuItem: {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    subtotal: {
        type: Number,
        required: true,
    },
});

const OrderSchema = new Schema<IOrder>(
    {
        orderNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        items: [OrderItemSchema],
        subtotal: {
            type: Number,
            required: true,
        },
        tax: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "card", "momo"],
            required: true,
        },
        amountPaid: {
            type: Number,
            required: true,
        },
        change: {
            type: Number,
            default: 0,
        },
        customerName: {
            type: String,
            trim: true,
        },
        orderType: {
            type: String,
            enum: ["dine-in", "takeaway"],
            default: "dine-in",
        },
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "completed",
        },
        processedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Index for order queries
OrderSchema.index({ orderNumber: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });

const Order: Model<IOrder> =
    mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
