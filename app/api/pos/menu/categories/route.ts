import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import MenuCategory from "@/models/MenuCategory";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/menu/categories
 * Get all menu categories
 */
export async function GET() {
    try {
        await connectDB();
        const categories = await MenuCategory.find({ isActive: true }).sort({ order: 1, name: 1 });
        return successResponse({ categories });
    } catch (error: any) {
        console.error("Error fetching categories:", error);
        return errorResponse("Failed to fetch categories", 500);
    }
}

/**
 * POST /api/pos/menu/categories
 * Create a new menu category
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return errorResponse("Category name is required", 400);
        }

        await connectDB();

        // Check for duplicate
        const existing = await MenuCategory.findOne({ name: name.trim() });
        if (existing) {
            return errorResponse("Category already exists", 409);
        }

        const category = await MenuCategory.create({
            name: name.trim(),
            description: description?.trim(),
        });

        return successResponse({ category }, "Category created successfully", 201);
    } catch (error: any) {
        console.error("Error creating category:", error);
        return errorResponse("Failed to create category", 500);
    }
}

/**
 * DELETE /api/pos/menu/categories
 * Delete a category by ID (passed in body)
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return errorResponse("Category ID is required", 400);
        }

        await connectDB();

        const category = await MenuCategory.findByIdAndUpdate(id, { isActive: false });
        if (!category) {
            return errorResponse("Category not found", 404);
        }

        return successResponse({}, "Category deleted successfully");
    } catch (error: any) {
        console.error("Error deleting category:", error);
        return errorResponse("Failed to delete category", 500);
    }
}
