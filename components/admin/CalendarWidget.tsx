"use client";

import { useEffect, useMemo, useState } from "react";

interface CalendarBooking {
  id: string;
  roomName: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  totalGuests: number;
}

function normalizeDate(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isDateWithinStay(day: number, month: number, year: number, booking: CalendarBooking) {
  if (!booking.checkIn || !booking.checkOut) return false;
  const checkIn = normalizeDate(new Date(booking.checkIn));
  const checkOut = normalizeDate(new Date(booking.checkOut));
  const target = normalizeDate(new Date(year, month, day));
  return target >= checkIn && target < checkOut;
}

export function CalendarWidget() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];

  // September-style calendar grid (6x7) but we will treat 1–30 as current month days
  const dates = [
    [26, 27, 28, 29, 30, 31, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, 29],
    [30, 1, 2, 3, 4, 5, 6],
  ];

  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => normalizeDate(new Date()), []);
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();
  const selectedDayNumber = today.getDate() <= 30 ? today.getDate() : 30; // keep within 1–30 grid

  useEffect(() => {
    let isMounted = true;

    async function loadBookings() {
      try {
        const response = await fetch("/api/bookings/all?limit=500", {
          credentials: "include",
        });

        if (!response.ok) {
          if (isMounted) setBookings([]);
          return;
        }

        const json = await response.json();
        if (!json.success || !Array.isArray(json.data?.bookings)) {
          if (isMounted) setBookings([]);
          return;
        }

        const mapped: CalendarBooking[] = json.data.bookings.map((b: any) => ({
          id: b.id,
          roomName: b.roomName,
          roomNumber: b.roomNumber,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          totalGuests: b.totalGuests ?? b.adults + (b.children || 0),
        }));

        if (isMounted) setBookings(mapped);
      } catch (error) {
        console.error("Failed to load bookings for CalendarWidget:", error);
        if (isMounted) setBookings([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  const occupiedRoomsToday = useMemo(() => {
    const rooms = new Set(
      bookings
        .filter((b) =>
          isDateWithinStay(selectedDayNumber, currentMonthIndex, currentYear, b),
        )
        .map((b) => b.roomNumber || b.roomName),
    );
    return rooms.size;
  }, [bookings, currentMonthIndex, currentYear, selectedDayNumber]);

  const bookingsForSelectedDay = useMemo(
    () =>
      bookings.filter((b) =>
        isDateWithinStay(selectedDayNumber, currentMonthIndex, currentYear, b),
      ),
    [bookings, currentMonthIndex, currentYear, selectedDayNumber],
  );

  const monthLabel = useMemo(
    () =>
      today.toLocaleDateString("en-US", {
        month: "long",
      }),
    [today],
  );

  const selectedDateLabel = useMemo(
    () =>
      today.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
    [today],
  );

  const isCurrentMonth = (date: number) => date >= 1 && date <= 30;

  const isSelectedDay = (date: number, weekIndex: number) =>
    isCurrentMonth(date) && date === selectedDayNumber;

  const isInStayRange = (date: number, weekIndex: number) => {
    if (!isCurrentMonth(date)) return false;
    return bookings.some((b) =>
      isDateWithinStay(date, currentMonthIndex, currentYear, b),
    );
  };

  const isStayStart = (date: number, weekIndex: number) => {
    if (!isCurrentMonth(date)) return false;
    return bookings.some((b) => {
      const checkIn = normalizeDate(new Date(b.checkIn));
      return (
        checkIn.getFullYear() === currentYear &&
        checkIn.getMonth() === currentMonthIndex &&
        checkIn.getDate() === date
      );
    });
  };

  const isStayEnd = (date: number, weekIndex: number) => {
    if (!isCurrentMonth(date)) return false;
    return bookings.some((b) => {
      const checkOut = normalizeDate(new Date(b.checkOut));
      return (
        checkOut.getFullYear() === currentYear &&
        checkOut.getMonth() === currentMonthIndex &&
        checkOut.getDate() === date
      );
    });
  };

  const getCellClasses = (date: number, weekIndex: number) => {
    const base =
      "flex h-7 items-center justify-center text-[11px] cursor-pointer transition-colors";

    if (!isCurrentMonth(date)) {
      return `${base} text-gray-300`;
    }

    if (isSelectedDay(date, weekIndex)) {
      return `${base} rounded-lg bg-black text-white font-semibold`;
    }

    const inStay = isInStayRange(date, weekIndex);
    if (!inStay) {
      return `${base} text-gray-700 hover:bg-gray-50 rounded-lg`;
    }

    let classes = `${base} text-gray-700 bg-rose-100`;
    if (isStayStart(date, weekIndex)) {
      classes += " rounded-l-full";
    }
    if (isStayEnd(date, weekIndex)) {
      classes += " rounded-r-full";
    }
    return classes;
  };

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-600">Calendar</h3>

      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)] items-start">
        {/* Calendar column */}
        <div>
          <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
            <span className="text-sm font-medium text-gray-900">{monthLabel}</span>
            <span>
              {loading ? "--" : occupiedRoomsToday || 0} room
              {occupiedRoomsToday === 1 ? "" : "s"} occupied
            </span>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 text-[10px] font-medium text-gray-400 mb-2">
            {days.map((day, index) => (
              <div
                key={`${day}-${index}`}
                className="flex h-6 items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {dates.map((week, weekIndex) =>
              week.map((date, dateIndex) => (
                <div
                  key={`${weekIndex}-${dateIndex}`}
                  className={getCellClasses(date, weekIndex)}
                >
                  {date}
                </div>
              )),
            )}
          </div>
        </div>

        {/* Day detail column */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">{selectedDateLabel}</h4>
            <span className="text-xs text-gray-400">
              {loading ? "--" : occupiedRoomsToday || 0} room
              {occupiedRoomsToday === 1 ? "" : "s"} occupied
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {bookingsForSelectedDay.length === 0 && !loading && (
              <p className="text-xs text-gray-400">No stays for this day.</p>
            )}

            {bookingsForSelectedDay.slice(0, 3).map((booking, idx) => {
              const guestCount = booking.totalGuests || 1;
              const start = new Date(booking.checkIn).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              );
              const end = new Date(booking.checkOut).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              );

              const colorPalettes = [
                ["#fde68a", "#bfdbfe", "#fecaca"],
                ["#a5b4fc", "#bbf7d0"],
                ["#fecaca", "#fcd34d", "#bfdbfe", "#bbf7d0", "#a5b4fc"],
              ];

              const colors = colorPalettes[idx] || colorPalettes[0];

              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.roomNumber
                        ? `Room ${booking.roomNumber}`
                        : booking.roomName}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {colors.map((color, colorIdx) => (
                          <span
                            key={colorIdx}
                            className="h-6 w-6 rounded-full border-2 border-white"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-900">
                          {guestCount}
                        </span>{" "}
                        guest{guestCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {start} — {end}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button className="mt-4 text-[11px] font-semibold tracking-wide text-gray-400 hover:text-gray-500 transition-colors">
        October
      </button>
    </div>
  );
}
