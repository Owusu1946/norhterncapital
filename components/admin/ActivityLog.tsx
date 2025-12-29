"use client";

import { useEffect, useState } from "react";

interface Activity {
  id: string;
  room: string;
  guest: string;
  action: string;
  time: string;
}

interface ApiBookingActivity {
  id: string;
  guestName: string;
  roomName: string;
  bookingStatus: string;
  createdAt: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) return "just now";

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;

  const days = Math.floor(hours / 24);
  return `${days} d`;
}

function mapStatusToAction(status: string): string {
  if (status === "checked_in") return "Guest checked in";
  if (status === "checked_out") return "Guest checked out";
  if (status === "cancelled") return "Booking cancelled";
  if (status === "confirmed") return "Booking confirmed";
  return "Booking updated";
}

export function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadActivity() {
      try {
        const response = await fetch("/api/bookings/all?limit=10", {
          credentials: "include",
        });

        if (!response.ok) {
          if (isMounted) setActivities([]);
          return;
        }

        const json = await response.json();
        const apiBookings: ApiBookingActivity[] = json?.data?.bookings || [];

        if (!Array.isArray(apiBookings)) {
          if (isMounted) setActivities([]);
          return;
        }

        const mapped: Activity[] = apiBookings.map((b) => ({
          id: b.id,
          room: b.roomName,
          guest: b.guestName,
          action: mapStatusToAction(b.bookingStatus),
          time: formatTimeAgo(b.createdAt),
        }));

        if (isMounted) setActivities(mapped);
      } catch (error) {
        console.error("Failed to load activity log:", error);
        if (isMounted) setActivities([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Activity Log</h3>
      
      <div className="space-y-3">
        {loading && (
          <p className="text-[11px] text-gray-400">Loading recent activity...</p>
        )}

        {!loading && activities.length === 0 && (
          <p className="text-[11px] text-gray-400">No recent activity.</p>
        )}

        {!loading && activities.slice(0, 3).map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div>
              <p className="text-xs font-medium text-gray-900">{activity.room}</p>
              {activity.guest && (
                <p className="text-xs text-red-500 font-medium">
                  Guest: {activity.guest}
                </p>
              )}
              <p className="text-xs text-gray-600">{activity.action}</p>
            </div>
            <span className="text-[10px] text-gray-400 ml-auto whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}

        {!loading && activities.length > 3 && (
          <div className="pt-2 border-t border-gray-100 flex justify-end">
            <a
              href="/admin/bookings"
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              View all
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
