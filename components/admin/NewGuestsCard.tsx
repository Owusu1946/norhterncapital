"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

interface GuestsStats {
  thisMonth: number;
  lastMonth: number;
}

function calculateGrowth(stats: GuestsStats): number {
  const { thisMonth, lastMonth } = stats;
  if (lastMonth <= 0) {
    return thisMonth > 0 ? 100 : 0;
  }
  const diff = thisMonth - lastMonth;
  return (diff / lastMonth) * 100;
}

export function NewGuestsCard() {
  const [stats, setStats] = useState<GuestsStats>({ thisMonth: 0, lastMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadGuests() {
      try {
        const response = await fetch("/api/admin/guests?filter=all", {
          credentials: "include",
        });

        if (!response.ok) {
          if (isMounted) setStats({ thisMonth: 0, lastMonth: 0 });
          return;
        }

        const data = await response.json();

        if (!isMounted || !data.success || !Array.isArray(data.data?.guests)) {
          return;
        }

        const guests: any[] = data.data.guests;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const lastMonthDate = new Date(now);
        lastMonthDate.setMonth(thisMonth - 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        let thisMonthCount = 0;
        let lastMonthCount = 0;

        guests.forEach((g) => {
          const created = g.createdAt ? new Date(g.createdAt) : null;
          if (!created || Number.isNaN(created.getTime())) return;

          const m = created.getMonth();
          const y = created.getFullYear();

          if (m === thisMonth && y === thisYear) {
            thisMonthCount += 1;
          } else if (m === lastMonth && y === lastMonthYear) {
            lastMonthCount += 1;
          }
        });

        if (isMounted) {
          setStats({ thisMonth: thisMonthCount, lastMonth: lastMonthCount });
        }
      } catch (error) {
        console.error("Failed to load guests for NewGuestsCard:", error);
        if (isMounted) setStats({ thisMonth: 0, lastMonth: 0 });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadGuests();

    return () => {
      isMounted = false;
    };
  }, []);

  const growthRaw = calculateGrowth(stats);
  const growth = Number.isFinite(growthRaw) ? Math.round(growthRaw) : 0;
  const isPositive = growth >= 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Manage Bookings
        </h3>
      </div>
      
      <h3 className="text-sm font-medium text-gray-500 mb-3">New Guests</h3>
      
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-gray-900">
          {loading ? "--" : stats.thisMonth}
        </span>
        <span
          className={`flex items-center text-sm font-medium ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          {loading ? "--" : `${isPositive ? "+" : ""}${growth}%`}
        </span>
      </div>
      
      <p className="text-xs text-gray-400 mt-2">
        {loading
          ? "Loading guest statistics..."
          : `Last month: ${stats.lastMonth} guest${stats.lastMonth === 1 ? "" : "s"}`}
      </p>
    </div>
  );
}
