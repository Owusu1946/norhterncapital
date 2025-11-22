"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { generateAnalyticsReport } from "@/lib/reportGenerator";

type RangePreset = "today" | "last_7_days" | "this_month";

const rangeLabels: Record<RangePreset, string> = {
  today: "Today",
  last_7_days: "Last 7 days",
  this_month: "This month",
};

interface RevenueData {
  label: string;
  date: string;
  revenue: number;
  adr: number;
  occupancy: number;
  bookings: number;
}

interface ChannelData {
  channel: string;
  revenue: number;
  nights: number;
  bookings: number;
}

interface AnalyticsData {
  range: string;
  totals: {
    totalRevenue: number;
    totalBookings: number;
    totalNights: number;
    avgDailyRate: number;
    todayRevenue: number;
    todayBookings: number;
    paidBookings: number;
    pendingBookings: number;
    avgOccupancy: number;
  };
  revenueSeries: RevenueData[];
  channels: ChannelData[];
}

type ReportType = "revenue" | "transactions" | "channels";

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangePreset>("last_7_days");
  const [reportType, setReportType] = useState<ReportType>("revenue");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${range}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data.analytics);
        }
      } else {
        console.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totals = useMemo(() => {
    if (!analytics) {
      return {
        totalRevenue: 0,
        totalAdr: 0,
        avgOcc: 0,
        todayRevenue: 0,
        todayOcc: 0,
      };
    }

    return {
      totalRevenue: analytics.totals.totalRevenue,
      totalAdr: analytics.totals.avgDailyRate,
      avgOcc: analytics.totals.avgOccupancy,
      todayRevenue: analytics.totals.todayRevenue,
      todayOcc: analytics.totals.avgOccupancy,
    };
  }, [analytics]);

  const revenueSeries = analytics?.revenueSeries || [];
  const channelBreakdown = analytics?.channels || [];

  const activeDate = useMemo(() => {
    if (selectedDate) return selectedDate;
    if (range === "today") {
      return new Date().toISOString().split("T")[0];
    }
    return null;
  }, [selectedDate, range]);

  const dayData = useMemo(
    () =>
      activeDate
        ? revenueSeries.find((d) => d.date === activeDate) || null
        : null,
    [activeDate, revenueSeries],
  );

  const dayLabel = useMemo(() => {
    if (!activeDate) return "today";
    try {
      return new Date(activeDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return activeDate;
    }
  }, [activeDate]);

  function handleExport(format: "csv" | "excel") {
    if (!analytics) return;
    
    const analyticsData = {
      totalRevenue: analytics.totals.totalRevenue,
      totalBookings: analytics.totals.totalBookings,
      occupancyRate: Math.round(analytics.totals.avgOccupancy * 100),
      averageDailyRate: analytics.totals.avgDailyRate,
      checkedIn: 0,
      upcoming: 0,
      totalGuests: 0,
    };
    generateAnalyticsReport(analyticsData, format);
  }

  function handleExportCsv() {
    if (typeof window === "undefined") return;

    const header = "Day,Revenue,ADR,Occupancy (%)";
    const rows = revenueSeries.map((d) =>
      `${d.label},${d.revenue},${d.adr},${Math.round(d.occupancy * 100)}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "northern-capital-analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const reportTypeLabel =
    reportType === "revenue"
      ? "Revenue summary"
      : reportType === "transactions"
      ? "Detailed transactions"
      : "Channel performance";

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Financial overview, performance and exportable reports.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                  <CalendarRange className="mr-1 h-3.5 w-3.5 text-gray-500" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(null);
                      setRange("today");
                    }}
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      range === "today"
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(null);
                      setRange("last_7_days");
                    }}
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      range === "last_7_days"
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Last 7 days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(null);
                      setRange("this_month");
                    }}
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      range === "this_month"
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    This month
                  </button>
                </div>

                {/* Date picker for specific day analytics */}
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <span className="hidden sm:inline text-gray-500">View day:</span>
                  <input
                    type="date"
                    value={selectedDate || ""}
                    onChange={(event) => {
                      const value = event.target.value || null;
                      setSelectedDate(value);
                    }}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {activeDate && !dayData && (
              <p className="text-[11px] text-red-500 mt-1">
                No bookings found for {dayLabel}. Try selecting another date or a
                different range.
              </p>
            )}

            {/* KPI cards */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">Loading analytics...</p>
                </div>
              </div>
            ) : (
              <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">
                  {activeDate ? "Selected day revenue" : "Today's revenue"}
                </p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  ₵{
                    (dayData?.revenue ?? totals.todayRevenue)
                      .toLocaleString()
                  }
                </p>
                <p className="mt-2 text-[11px] text-gray-500">
                  {activeDate && dayData
                    ? `${dayData.bookings} booking${dayData.bookings !== 1 ? "s" : ""} · ${dayLabel}`
                    : `${analytics?.totals.todayBookings || 0} booking${
                        analytics?.totals.todayBookings !== 1 ? "s" : ""
                      } today`}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Period revenue</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  ₵{totals.totalRevenue.toLocaleString()}
                </p>
                <p className="mt-2 text-[11px] text-gray-500">
                  Range: {rangeLabels[range]}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Avg. daily rate (ADR)</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  ₵{Math.round(totals.totalAdr).toLocaleString()}
                </p>
                <p className="mt-2 text-[11px] text-gray-500">
                  {analytics?.totals.totalNights || 0} total nights
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Occupancy</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {Math.round(totals.avgOcc * 100)}%
                </p>
                <p className="mt-2 text-[11px] text-gray-500">
                  {analytics?.totals.totalBookings || 0} total bookings
                </p>
              </div>
            </div>

            {/* Charts + channels */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-baseline justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Revenue trend</h2>
                    <p className="text-[11px] text-gray-500">
                      Daily room revenue for {rangeLabels[range].toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueSeries}
                      margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                      />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        width={40}
                      />
                      <Tooltip
                        cursor={{ stroke: "#01a4ff", strokeWidth: 1 }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E5E7EB",
                          fontSize: 12,
                        }}
                        formatter={(value: any) => [
                          `₵${Number(value).toLocaleString()}`,
                          "Revenue",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#01a4ff"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Revenue by channel
                  </h2>
                  <span className="text-[11px] text-gray-400">
                    {rangeLabels[range]}
                  </span>
                </div>
                <div className="space-y-2">
                  {channelBreakdown.map((row) => (
                    <div
                      key={row.channel}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {row.channel}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {row.nights} room nights
                        </p>
                      </div>
                      <p className="text-right text-[11px] font-semibold text-blue-600">
                        ₵{row.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </>
            )}

            {/* Reports / exports */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Reports & exports
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Generate financial reports and export CSV for accounting.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span>Report type:</span>
                  <select
                    value={reportType}
                    onChange={(event) =>
                      setReportType(event.target.value as ReportType)
                    }
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="revenue">Revenue summary</option>
                    <option value="transactions">Detailed transactions</option>
                    <option value="channels">Channel performance</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-600">
                <p>
                  Current preset:{" "}
                  <span className="font-medium text-gray-900">
                    {rangeLabels[range]}
                  </span>{" "}· {reportTypeLabel}
                </p>
                <div className="flex flex-wrap items-center gap-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
