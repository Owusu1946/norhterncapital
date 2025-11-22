import mongoose, { Document, Model, Schema } from "mongoose";

export interface IService extends Document {
  name: string;
  description: string;
  price: number;
  category: "transport" | "spa" | "dining" | "activities" | "other";
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["transport", "spa", "dining", "activities", "other"],
    },
    icon: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
ServiceSchema.index({ name: 1, isActive: 1 });
ServiceSchema.index({ category: 1 });

// Prevent model recompilation in development
const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);

export default Service;
