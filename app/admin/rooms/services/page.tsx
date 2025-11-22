"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Plus, Edit2, Trash2, X, Check, Car, Utensils, Sparkles, Calendar } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "transport" | "spa" | "dining" | "activities" | "other";
  icon?: string;
  isActive: boolean;
  createdAt: string;
}

const categoryIcons = {
  transport: Car,
  spa: Sparkles,
  dining: Utensils,
  activities: Calendar,
  other: Plus,
};

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "transport" as Service["category"],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  // Fetch services
  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const response = await fetch("/api/services", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setServices(data.data.services);
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "transport",
    });
    setFormErrors({});
    setSubmitStatus(null);
    setEditingService(null);
  }

  function openAddModal() {
    resetForm();
    setShowAddModal(true);
  }

  function openEditModal(service: Service) {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      category: service.category,
    });
    setEditingService(service);
    setShowAddModal(true);
  }

  function closeModal() {
    setShowAddModal(false);
    resetForm();
  }

  function validateForm() {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Service name is required";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (!formData.price || Number(formData.price) < 0) {
      errors.price = "Price must be 0 or greater";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitStatus("Processing...");
    
    try {
      const url = "/api/services";
      const method = editingService ? "PUT" : "POST";
      const body = editingService 
        ? { ...formData, id: editingService.id, price: Number(formData.price) }
        : { ...formData, price: Number(formData.price) };
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubmitStatus(editingService ? "Service updated!" : "Service created!");
        setTimeout(() => {
          closeModal();
          fetchServices();
        }, 1000);
      } else {
        setSubmitStatus(data.message || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      setSubmitStatus("An error occurred");
    }
  }

  async function handleDelete(serviceId: string) {
    try {
      const response = await fetch(`/api/services?id=${serviceId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (response.ok) {
        setDeleteConfirm(null);
        fetchServices();
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  }

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Services</h1>
                <p className="text-sm text-gray-500">Manage hotel services offered to guests</p>
              </div>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Service
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-gray-500">Loading services...</div>
              </div>
            ) : services.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <p className="text-gray-500">No services found</p>
                <button
                  onClick={openAddModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add your first service
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedServices).map(([category, categoryServices]) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons];
                  return (
                    <div key={category} className="rounded-xl border border-gray-200 bg-white">
                      <div className="border-b border-gray-100 p-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <h2 className="text-lg font-semibold capitalize text-gray-900">
                            {category}
                          </h2>
                          <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {categoryServices.length} services
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {categoryServices.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-4">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{service.name}</h3>
                              <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                              <p className="mt-2 text-sm font-semibold text-gray-900">
                                ₵{service.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(service)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              {deleteConfirm === service.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(service.id)}
                                    className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="rounded-lg bg-gray-200 p-2 text-gray-600 hover:bg-gray-300"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(service.id)}
                                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingService ? "Edit Service" : "Add New Service"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Service Name
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Airport Pickup"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Brief description of the service"
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Price (₵)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.price}</p>
                  )}
                </div>
                
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Service["category"] })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="transport">Transport</option>
                    <option value="spa">Spa & Wellness</option>
                    <option value="dining">Dining</option>
                    <option value="activities">Activities</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {editingService ? "Update" : "Create"} Service
                </button>
              </div>
              
              {submitStatus && (
                <p className={`text-center text-sm ${submitStatus.includes("!") ? "text-green-600" : "text-red-600"}`}>
                  {submitStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
