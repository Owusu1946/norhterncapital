"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ChartPoint {
  month: string;
  value: number;
}

function getLastMonths(count: number): { key: string; label: string }[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", {
      month: "short",
    });
    months.push({ key, label });
  }

  return months;
}

export function BookingsChart() {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBookings() {
      try {
        // Fetch up to 500 latest bookings for aggregation
        const response = await fetch("/api/bookings/all?limit=500", {
          credentials: "include",
        });

        if (!response.ok) {
          if (isMounted) setData([]);
          return;
        }

        const json = await response.json();
        if (!json.success || !Array.isArray(json.data?.bookings)) {
          if (isMounted) setData([]);
          return;
        }

        const bookings: any[] = json.data.bookings;

        // Prepare month buckets for last 7 months
        const months = getLastMonths(7);
        const counts: Record<string, number> = {};
        months.forEach((m) => {
          counts[m.key] = 0;
        });

        bookings.forEach((b) => {
          const created = b.createdAt ? new Date(b.createdAt) : null;
          if (!created || Number.isNaN(created.getTime())) return;

          const key = `${created.getFullYear()}-${String(
            created.getMonth() + 1
          ).padStart(2, "0")}`;

          if (counts[key] !== undefined) {
            counts[key] += 1;
          }
        });

        const chartData: ChartPoint[] = months.map((m) => ({
          month: m.label,
          value: counts[m.key] ?? 0,
        }));

        if (isMounted) setData(chartData);
      } catch (error) {
        console.error("Failed to load bookings for BookingsChart:", error);
        if (isMounted) setData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm h-100">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-gray-800">Bookings</h3>
        <span className="text-[11px] text-gray-400">Last 7 months</span>
      </div>

      <div className="h-86">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              width={32}
            />
            <Tooltip
              cursor={{ stroke: "#01a4ff", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#01a4ff"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
