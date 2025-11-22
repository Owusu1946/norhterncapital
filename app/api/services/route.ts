import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Service from "@/models/Service";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/services
 * Get all services (public)
 */
export async function GET(request: NextRequest) {
  console.log("🎯 GET /api/services - Fetching all services");
  
  try {
    // Connect to database
    await connectDB();

    // Get all active services
    const services = await Service.find({ isActive: true })
      .sort({ category: 1, name: 1 })
      .lean();

    const servicesData = services.map(service => ({
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category,
      icon: service.icon,
      isActive: service.isActive,
      createdAt: service.createdAt,
    }));

    return successResponse({ services: servicesData });
  } catch (error: any) {
    console.error("❌ Get services error:", error);
    return errorResponse("Failed to fetch services", 500);
  }
}

/**
 * POST /api/services
 * Create a new service (admin only)
 */
export async function POST(request: NextRequest) {
  console.log("🎯 POST /api/services - Creating new service");
  
  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    console.log("✅ Admin authenticated:", user.email);

    // Get request body
    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      icon,
    } = body;

    console.log("📝 Creating service:", { name, category, price });

    // Validate required fields
    if (!name || !description || price === undefined || !category) {
      return errorResponse("Missing required fields", 400);
    }

    // Validate price
    if (price < 0) {
      return errorResponse("Price cannot be negative", 400);
    }

    // Connect to database
    await connectDB();

    // Check if service already exists
    const existingService = await Service.findOne({ name });
    if (existingService) {
      return errorResponse("A service with this name already exists", 400);
    }

    // Create service
    const service = await Service.create({
      name,
      description,
      price: Number(price),
      category,
      icon: icon || "",
      isActive: true,
    });

    console.log("✅ Service created successfully:", service._id);

    // Return service data
    const serviceData = {
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category,
      icon: service.icon,
      isActive: service.isActive,
    };

    return successResponse({ service: serviceData }, "Service created successfully", 201);
  } catch (error: any) {
    console.error("❌ Create service error:", error);
    
    if (error.code === 11000) {
      return errorResponse("A service with this name already exists", 400);
    }
    
    return errorResponse("Failed to create service", 500);
  }
}

/**
 * PUT /api/services
 * Update a service (admin only)
 */
export async function PUT(request: NextRequest) {
  console.log("🎯 PUT /api/services - Updating service");
  
  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    // Get request body
    const body = await request.json();
    const {
      id,
      name,
      description,
      price,
      category,
      icon,
      isActive,
    } = body;

    if (!id) {
      return errorResponse("Service ID is required", 400);
    }

    // Connect to database
    await connectDB();

    // Find and update service
    const service = await Service.findById(id);
    if (!service) {
      return errorResponse("Service not found", 404);
    }

    // Update fields
    if (name) service.name = name;
    if (description) service.description = description;
    if (price !== undefined) service.price = Number(price);
    if (category) service.category = category;
    if (icon !== undefined) service.icon = icon;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    console.log("✅ Service updated successfully:", service._id);

    return successResponse({ service }, "Service updated successfully");
  } catch (error: any) {
    console.error("❌ Update service error:", error);
    return errorResponse("Failed to update service", 500);
  }
}

/**
 * DELETE /api/services
 * Delete a service (admin only)
 */
export async function DELETE(request: NextRequest) {
  console.log("🎯 DELETE /api/services - Deleting service");
  
  try {
    // Authenticate admin
    const { user, error } = await authenticateAdmin(request);
    if (error) {
      console.log("❌ Admin authentication failed");
      return error;
    }

    // Get service ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return errorResponse("Service ID is required", 400);
    }

    // Connect to database
    await connectDB();

    // Soft delete the service
    const service = await Service.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return errorResponse("Service not found", 404);
    }

    console.log("✅ Service deleted successfully:", service._id);

    return successResponse({ service }, "Service deleted successfully");
  } catch (error: any) {
    console.error("❌ Delete service error:", error);
    return errorResponse("Failed to delete service", 500);
  }
}
