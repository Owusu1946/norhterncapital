import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBooking extends Document {
  // User Information
  userId?: mongoose.Types.ObjectId;
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  guestCountry: string;

  // Room Details
  roomSlug: string;
  roomName: string;
  roomImage: string;
  roomNumber?: string;
  pricePerNight: number;
  numberOfRooms: number;

  // Dates
  checkIn: Date;
  checkOut: Date;
  nights: number;

  // Guest Count
  adults: number;
  children: number;
  totalGuests: number;

  // Additional Services
  additionalServices: {
    id: string;
    name: string;
    price: number;
  }[];

  // Special Requests
  specialRequests?: string;

  // Payment Information
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  paymentReference?: string;
  paystackReference?: string;

  // Booking Status
  bookingStatus: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

  // Metadata
  bookingSource: "website" | "walk_in" | "agent" | "phone";
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    // User Information
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true, // Index for fast user booking lookups
    },
    guestEmail: {
      type: String,
      required: [true, "Guest email is required"],
      lowercase: true,
      trim: true,
      index: true, // Index for email lookups
    },
    guestFirstName: {
      type: String,
      required: [true, "Guest first name is required"],
      trim: true,
    },
    guestLastName: {
      type: String,
      required: [true, "Guest last name is required"],
      trim: true,
    },
    guestPhone: {
      type: String,
      required: [true, "Guest phone is required"],
      trim: true,
    },
    guestCountry: {
      type: String,
      required: [true, "Guest country is required"],
      trim: true,
    },

    // Room Details
    roomSlug: {
      type: String,
      required: [true, "Room slug is required"],
      index: true, // Index for room-based queries
    },
    roomName: {
      type: String,
      required: [true, "Room name is required"],
    },
    roomImage: {
      type: String,
      default: "/hotel-images/4.JPG",
    },
    roomNumber: {
      type: String,
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: 0,
    },
    numberOfRooms: {
      type: Number,
      required: [true, "Number of rooms is required"],
      min: 1,
      default: 1,
    },

    // Dates
    checkIn: {
      type: Date,
      required: [true, "Check-in date is required"],
      index: true, // Index for date range queries
    },
    checkOut: {
      type: Date,
      required: [true, "Check-out date is required"],
      index: true,
    },
    nights: {
      type: Number,
      required: [true, "Number of nights is required"],
      min: 1,
    },

    // Guest Count
    adults: {
      type: Number,
      required: [true, "Number of adults is required"],
      min: 1,
    },
    children: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGuests: {
      type: Number,
      required: [true, "Total guests is required"],
      min: 1,
    },

    // Additional Services
    additionalServices: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],

    // Special Requests
    specialRequests: {
      type: String,
      trim: true,
    },

    // Payment Information
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true, // Index for payment status queries
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      default: "card",
    },
    paymentReference: {
      type: String,
      sparse: true, // Sparse index for optional unique field
      index: true,
    },
    paystackReference: {
      type: String,
      sparse: true,
      index: true,
    },

    // Booking Status
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"],
      default: "pending",
      index: true, // Index for status queries
    },

    // Metadata
    bookingSource: {
      type: String,
      enum: ["website", "walk_in", "agent", "phone"],
      default: "website",
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Compound indexes for common queries (optimization)
BookingSchema.index({ userId: 1, createdAt: -1 }); // User bookings sorted by date
BookingSchema.index({ guestEmail: 1, createdAt: -1 }); // Guest bookings sorted by date
BookingSchema.index({ checkIn: 1, checkOut: 1 }); // Date range queries
BookingSchema.index({ bookingStatus: 1, checkIn: 1 }); // Status + date queries
BookingSchema.index({ paymentStatus: 1, createdAt: -1 }); // Payment status queries

// Prevent model recompilation in development
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
