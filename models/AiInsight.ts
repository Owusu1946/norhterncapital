import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAiInsight extends Document {
    category: "hotel_data" | "user_preference" | "report_summary" | "operational_strategy";
    content: string;
    relevanceTags: string[];
    importance: number; // 1-10
    source?: string; // e.g., "Report: Dec 2025", "User Chat"
    createdAt: Date;
    updatedAt: Date;
}

const AiInsightSchema = new Schema<IAiInsight>(
    {
        category: {
            type: String,
            enum: ["hotel_data", "user_preference", "report_summary", "operational_strategy"],
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
        },
        relevanceTags: {
            type: [String],
            index: true,
        },
        importance: {
            type: Number,
            min: 1,
            max: 10,
            default: 5,
        },
        source: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Search index for tags and content
AiInsightSchema.index({ content: "text", relevanceTags: "text" });

const AiInsight: Model<IAiInsight> =
    mongoose.models.AiInsight || mongoose.model<IAiInsight>("AiInsight", AiInsightSchema);

export default AiInsight;
