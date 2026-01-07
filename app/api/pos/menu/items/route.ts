import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/menu/items
 * Get all menu items (optionally filtered by category)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("category");

        await connectDB();

        const query: any = { isActive: true };
        if (categoryId) {
            query.category = categoryId;
        }

        const items = await MenuItem.find(query)
            .populate("category", "name")
            .sort({ name: 1 });

        return successResponse({ items });
    } catch (error: any) {
        console.error("Error fetching items:", error);
        return errorResponse("Failed to fetch items", 500);
    }
}

/**
 * POST /api/pos/menu/items
 * Create a new menu item
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, price, category, image, tags } = body;

        if (!name || !price || !category) {
            return errorResponse("Name, price, and category are required", 400);
        }

        await connectDB();

        const item = await MenuItem.create({
            name: name.trim(),
            description: description?.trim(),
            price: parseFloat(price),
            category,
            image,
            tags,
        });

        const populatedItem = await MenuItem.findById(item._id).populate("category", "name");

        return successResponse({ item: populatedItem }, "Item created successfully", 201);
    } catch (error: any) {
        console.error("Error creating item:", error);
        return errorResponse("Failed to create item", 500);
    }
}

/**
 * PUT /api/pos/menu/items
 * Update a menu item
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, description, price, category, image, isAvailable, tags } = body;

        if (!id) {
            return errorResponse("Item ID is required", 400);
        }

        await connectDB();

        const updateData: any = {};
        if (name) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim();
        if (price !== undefined) updateData.price = parseFloat(price);
        if (category) updateData.category = category;
        if (image !== undefined) updateData.image = image;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (tags) updateData.tags = tags;

        const item = await MenuItem.findByIdAndUpdate(id, updateData, { new: true })
            .populate("category", "name");

        if (!item) {
            return errorResponse("Item not found", 404);
        }

        return successResponse({ item }, "Item updated successfully");
    } catch (error: any) {
        console.error("Error updating item:", error);
        return errorResponse("Failed to update item", 500);
    }
}

/**
 * DELETE /api/pos/menu/items
 * Delete a menu item (soft delete)
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return errorResponse("Item ID is required", 400);
        }

        await connectDB();

        const item = await MenuItem.findByIdAndUpdate(id, { isActive: false });
        if (!item) {
            return errorResponse("Item not found", 404);
        }

        return successResponse({}, "Item deleted successfully");
    } catch (error: any) {
        console.error("Error deleting item:", error);
        return errorResponse("Failed to delete item", 500);
    }
}
