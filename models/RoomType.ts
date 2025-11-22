import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRoomType extends Document {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  pricePerNight: number;
  size: string;
  bedType: string;
  maxGuests: number;
  maxAdults: number;
  maxChildren: number;
  totalRooms: number; // Total number of rooms of this type available
  amenities: string[];
  perks: string[];
  services: string[]; // Array of Service IDs
  mainImage?: string;
  gallery: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomTypeSchema = new Schema<IRoomType>(
  {
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Room type name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    longDescription: {
      type: String,
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },
    size: {
      type: String,
      required: [true, "Room size is required"],
      trim: true,
    },
    bedType: {
      type: String,
      required: [true, "Bed type is required"],
      trim: true,
    },
    maxGuests: {
      type: Number,
      required: [true, "Maximum guests is required"],
      min: [1, "Must allow at least 1 guest"],
    },
    maxAdults: {
      type: Number,
      required: [true, "Maximum adults is required"],
      min: [1, "Must allow at least 1 adult"],
    },
    maxChildren: {
      type: Number,
      default: 0,
      min: [0, "Cannot be negative"],
    },
    totalRooms: {
      type: Number,
      required: [true, "Total rooms is required"],
      min: [1, "Must have at least 1 room"],
    },
    amenities: [{
      type: String,
      trim: true,
    }],
    perks: [{
      type: String,
      trim: true,
    }],
    services: [{
      type: Schema.Types.ObjectId,
      ref: "Service",
    }],
    mainImage: {
      type: String,
      trim: true,
    },
    gallery: [{
      type: String,
      trim: true,
    }],
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
RoomTypeSchema.index({ slug: 1, isActive: 1 });
RoomTypeSchema.index({ name: 1 });

// Prevent model recompilation in development
const RoomType: Model<IRoomType> =
  mongoose.models.RoomType || mongoose.model<IRoomType>("RoomType", RoomTypeSchema);

export default RoomType;
