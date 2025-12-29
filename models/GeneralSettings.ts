import mongoose, { Document, Model, Schema } from "mongoose";

export interface IGeneralSettings extends Document {
  hotelName: string;
  hotelEmail: string;
  hotelPhone: string;
  hotelAddress: string;
  currency: string;
  timezone: string;
  website?: string;
  taxNumber?: string;
  receiptFooter?: string;
}

const GeneralSettingsSchema = new Schema<IGeneralSettings>(
  {
    hotelName: {
      type: String,
      required: true,
      default: "Northern Capital Hotel",
      trim: true,
    },
    hotelEmail: {
      type: String,
      required: true,
      default: "info@northerncapital.com",
      trim: true,
      lowercase: true,
    },
    hotelPhone: {
      type: String,
      required: true,
      default: "+233 123 456 789",
      trim: true,
    },
    hotelAddress: {
      type: String,
      required: true,
      default: "123 Main Street, Accra, Ghana",
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      default: "GHS",
      trim: true,
    },
    timezone: {
      type: String,
      required: true,
      default: "Africa/Accra",
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: "www.northerncapitalhotel.com",
    },
    taxNumber: {
      type: String,
      trim: true,
      default: "GH123456789",
    },
    receiptFooter: {
      type: String,
      trim: true,
      default: "Terms & Conditions Apply",
    },
  },
  {
    timestamps: true,
  }
);

const GeneralSettings: Model<IGeneralSettings> =
  mongoose.models.GeneralSettings ||
  mongoose.model<IGeneralSettings>("GeneralSettings", GeneralSettingsSchema);

export default GeneralSettings;
