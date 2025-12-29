"use client";

import React, { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";

interface RoomType {
  id: string;
  name: string;
  pricePerNight: number;
  totalRooms: number;
  createdRooms: number;
  availableRooms: number;
}

interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  roomTypeSlug: string;
  status: string;
}

type StatusFilter = "all" | "available" | "occupied" | "maintenance";

export default function AllRoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchRoomTypes() {
      setLoadingTypes(true);
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
        setLoadingTypes(false);
      }
    }

    async function fetchRooms() {
      setLoadingRooms(true);
      try {
        const response = await fetch("/api/rooms");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRooms(data.data.rooms);
          }
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoadingRooms(false);
      }
    }

    fetchRoomTypes();
    fetchRooms();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">All rooms</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Overview of all room types and their current availability.
                </p>
              </div>
            </div>

            {/* Room types overview */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              {loadingTypes ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading rooms...</span>
                </div>
              ) : roomTypes.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No room types found. Create a room type to see it here.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {roomTypes.map((type) => {
                    const usage = `${type.createdRooms}/${type.totalRooms}`;
                    const remaining = Math.max(type.totalRooms - type.createdRooms, 0);
                    const capacityRatio = type.totalRooms > 0 ? type.createdRooms / type.totalRooms : 0;
                    const barColor =
                      capacityRatio >= 1
                        ? "bg-red-500"
                        : capacityRatio >= 0.8
                        ? "bg-amber-500"
                        : "bg-emerald-500";

                    return (
                      <div
                        key={type.id}
                        className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div>
                          <h2 className="text-sm font-semibold text-gray-900">{type.name}</h2>
                          <p className="mt-1 text-xs text-gray-500">
                            ₵{type.pricePerNight.toLocaleString()} / night
                          </p>

                          <div className="mt-3 space-y-2 text-xs text-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-gray-500">Total rooms</span>
                              <span className="font-medium text-gray-900">{type.totalRooms}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-gray-500">Created</span>
                              <span className="font-medium text-gray-900">{usage}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-gray-500">Available</span>
                              <span
                                className={`font-medium ${
                                  type.availableRooms > 0 ? "text-emerald-600" : "text-red-600"
                                }`}
                              >
                                {type.availableRooms}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                              <span>Capacity usage</span>
                              <span>{type.totalRooms > 0 ? Math.round(capacityRatio * 100) : 0}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${barColor}`}
                                style={{ width: `${Math.min(capacityRatio * 100, 100)}%` }}
                              />
                            </div>
                            {remaining <= 0 ? (
                              <p className="mt-1 text-[11px] font-medium text-red-600">
                                Maximum capacity reached for this room type.
                              </p>
                            ) : (
                              <p className="mt-1 text-[11px] text-gray-500">
                                {remaining} more room(s) can be created for this type.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Rooms list with filters */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Rooms</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    View all rooms and filter by availability or room type.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-gray-500">Availability:</span>
                    <div className="inline-flex rounded-full bg-gray-100 p-1">
                      {([
                        { label: "All", value: "all" },
                        { label: "Available", value: "available" },
                        { label: "Booked", value: "occupied" },
                        { label: "Maintenance", value: "maintenance" },
                      ] as { label: string; value: StatusFilter }[]).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setStatusFilter(option.value)}
                          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                            statusFilter === option.value
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-gray-500">Room type:</span>
                    <select
                      value={roomTypeFilter}
                      onChange={(event) => setRoomTypeFilter(event.target.value)}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-700 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="all">All types</option>
                      {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {loadingRooms ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="ml-2 text-xs text-gray-600">Loading rooms...</span>
                </div>
              ) : rooms.length === 0 ? (
                <p className="text-xs text-gray-500">No rooms found. Create rooms to see them here.</p>
              ) : (
                <div className="space-y-2">
                  {rooms
                    .filter((room) => {
                      if (statusFilter !== "all" && room.status !== statusFilter) return false;
                      if (roomTypeFilter !== "all" && room.roomTypeId !== roomTypeFilter) return false;
                      return true;
                    })
                    .sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber))
                    .map((room) => {
                      const roomType = roomTypes.find((type) => type.id === room.roomTypeId);
                      if (!roomType) return null;

                      return (
                        <div
                          key={room.id}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">Room {room.roomNumber}</p>
                            <p className="text-xs text-gray-500">
                              {room.roomTypeName} · ₵{roomType.pricePerNight.toLocaleString()} / night
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                room.status === "available"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : room.status === "occupied"
                                  ? "bg-red-50 text-red-700"
                                  : room.status === "maintenance"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {room.status === "occupied" ? "Booked" : room.status}
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
