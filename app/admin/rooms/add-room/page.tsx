"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

interface RoomType {
  id: string;
  slug: string;
  name: string;
  pricePerNight: number;
  size: string;
  bedType: string;
  maxGuests: number;
  totalRooms: number;
  createdRooms: number;
  availableRooms: number;
}

interface CreatedRoom {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  roomTypeSlug: string;
  floor: number;
  status: string;
}

export default function AddRoomPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState("");
  const [createdRooms, setCreatedRooms] = useState<CreatedRoom[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch room types
  useEffect(() => {
    fetchRoomTypes();
    fetchRooms();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch("/api/room-types");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRoomTypes(data.data.roomTypes);
          if (data.data.roomTypes.length > 0 && !selectedRoomTypeId) {
            setSelectedRoomTypeId(data.data.roomTypes[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
      setStatus({ type: "error", text: "Failed to fetch room types" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCreatedRooms(data.data.rooms);
        }
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const trimmedNumber = roomNumber.trim();
    if (!selectedRoomTypeId || !trimmedNumber) {
      setStatus({ type: "error", text: "Select a room type and enter a room number." });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          roomNumber: trimmedNumber,
          roomTypeId: selectedRoomTypeId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ type: "success", text: `Room ${trimmedNumber} created successfully!` });
        setRoomNumber("");
        
        // Refresh data
        await fetchRoomTypes();
        await fetchRooms();
        
        // Show remaining capacity
        if (data.data.room) {
          const remaining = data.data.room.remainingCapacity;
          const total = data.data.room.totalCapacity;
          
          if (remaining === 0) {
            setStatus({ 
              type: "warning", 
              text: `Room ${trimmedNumber} created. Maximum capacity of ${total} rooms reached for this type!` 
            });
          } else {
            setStatus({ 
              type: "success", 
              text: `Room ${trimmedNumber} created. ${remaining} more room(s) can be added (${total - remaining}/${total} used).` 
            });
          }
        }
      } else {
        setStatus({ type: "error", text: data.message || "Failed to create room" });
      }
    } catch (error) {
      console.error("Error creating room:", error);
      setStatus({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const getSelectedType = () => roomTypes.find(rt => rt.id === selectedRoomTypeId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Add room</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a room type and assign a room number.
                </p>
              </div>
            </div>

            {/* Form */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading room types...</span>
                </div>
              ) : roomTypes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600">No room types available.</p>
                  <p className="text-xs text-gray-500 mt-1">Please create a room type first.</p>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3 md:items-end">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-medium text-gray-700">Room type</label>
                      <select
                        value={selectedRoomTypeId}
                        onChange={(event) => setSelectedRoomTypeId(event.target.value)}
                        disabled={saving}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      >
                        {roomTypes.map((roomType) => (
                          <option key={roomType.id} value={roomType.id}>
                            {roomType.name} ({roomType.createdRooms}/{roomType.totalRooms} rooms created)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Room number</label>
                      <input
                        value={roomNumber}
                        onChange={(event) => setRoomNumber(event.target.value)}
                        placeholder="e.g. 205"
                        disabled={saving}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving || (getSelectedType()?.createdRooms ?? 0) >= (getSelectedType()?.totalRooms ?? 0)}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Add room"
                      )}
                    </button>
                  </form>

                  {status && (
                    <div className={`mt-3 rounded-xl px-3 py-2 text-xs ${
                      status.type === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : status.type === "warning"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      <div className="flex items-center gap-2">
                        {status.type === "success" && <CheckCircle className="h-4 w-4" />}
                        {status.type === "warning" && <AlertTriangle className="h-4 w-4" />}
                        {status.text}
                      </div>
                    </div>
                  )}

                  {getSelectedType() && (
                    <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Selected type details
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {getSelectedType()!.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        ₵{getSelectedType()!.pricePerNight.toLocaleString()}/night · {getSelectedType()!.size} · {getSelectedType()!.bedType} · up to {getSelectedType()!.maxGuests} guests
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-gray-500">Room capacity:</span>
                          <span className={`text-xs font-medium ${
                            getSelectedType()!.createdRooms >= getSelectedType()!.totalRooms
                              ? "text-red-600"
                              : getSelectedType()!.createdRooms >= getSelectedType()!.totalRooms * 0.8
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}>
                            {getSelectedType()!.createdRooms} / {getSelectedType()!.totalRooms} rooms
                          </span>
                        </div>
                        {getSelectedType()!.createdRooms >= getSelectedType()!.totalRooms && (
                          <p className="mt-1 text-[11px] text-red-600 font-medium">
                            Maximum capacity reached! Cannot add more rooms of this type.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Created rooms preview */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">All Rooms</h2>
                <span className="text-[11px] text-gray-400">
                  {createdRooms.length} total rooms
                </span>
              </div>

              {createdRooms.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No rooms have been created yet. Add rooms using the form above.
                </p>
              ) : (
                <div className="space-y-3">
                  {createdRooms
                    .filter(room => !selectedRoomTypeId || room.roomTypeId === selectedRoomTypeId)
                    .map((item) => {
                      const roomType = roomTypes.find(rt => rt.id === item.roomTypeId);
                      if (!roomType) return null;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Room {item.roomNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.roomTypeName} · ₵{roomType.pricePerNight.toLocaleString()} / night
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              item.status === "available"
                                ? "bg-emerald-50 text-emerald-700"
                                : item.status === "occupied"
                                ? "bg-red-50 text-red-700"
                                : item.status === "maintenance"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {item.status === "occupied" ? "Booked" : item.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
