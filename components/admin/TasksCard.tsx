"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  room: string;
  priority?: "vip" | "urgent";
  initials?: string;
}

interface ApiBookingForTasks {
  id: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalGuests: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  bookingSource: string;
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function TasksCard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        const response = await fetch("/api/bookings/all?limit=30", {
          credentials: "include",
        });

        if (!response.ok) {
          if (isMounted) setTasks([]);
          return;
        }

        const json = await response.json();
        const bookings: ApiBookingForTasks[] = json?.data?.bookings || [];

        if (!Array.isArray(bookings)) {
          if (isMounted) setTasks([]);
          return;
        }

        const now = new Date();
        now.setSeconds(0, 0);

        const upcomingCheckInTasks: Task[] = [];
        const checkoutCleaningTasks: Task[] = [];
        const vipArrivalTasks: Task[] = [];

        bookings
          .filter((b) => b.paymentStatus !== "failed")
          .forEach((b) => {
            const checkIn = new Date(b.checkIn);
            const checkOut = new Date(b.checkOut);

            // Normalize to date-only for comparisons
            const checkInMid = new Date(checkIn);
            checkInMid.setHours(0, 0, 0, 0);
            const checkOutMid = new Date(checkOut);
            checkOutMid.setHours(0, 0, 0, 0);
            const todayMid = new Date(now);
            todayMid.setHours(0, 0, 0, 0);

            const msInDay = 1000 * 60 * 60 * 24;
            const daysUntilCheckIn = Math.round((checkInMid.getTime() - todayMid.getTime()) / msInDay);
            const daysSinceCheckout = Math.round((todayMid.getTime() - checkOutMid.getTime()) / msInDay);

            const isUpcoming = b.bookingStatus === "confirmed" || b.bookingStatus === "pending";
            const isTodayCheckIn = daysUntilCheckIn === 0;
            const isTomorrowCheckIn = daysUntilCheckIn === 1;
            const isRecentCheckout = b.bookingStatus === "checked_out" && daysSinceCheckout === 0;

            // Task: prepare rooms for today's and tomorrow's arrivals
            if (isUpcoming && (isTodayCheckIn || isTomorrowCheckIn)) {
              upcomingCheckInTasks.push({
                id: `${b.id}-prep`,
                title: isTodayCheckIn
                  ? `Prepare room(s) for today's arrival: ${b.guestName}`
                  : `Prepare room(s) for tomorrow: ${b.guestName}`,
                room: b.roomName,
                priority: isTodayCheckIn ? "urgent" : undefined,
                initials: getInitials(b.guestName),
              });
            }

            // Task: clean rooms after recent checkout
            if (isRecentCheckout) {
              checkoutCleaningTasks.push({
                id: `${b.id}-clean`,
                title: "Clean and reset room after checkout",
                room: b.roomName,
                priority: "urgent",
                initials: getInitials(b.guestName),
              });
            }

            // Task: VIP-style attention for high-value or agent bookings
            const isHighValue = b.totalAmount >= 5000;
            const isAgentOrPhone = b.bookingSource === "agent" || b.bookingSource === "phone";
            if (isUpcoming && (isHighValue || isAgentOrPhone)) {
              vipArrivalTasks.push({
                id: `${b.id}-vip`,
                title: "Arrange special welcome for VIP arrival",
                room: b.roomName,
                priority: "vip",
                initials: getInitials(b.guestName),
              });
            }
          });

        const combined = [
          ...upcomingCheckInTasks,
          ...checkoutCleaningTasks,
          ...vipArrivalTasks,
        ];

        if (isMounted) setTasks(combined.slice(0, 5));
      } catch (error) {
        console.error("Failed to load tasks:", error);
        if (isMounted) setTasks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm flex flex-col">
      <h3 className="text-sm font-medium text-gray-600 mb-3">Urgent & vip tasks</h3>

      <div className="divide-y divide-gray-100">
        {loading && (
          <div className="py-2 text-[11px] text-gray-400">Loading tasks...</div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="py-2 text-[11px] text-gray-400">No urgent tasks right now.</div>
        )}

        {!loading && tasks.map((task, index) => (
          <div
            key={task.id}
            className={`flex items-center justify-between py-2 ${index === 0 ? "pt-0" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
              <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1">
                <span>{task.room}</span>
                {task.priority === "vip" && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                    vip
                  </span>
                )}
                {task.priority === "urgent" && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                    urgent
                  </span>
                )}
              </p>
            </div>

            <div className="ml-3 h-7 w-7 rounded-full bg-gradient-to-tr from-orange-300 to-pink-300 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-white">
                {task.initials}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-3 text-[11px] font-semibold tracking-wide text-gray-400 hover:text-gray-500 transition-colors">
        SEE ALL TASKS
      </button>
    </div>
  );
}
