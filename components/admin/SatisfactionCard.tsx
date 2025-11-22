"use client";

import { useEffect, useState } from "react";

interface SatisfactionStats {
  satisfaction: number;
  happy: number;
  neutral: number;
  sad: number;
}

export function SatisfactionCard() {
  const [stats, setStats] = useState<SatisfactionStats>({
    satisfaction: 0,
    happy: 0,
    neutral: 0,
    sad: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        const response = await fetch("/api/analytics?range=last_7_days", {
          credentials: "include",
        });

        if (!response.ok) {
          if (isMounted) setStats({ satisfaction: 0, happy: 0, neutral: 0, sad: 0 });
          return;
        }

        const json = await response.json();
        const analytics = json?.data?.analytics;
        const totals = analytics?.totals;

        if (!analytics || !totals) {
          if (isMounted) setStats({ satisfaction: 0, happy: 0, neutral: 0, sad: 0 });
          return;
        }

        const totalBookings: number = totals.totalBookings || 0;
        const paidBookings: number = totals.paidBookings || 0;
        const pendingBookings: number = totals.pendingBookings || 0;

        const satisfaction =
          totalBookings > 0 ? Math.round((paidBookings / totalBookings) * 100) : 0;

        const happy = paidBookings;
        const neutral = pendingBookings;
        const sad = Math.max(totalBookings - happy - neutral, 0);

        if (isMounted) {
          setStats({ satisfaction, happy, neutral, sad });
        }
      } catch (error) {
        console.error("Failed to load analytics for SatisfactionCard:", error);
        if (isMounted) setStats({ satisfaction: 0, happy: 0, neutral: 0, sad: 0 });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const trend = 0; // Placeholder trend; can be wired to a second range if needed
  const isPositive = trend >= 0;

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm flex flex-col">
      <div>
        <h3 className="text-xs font-medium text-gray-500">Satisfaction rate</h3>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-4xl font-semibold text-gray-900">
            {loading ? "--" : `${stats.satisfaction}%`}
          </span>
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              isPositive ? "text-emerald-500" : "text-red-500"
            }`}
          >
            <span className="leading-none text-[10px]">
              {isPositive ? "▲" : "▼"}
            </span>
            <span>{`${trend}%`}</span>
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">😊</span>
          <span className="text-xs font-medium text-gray-900">
            {loading ? "--" : stats.happy}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xl">🤔</span>
          <span className="text-xs font-medium text-gray-900">
            {loading ? "--" : stats.neutral}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xl">☹️</span>
          <span className="text-xs font-medium text-gray-900">
            {loading ? "--" : stats.sad}
          </span>
        </div>
      </div>
    </div>
  );
}
