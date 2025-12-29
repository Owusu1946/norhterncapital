"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { rooms } from "@/lib/rooms";
import { CheckCircle2, Clock3, LogOut, UserCircle2, FileSpreadsheet, Download, RefreshCw } from "lucide-react";
import { generateGuestsReport } from "@/lib/reportGenerator";

type GuestStatus = "upcoming" | "checked_in" | "checked_out";

type GuestFilter = "all" | GuestStatus;

interface GuestRow {
  id: string;
  bookingReference: string;
  fullName: string;
  email: string;
  phone: string;
  roomName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalGuests: number;
  numberOfRooms: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
  bookingStatus: string;
  bookingSource: string;
  specialRequests?: string;
  status: GuestStatus;
  createdAt: string;
}

function formatDateShort(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function calculateNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}


export default function GuestsPage() {
  const [filter, setFilter] = useState<GuestFilter>("all");
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch guests from API
  const fetchGuests = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/guests?filter=${filter}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        // Unauthorized - redirect to login
        console.log("Unauthorized access, redirecting to login...");
        router.push("/admin/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGuests(data.data.guests);
          setError(null);
        } else {
          setError(data.error || "Failed to load guests");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to fetch guests");
        console.error("Failed to fetch guests:", response.status);
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, router]);

  // Fetch guests on mount and when filter changes
  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGuests();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchGuests]);

  // Never show guests for bookings whose payment failed
  const filteredGuests = guests.filter((guest) => guest.paymentStatus !== "failed");

  const counts = filteredGuests.reduce(
    (acc, guest) => {
      acc.total += 1;
      acc[guest.status] += 1;
      return acc;
    },
    { total: 0, upcoming: 0, checked_in: 0, checked_out: 0 } as Record<
      "total" | GuestStatus,
      number
    >
  );

  async function setStatus(id: string, status: GuestStatus) {
    try {
      const response = await fetch("/api/admin/guests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookingId: id,
          status,
        }),
      });

      if (response.ok) {
        // Update local state immediately
        setGuests((prev) =>
          prev.map((guest) => (guest.id === id ? { ...guest, status } : guest))
        );
        
        // Refresh data to ensure sync
        setTimeout(() => fetchGuests(), 1000);
      } else {
        alert("Failed to update guest status");
      }
    } catch (error) {
      console.error("Error updating guest status:", error);
      alert("Failed to update guest status");
    }
  }

  function handleExport(format: "csv" | "excel") {
    generateGuestsReport(filteredGuests, format);
  }

  function renderStatusBadge(status: GuestStatus) {
    if (status === "checked_in") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Checked in
        </span>
      );
    }
    if (status === "checked_out") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
          <LogOut className="h-3 w-3" />
          Checked out
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        <Clock3 className="h-3 w-3" />
        Upcoming
      </span>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Guests</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage in-house, upcoming and checked-out guests.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRefreshing(true);
                    fetchGuests();
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 ${
                    refreshing ? 'animate-pulse' : ''
                  }`}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("excel")}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </button>
                <Link
                  href="/admin/guests/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
                >
                  <UserCircle2 className="h-4 w-4" />
                  <span>New guest</span>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-full px-3 py-1 font-medium ${
                    filter === "all"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({counts.total})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("checked_in")}
                  className={`rounded-full px-3 py-1 font-medium ${
                    filter === "checked_in"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  Checked in ({counts.checked_in})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("upcoming")}
                  className={`rounded-full px-3 py-1 font-medium ${
                    filter === "upcoming"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  Upcoming ({counts.upcoming})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("checked_out")}
                  className={`rounded-full px-3 py-1 font-medium ${
                    filter === "checked_out"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Checked out ({counts.checked_out})
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500">Guest</th>
                    <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500">Room</th>
                    <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500">Stay</th>
                    <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-400">
                        Loading guests...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center">
                        <div className="space-y-2">
                          <p className="text-sm text-red-600">{error}</p>
                          <button
                            onClick={() => {
                              setRefreshing(true);
                              fetchGuests();
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Try again
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-400">
                        No guests match this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => {
                      const nights = calculateNights(guest.checkIn, guest.checkOut);
                      return (
                        <tr
                          key={guest.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-700">
                                {guest.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {guest.fullName}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  {guest.bookingSource === "website" ? "Online booking" : guest.bookingSource === "walk_in" ? "Walk-in" : guest.bookingSource}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-gray-900">
                                Room {guest.roomNumber}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {guest.roomName}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            <div className="space-y-0.5">
                              <p className="text-[11px] text-gray-500">
                                {formatDateShort(guest.checkIn)} → {" "}
                                {formatDateShort(guest.checkOut)} ({nights} nights)
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {guest.adults} adults · {guest.children} children · {guest.numberOfRooms} room(s)
                              </p>
                              <p className="text-[11px] font-semibold text-blue-600">
                                ₵{guest.totalAmount.toLocaleString()}
                                {guest.paymentStatus === "paid" ? " (Paid)" : " (Pending)"}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {renderStatusBadge(guest.status)}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              {guest.status === "upcoming" && (
                                <button
                                  type="button"
                                  onClick={() => setStatus(guest.id, "checked_in")}
                                  className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-blue-700"
                                >
                                  Mark as checked in
                                </button>
                              )}
                              {guest.status === "checked_in" && (
                                <button
                                  type="button"
                                  onClick={() => setStatus(guest.id, "checked_out")}
                                  className="rounded-full border border-gray-300 px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                                >
                                  Mark as checked out
                                </button>
                              )}
                              {guest.status === "checked_out" && (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
                                  Stay completed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
