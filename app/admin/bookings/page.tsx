"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Filter, Search, Calendar, Download, BedDouble, FileSpreadsheet, Loader2, MoreVertical, Check } from "lucide-react";
import { generateBookingsReport } from "@/lib/reportGenerator";

type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
type BookingSource = "website" | "walk_in" | "agent" | "phone";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface BookingRow {
  id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalGuests: number;
  numberOfRooms: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  bookingStatus: BookingStatus;
  bookingSource: BookingSource;
  createdAt: string;
}

// Debounce helper for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function formatDateHuman(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);
  
  const itemsPerPage = 50;

  // Fetch bookings from API (super fast with indexes)
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (paymentFilter !== "all") {
        params.append("paymentStatus", paymentFilter);
      }

      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      const response = await fetch(`/api/bookings/all?${params.toString()}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookings(data.data.bookings);
          setTotalCount(data.data.pagination.total);
        }
      } else {
        console.error("Failed to fetch bookings");
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, paymentFilter, debouncedSearch]);

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentFilter, debouncedSearch]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Never show bookings whose payment failed
  const filteredBookings = bookings.filter((b) => b.paymentStatus !== "failed");

  const totals = useMemo(() => {
    const totalAmount = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const confirmed = filteredBookings.filter((b) => b.bookingStatus === "confirmed").length;
    const pending = filteredBookings.filter((b) => b.bookingStatus === "pending").length;
    const cancelled = filteredBookings.filter((b) => b.bookingStatus === "cancelled").length;
    return { totalAmount, confirmed, pending, cancelled };
  }, [filteredBookings]);

  function handleExport(format: "csv" | "excel") {
    generateBookingsReport(filteredBookings, format);
  }

  async function updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
    setUpdatingStatus(bookingId);
    setOpenDropdown(null);

    try {
      const response = await fetch("/api/bookings/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookingId,
          bookingStatus: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state immediately for instant UI feedback
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, bookingStatus: newStatus }
              : booking
          )
        );
        
        console.log("✅ Booking status updated successfully");
      } else {
        console.error("Failed to update booking status:", data.error);
        alert("Failed to update booking status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
                <p className="mt-1 text-sm text-gray-500">
                  See all reservations from the website, walk-ins and agents.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  <span>
                    Total: <span className="font-semibold text-gray-900">{filteredBookings.length}</span> bookings
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleExport("excel")}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 font-medium text-white shadow-sm hover:bg-emerald-700"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Excel
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-[11px] text-gray-600">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium text-gray-700">Filters</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by id, name, room..."
                    className="w-48 rounded-full border border-gray-200 bg-white pl-7 pr-3 py-1 text-[11px] text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Payment Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Confirmed bookings</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{totals.confirmed}</p>
                <p className="mt-1 text-[11px] text-gray-500">For the selected filters</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Pending arrivals</p>
                <p className="mt-1 text-2xl font-semibold text-amber-600">{totals.pending}</p>
                <p className="mt-1 text-[11px] text-amber-600">Waiting for confirmation / check-in</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Cancelled</p>
                <p className="mt-1 text-2xl font-semibold text-rose-600">{totals.cancelled}</p>
                <p className="mt-1 text-[11px] text-gray-500">Guests who cancelled or no-showed</p>
              </div>
            </div>

            <div className="overflow-visible rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500">Date / stay</th>
                    <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500">Guest</th>
                    <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500">Room</th>
                    <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500">Source</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium text-gray-500">Status / Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <p className="text-sm text-gray-600">Loading bookings...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-xs text-gray-400">
                        No bookings found. {search && "Try adjusting your search."}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-xs text-gray-700">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDateHuman(b.checkIn)}
                            </p>
                            <p className="text-[11px] text-gray-500">{b.nights} night{b.nights > 1 ? "s" : ""} • {b.numberOfRooms} room{b.numberOfRooms > 1 ? "s" : ""}</p>
                          </div>
                        </td>

                        <td className="px-4 py-2.5 text-xs text-gray-700">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-900">{b.guestName}</p>
                            <p className="text-[11px] text-gray-500">{b.guestEmail}</p>
                          </div>
                        </td>

                        <td className="px-4 py-2.5 text-xs text-gray-700">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-900">{b.roomName}</p>
                            <p className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                              <BedDouble className="h-3 w-3" /> {b.adults} adult{b.adults > 1 ? "s" : ""}{b.children > 0 && `, ${b.children} child${b.children > 1 ? "ren" : ""}`}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-2.5 text-xs text-gray-700">
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-medium text-gray-800 capitalize">
                              {b.bookingSource === "walk_in"
                                ? "Walk-in"
                                : b.bookingSource === "website"
                                ? "Website"
                                : b.bookingSource === "agent"
                                ? "Agent"
                                : "Phone"}
                            </p>
                            <p className="text-[11px] text-gray-500">{b.paymentMethod === "card" ? "Card" : b.paymentMethod === "mobile" ? "Mobile Money" : "Cash"}</p>
                          </div>
                        </td>

                        <td className="px-4 py-2.5 text-right text-sm font-semibold text-blue-600">
                          ₵{b.totalAmount.toLocaleString()}
                        </td>

                        <td className="px-4 py-2.5 text-right text-[11px]">
                          <div className="flex flex-col items-end gap-1">
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === b.id ? null : b.id)}
                                disabled={updatingStatus === b.id}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium transition-all hover:opacity-80 ${
                                  b.bookingStatus === "confirmed"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : b.bookingStatus === "pending"
                                    ? "bg-amber-50 text-amber-700"
                                    : b.bookingStatus === "checked_in"
                                    ? "bg-blue-50 text-blue-700"
                                    : b.bookingStatus === "checked_out"
                                    ? "bg-gray-50 text-gray-700"
                                    : "bg-rose-50 text-rose-700"
                                } ${updatingStatus === b.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                {updatingStatus === b.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    {b.bookingStatus === "confirmed"
                                      ? "Confirmed"
                                      : b.bookingStatus === "pending"
                                      ? "Pending"
                                      : b.bookingStatus === "checked_in"
                                      ? "Checked In"
                                      : b.bookingStatus === "checked_out"
                                      ? "Checked Out"
                                      : "Cancelled"}
                                    <MoreVertical className="h-3 w-3" />
                                  </>
                                )}
                              </button>

                              {/* Dropdown Menu */}
                              {openDropdown === b.id && (
                                <>
                                  {/* Backdrop */}
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setOpenDropdown(null)}
                                  />
                                  
                                  {/* Menu */}
                                  <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                    {[
                                      { value: "pending", label: "Pending", color: "text-amber-700" },
                                      { value: "confirmed", label: "Confirmed", color: "text-emerald-700" },
                                      { value: "checked_in", label: "Checked In", color: "text-blue-700" },
                                      { value: "checked_out", label: "Checked Out", color: "text-gray-700" },
                                      { value: "cancelled", label: "Cancelled", color: "text-rose-700" },
                                    ].map((status) => (
                                      <button
                                        key={status.value}
                                        onClick={() => updateBookingStatus(b.id, status.value as BookingStatus)}
                                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-gray-50 ${status.color}`}
                                      >
                                        <span>{status.label}</span>
                                        {b.bookingStatus === status.value && (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">{b.bookingReference}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3">
                <div className="text-xs text-gray-600">
                  Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                  <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{" "}
                  <span className="font-semibold">{totalCount}</span> bookings
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={loading}
                          className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
