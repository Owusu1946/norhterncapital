import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IMenuItem extends Document {
    name: string;
    description?: string;
    price: number;
    category: Types.ObjectId;
    image?: string;
    isAvailable: boolean;
    isActive: boolean;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
    {
        name: {
            type: String,
            required: [true, "Item name is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "MenuCategory",
            required: [true, "Category is required"],
        },
        image: {
            type: String,
            trim: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        tags: [{
            type: String,
            trim: true,
        }],
    },
    {
        timestamps: true,
    }
);

// Index for category queries
MenuItemSchema.index({ category: 1, isActive: 1 });

const MenuItem: Model<IMenuItem> =
    mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);

export default MenuItem;
