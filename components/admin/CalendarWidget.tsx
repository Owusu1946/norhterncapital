"use client";

import { useEffect, useMemo, useState } from "react";

interface CalendarBooking {
  id: string;
  roomName: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  totalGuests: number;
  bookingStatus: string;
  paymentStatus?: string;
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

// Build a real 6x7 calendar grid for the given month/year
function buildCalendarGrid(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // How many days from the previous month we need to show in the first week
  const prevMonthDays = startDay;
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const grid: Date[][] = [];
  let currentDay = 1;
  let nextMonthDay = 1;

  for (let week = 0; week < 6; week++) {
    const row: Date[] = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      const cellIndex = week * 7 + weekday;
      let cellDate: Date;

      if (cellIndex < prevMonthDays) {
        // Days from previous month
        const dayNumber = daysInPrevMonth - prevMonthDays + 1 + cellIndex;
        cellDate = new Date(year, month - 1, dayNumber);
      } else if (currentDay <= daysInMonth) {
        // Current month
        cellDate = new Date(year, month, currentDay);
        currentDay++;
      } else {
        // Next month
        cellDate = new Date(year, month + 1, nextMonthDay);
        nextMonthDay++;
      }

      cellDate = normalizeDate(cellDate);
      row.push(cellDate);
    }
    grid.push(row);
  }

  return grid;
}

export function CalendarWidget() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];

  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => normalizeDate(new Date()), []);
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();
  const selectedDayNumber = today.getDate();

  const calendarGrid = useMemo(
    () => buildCalendarGrid(currentYear, currentMonthIndex),
    [currentYear, currentMonthIndex],
  );

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
          bookingStatus: b.bookingStatus,
          paymentStatus: b.paymentStatus,
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

  // Consider only real active bookings when showing occupancy
  const activeBookings = useMemo(
    () =>
      bookings.filter((b) =>
        (b.bookingStatus === "confirmed" || b.bookingStatus === "checked_in") &&
        b.paymentStatus !== "failed" &&
        b.paymentStatus !== "refunded",
      ),
    [bookings],
  );

  const occupiedRoomsToday = useMemo(() => {
    const rooms = new Set(
      activeBookings
        .filter((b) =>
          isDateWithinStay(selectedDayNumber, currentMonthIndex, currentYear, b),
        )
        .map((b) => b.roomNumber || b.roomName),
    );
    return rooms.size;
  }, [activeBookings, currentMonthIndex, currentYear, selectedDayNumber]);

  const bookingsForSelectedDay = useMemo(
    () =>
      activeBookings.filter((b) =>
        isDateWithinStay(selectedDayNumber, currentMonthIndex, currentYear, b),
      ),
    [activeBookings, currentMonthIndex, currentYear, selectedDayNumber],
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

  const isCurrentMonth = (date: Date) =>
    date.getFullYear() === currentYear && date.getMonth() === currentMonthIndex;

  const isSelectedDay = (date: Date, weekIndex: number) =>
    isCurrentMonth(date) && date.getDate() === selectedDayNumber;

  const isInStayRange = (date: Date, weekIndex: number) => {
    if (!isCurrentMonth(date)) return false;
    return activeBookings.some((b) =>
      isDateWithinStay(date.getDate(), currentMonthIndex, currentYear, b),
    );
  };

  const isStayStart = (date: Date, weekIndex: number) => {
    if (!isCurrentMonth(date)) return false;
    return activeBookings.some((b) => {
      const checkIn = normalizeDate(new Date(b.checkIn));
      return (
        checkIn.getFullYear() === currentYear &&
        checkIn.getMonth() === currentMonthIndex &&
        checkIn.getDate() === date.getDate()
      );
    });
  };

  const isStayEnd = (date: Date, weekIndex: number) => {
    if (!isCurrentMonth(date)) return false;
    return activeBookings.some((b) => {
      const checkOut = normalizeDate(new Date(b.checkOut));
      return (
        checkOut.getFullYear() === currentYear &&
        checkOut.getMonth() === currentMonthIndex &&
        checkOut.getDate() === date.getDate()
      );
    });
  };

  const getCellClasses = (date: Date, weekIndex: number) => {
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
            {calendarGrid.map((week, weekIndex) =>
              week.map((date, dateIndex) => (
                <div
                  key={`${weekIndex}-${dateIndex}`}
                  className={getCellClasses(date, weekIndex)}
                >
                  {date.getDate()}
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
