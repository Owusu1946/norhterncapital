import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import GeneralSettings from "@/models/GeneralSettings";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    let settings = await GeneralSettings.findOne();

    if (!settings) {
      settings = await GeneralSettings.create({});
    }

    return successResponse(
      {
        settings,
      },
      "General settings fetched successfully"
    );
  } catch (error: any) {
    console.error("GET /api/admin/settings/general error:", error);
    return errorResponse("Failed to fetch general settings", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const update = {
      hotelName: body.hotelName,
      hotelEmail: body.hotelEmail,
      hotelPhone: body.hotelPhone,
      hotelAddress: body.hotelAddress,
      currency: body.currency,
      timezone: body.timezone,
      website: body.website,
      taxNumber: body.taxNumber,
      receiptFooter: body.receiptFooter,
    };

    const settings = await GeneralSettings.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    return successResponse(
      {
        settings,
      },
      "General settings updated successfully"
    );
  } catch (error: any) {
    console.error("PUT /api/admin/settings/general error:", error);
    return errorResponse("Failed to update general settings", 500);
  }
}
