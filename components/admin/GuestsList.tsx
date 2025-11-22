"use client";

import React, { useEffect, useState } from "react";

interface ApiGuest {
  id: string;
  fullName: string;
  checkIn: string;
  checkOut: string;
  status: "upcoming" | "checked_in" | "checked_out";
}

function formatInitials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function calculateNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function GuestsList() {
  const [guests, setGuests] = useState<ApiGuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadGuests() {
      try {
        const response = await fetch("/api/admin/guests?filter=checked_in", {
          credentials: "include",
        });

        if (!response.ok) {
          // Fallback: don't break the dashboard, just show empty state
          setGuests([]);
          return;
        }

        const data = await response.json();
        if (isMounted && data.success && Array.isArray(data.data?.guests)) {
          // Take only a few recent/active guests for this compact widget
          const mapped: ApiGuest[] = data.data.guests
            .slice(0, 5)
            .map((g: any) => ({
              id: g.id,
              fullName: g.fullName,
              checkIn: g.checkIn,
              checkOut: g.checkOut,
              status: g.status,
            }));
          setGuests(mapped);
        }
      } catch (error) {
        console.error("Failed to load guests for GuestsList:", error);
        if (isMounted) setGuests([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadGuests();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="space-y-3">
        {loading ? (
          <p className="text-xs text-gray-400">Loading guests...</p>
        ) : guests.length === 0 ? (
          <p className="text-xs text-gray-400">No in-house guests right now.</p>
        ) : (
          guests.map((guest) => {
            const nights = calculateNights(guest.checkIn, guest.checkOut);
            const stayLabel =
              guest.status === "checked_in"
                ? `${nights} night${nights === 1 ? "" : "s"}`
                : guest.status === "upcoming"
                ? "Arriving soon"
                : "Checked out";

            return (
              <div
                key={guest.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {formatInitials(guest.fullName)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {guest.fullName || "Walk-in guest"}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{stayLabel}</span>
              </div>
            );
          })
        )}
      </div>

      <button className="mt-4 text-xs text-blue-500 hover:text-blue-600 transition-colors">
        SEE ALL GUESTS
      </button>
    </div>
  );
}
