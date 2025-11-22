"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Download, Filter, CreditCard, Banknote, RefreshCcw, Search, FileSpreadsheet, Loader2 } from "lucide-react";
import { generatePaymentsReport } from "@/lib/reportGenerator";

 type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
 type PaymentMethod = "cash" | "card" | "mobile";

 interface PaymentRow {
  id: string;
  date: string;
  guestName: string;
  guestEmail: string;
  roomName: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: number;
  transactionReference: string;
  bookingReference: string;
  checkIn: string;
  checkOut: string;
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

 export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [methodFilter, setMethodFilter] = useState<"all" | PaymentMethod>("all");
  const [search, setSearch] = useState("");
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  // Fetch payments from API
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.append("paymentStatus", statusFilter);
      }

      if (methodFilter !== "all") {
        params.append("paymentMethod", methodFilter);
      }

      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      const response = await fetch(`/api/payments/all?${params.toString()}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPayments(data.data.payments);
        }
      } else {
        console.error("Failed to fetch payments");
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, methodFilter, debouncedSearch]);

  // Fetch payments when filters change
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = payments;

  const totals = useMemo(() => {
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const completed = filteredPayments.filter((p) => p.paymentStatus === "paid").length;
    const pending = filteredPayments.filter((p) => p.paymentStatus === "pending").length;
    const refunded = filteredPayments.filter((p) => p.paymentStatus === "refunded").length;
    return { totalAmount, completed, pending, refunded };
  }, [filteredPayments]);

  function handleExport(format: "csv" | "excel") {
    generatePaymentsReport(filteredPayments, format);
  }

  function handleExportCsv() {
    if (typeof window === "undefined") return;

    const header = "Date,Guest,Email,Room,Method,Status,Amount,Reference";
    const rows = filteredPayments.map((p) =>
      [
        new Date(p.date).toLocaleDateString(),
        p.guestName,
        p.guestEmail,
        p.roomName,
        p.paymentMethod,
        p.paymentStatus,
        p.amount,
        p.transactionReference,
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "northern-capital-payments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Payments</h1>
                <p className="mt-1 text-sm text-gray-500">
                  View payment activity, settlements and refunds.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                  <CreditCard className="h-3.5 w-3.5 text-gray-500" />
                  <span>
                    Total: <span className="font-semibold text-gray-900">₵{totals.totalAmount.toLocaleString()}</span>
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
                    placeholder="Search by id, name, method..."
                    className="w-44 rounded-full border border-gray-200 bg-white pl-7 pr-3 py-1 text-[11px] text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value as any)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile Money</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Completed payments</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{totals.completed}</p>
                <p className="mt-1 text-[11px] text-gray-500">For the selected filters</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Pending settlements</p>
                <p className="mt-1 text-2xl font-semibold text-amber-600">{totals.pending}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-600">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Awaiting confirmation
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Refunded</p>
                <p className="mt-1 text-2xl font-semibold text-rose-600">{totals.refunded}</p>
                <p className="mt-1 text-[11px] text-gray-500">Guests refunded in cash or MoMo</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {loading ? (
                <div className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Loading payments...</p>
                  </div>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-gray-400">
                  No payments found. {search && "Try adjusting your search."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-gray-700">
                    <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-medium text-gray-500">
                      <tr>
                        <th className="px-4 py-2 text-left">Date / time</th>
                        <th className="px-4 py-2 text-left">Guest</th>
                        <th className="px-4 py-2 text-left">Room</th>
                        <th className="px-4 py-2 text-left">Method</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                        <th className="px-4 py-2 text-right">Status / Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPayments.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-gray-50 transition-colors md:align-middle"
                        >
                          <td className="px-4 py-2.5 align-top">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-gray-900">
                                {formatDateHuman(p.date)}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {new Date(p.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 align-top">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-gray-900">{p.guestName}</p>
                              <p className="text-[11px] text-gray-500">{p.guestEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 align-top">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-gray-900">{p.roomName}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 align-top">
                            <div className="space-y-0.5">
                              <p className="text-[11px] font-medium text-gray-800 capitalize">
                                {p.paymentMethod === "mobile"
                                  ? "Mobile Money"
                                  : p.paymentMethod === "card"
                                  ? "Card"
                                  : "Cash"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 align-top text-right">
                            <div className="text-sm font-semibold text-blue-600">
                              ₵{p.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 align-top text-right">
                            <div className="text-[11px]">
                              <p
                                className={`inline-flex items-center justify-end gap-1 rounded-full px-2 py-0.5 font-medium ${
                                  p.paymentStatus === "paid"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : p.paymentStatus === "pending"
                                    ? "bg-amber-50 text-amber-700"
                                    : p.paymentStatus === "failed"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {p.paymentStatus === "paid"
                                  ? "Paid"
                                  : p.paymentStatus === "pending"
                                  ? "Pending"
                                  : p.paymentStatus === "failed"
                                  ? "Failed"
                                  : "Refunded"}
                              </p>
                              <p className="mt-1 text-[10px] text-gray-400">{p.transactionReference}</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
 }
