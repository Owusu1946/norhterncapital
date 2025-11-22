import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRoom extends Document {
  roomNumber: string;
  roomTypeId: mongoose.Types.ObjectId;
  roomTypeSlug: string; // Cached for quick access
  roomTypeName: string; // Cached for quick access
  floor: number;
  status: "available" | "occupied" | "maintenance" | "reserved";
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: [true, "Room type is required"],
      index: true,
    },
    roomTypeSlug: {
      type: String,
      required: [true, "Room type slug is required"],
      trim: true,
    },
    roomTypeName: {
      type: String,
      required: [true, "Room type name is required"],
      trim: true,
    },
    floor: {
      type: Number,
      default: 1,
      min: [0, "Floor cannot be negative"],
    },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "reserved"],
      default: "available",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
RoomSchema.index({ roomTypeId: 1, status: 1 });
RoomSchema.index({ roomNumber: 1, isActive: 1 });
RoomSchema.index({ roomTypeSlug: 1, status: 1 });

// Prevent model recompilation in development
const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

export default Room;
