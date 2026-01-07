import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMenuCategory extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const MenuCategory: Model<IMenuCategory> =
    mongoose.models.MenuCategory || mongoose.model<IMenuCategory>("MenuCategory", MenuCategorySchema);

export default MenuCategory;
