import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import RoomType from "@/models/RoomType";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return successResponse({ query: q, rooms: [], sections: [] }, "Empty query");
    }

    await connectDB();

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const roomTypes = await RoomType.find({
      isActive: true,
      $or: [{ name: regex }, { description: regex }],
    })
      .select("slug name description pricePerNight mainImage")
      .limit(10)
      .lean();

    const sections = [
      {
        id: "rooms",
        title: "Rooms",
        href: "/rooms",
        match: /room|suite|accommodation/i.test(q),
      },
      {
        id: "about",
        title: "About",
        href: "/about",
        match: /about|story|hotel/i.test(q),
      },
      {
        id: "amenities",
        title: "Amenities",
        href: "/amenities",
        match: /amenities|pool|gym|spa|restaurant/i.test(q),
      },
      {
        id: "contact",
        title: "Contact",
        href: "/contact",
        match: /contact|phone|email|location|address/i.test(q),
      },
    ].filter((s) => s.match);

    return successResponse(
      {
        query: q,
        rooms: roomTypes,
        sections,
      },
      "Search results fetched successfully"
    );
  } catch (error: any) {
    console.error("GET /api/search error:", error);
    return errorResponse("Failed to perform search", 500);
  }
}
