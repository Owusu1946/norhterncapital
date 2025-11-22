"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2, Edit2, Trash2, AlertCircle } from "lucide-react";

interface RoomType {
  id: string;
  name: string;
  pricePerNight: number;
  totalRooms: number;
  createdRooms: number;
  availableRooms: number;
  maxAdults: number;
  maxChildren: number;
  isActive: boolean;
}

export default function RoomTypesPage() {
  const router = useRouter();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/room-types");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRoomTypes(data.data.roomTypes);
        }
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (roomTypeId: string) => {
    router.push(`/admin/rooms/add-room-type/edit/${roomTypeId}`);
  };

  const handleDeleteConfirm = (roomTypeId: string) => {
    setShowDeleteConfirm(roomTypeId);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  const handleDelete = async (roomTypeId: string) => {
    setDeleting(roomTypeId);
    setShowDeleteConfirm(null);
    
    try {
      const response = await fetch(`/api/room-types/${roomTypeId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (response.ok) {
        // Refresh the list
        await fetchRoomTypes();
      } else {
        console.error("Failed to delete room type");
      }
    } catch (error) {
      console.error("Error deleting room type:", error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl">
            {/* Header + primary action */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Room types
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage the different room types available in your property.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => router.push("/admin/rooms/add-room-type/new")}
              >
                Add new
              </button>
            </div>

            {/* Room types table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Loading room types...</p>
                  </div>
                </div>
              ) : roomTypes.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm text-gray-600">No room types yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Click "Add new" to create one.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Price/Night
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Rooms
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Available
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Capacity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white text-sm">
                    {roomTypes.map((roomType) => (
                      <tr key={roomType.id} className="hover:bg-gray-50/80">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                          {roomType.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          ₵{roomType.pricePerNight.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {roomType.totalRooms}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          <span className={`font-medium ${
                            roomType.createdRooms < roomType.totalRooms
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}>
                            {roomType.createdRooms}
                          </span>
                          <span className="text-gray-400">/{roomType.totalRooms}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          <span className={`font-medium ${
                            roomType.availableRooms > 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}>
                            {roomType.availableRooms}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {roomType.maxAdults}A + {roomType.maxChildren}C
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              roomType.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {roomType.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEdit(roomType.id)}
                            className="mr-3 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            disabled={deleting === roomType.id}
                          >
                            <Edit2 className="h-4 w-4 inline" />
                          </button>
                          <button 
                            onClick={() => handleDeleteConfirm(roomType.id)}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            disabled={deleting === roomType.id}
                          >
                            {deleting === roomType.id ? (
                              <Loader2 className="h-4 w-4 inline animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 inline" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <h3 className="text-lg font-semibold">Confirm Delete</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete this room type? This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleDeleteCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(showDeleteConfirm)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

