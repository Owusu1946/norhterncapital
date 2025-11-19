"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { DateRange } from "react-date-range";
import { format, differenceInDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface SleekDatePickerProps {
  checkInDate: string | null;
  checkOutDate: string | null;
  onDatesChange: (dates: { checkIn: string | null; checkOut: string | null }) => void;
  className?: string;
}

export function SleekDatePicker({ 
  checkInDate, 
  checkOutDate, 
  onDatesChange, 
  className = "" 
}: SleekDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'checkIn' | 'checkOut' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert string dates to Date objects for react-date-range
  const startDate = checkInDate ? new Date(checkInDate) : null;
  const endDate = checkOutDate ? new Date(checkOutDate) : null;

  // Calculate nights between dates
  const nights = startDate && endDate ? differenceInDays(endDate, startDate) : 0;

  // Format dates for display
  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return null;
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const checkInDisplay = formatDisplayDate(checkInDate);
  const checkOutDisplay = formatDisplayDate(checkOutDate);

  // Handle date range selection
  const handleDateRangeChange = (ranges: any) => {
    const range = ranges.selection;
    const newCheckIn = range.startDate ? format(range.startDate, "yyyy-MM-dd") : null;
    const newCheckOut = range.endDate ? format(range.endDate, "yyyy-MM-dd") : null;
    
    onDatesChange({
      checkIn: newCheckIn,
      checkOut: newCheckOut
    });

    // Auto-close when both dates are selected
    if (newCheckIn && newCheckOut && newCheckIn !== newCheckOut) {
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedInput(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Date Input Fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Check-in Field */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-black/70">Check-in</label>
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setFocusedInput('checkIn');
            }}
            className={`w-full rounded-2xl border px-3 py-2 text-xs text-left transition-all ${
              focusedInput === 'checkIn' || (isOpen && !focusedInput)
                ? "border-[#01a4ff] ring-2 ring-[#01a4ff]/20"
                : "border-black/10 hover:border-[#01a4ff]/50"
            } bg-white outline-none`}
          >
            <div className="flex items-center justify-between">
              <span className={checkInDisplay ? "text-black" : "text-black/40"}>
                {checkInDisplay || "Select date"}
              </span>
              <Calendar className="h-4 w-4 text-[#01a4ff]" />
            </div>
          </button>
        </div>

        {/* Check-out Field */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-black/70">Check-out</label>
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setFocusedInput('checkOut');
            }}
            className={`w-full rounded-2xl border px-3 py-2 text-xs text-left transition-all ${
              focusedInput === 'checkOut'
                ? "border-[#01a4ff] ring-2 ring-[#01a4ff]/20"
                : "border-black/10 hover:border-[#01a4ff]/50"
            } bg-white outline-none`}
          >
            <div className="flex items-center justify-between">
              <span className={checkOutDisplay ? "text-black" : "text-black/40"}>
                {checkOutDisplay || "Select date"}
              </span>
              <Calendar className="h-4 w-4 text-[#01a4ff]" />
            </div>
          </button>
        </div>
      </div>

      {/* Nights Display */}
      {nights > 0 && (
        <div className="mt-2 text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#01a4ff]/10 px-3 py-1 text-xs font-medium text-[#01a4ff]">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {nights} night{nights !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Enhanced Date Picker Dropdown */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-full max-w-xl overflow-hidden rounded-3xl border border-black/5 bg-white shadow-xl shadow-black/10">
          {/* Header */}
          <div className="border-b border-gray-100 bg-white px-5 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Select your dates</h3>
                <p className="text-sm text-gray-600">
                  {focusedInput === 'checkIn' 
                    ? "Choose your check-in date" 
                    : focusedInput === 'checkOut'
                    ? "Choose your check-out date"
                    : "Drag to select date range"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setFocusedInput(null);
                }}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-4 pt-3">
            <div className="sleek-date-picker">
              <DateRange
                onChange={handleDateRangeChange}
                moveRangeOnFirstSelection={false}
                ranges={[
                  {
                    key: "selection",
                    startDate: startDate || new Date(),
                    endDate: endDate || new Date(),
                  },
                ]}
                months={1}
                direction="horizontal"
                rangeColors={["#01a4ff"]}
                showDateDisplay={false}
                showMonthAndYearPickers={true}
                showPreview={true}
                minDate={new Date()}
                maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-gray-600">Quick select:</span>
              {[
                { label: "Tonight", nights: 1 },
                { label: "2 nights", nights: 2 },
                { label: "3 nights", nights: 3 },
                { label: "1 week", nights: 7 },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    const today = new Date();
                    const checkOut = new Date(today);
                    checkOut.setDate(today.getDate() + option.nights);
                    
                    onDatesChange({
                      checkIn: format(today, "yyyy-MM-dd"),
                      checkOut: format(checkOut, "yyyy-MM-dd")
                    });
                    
                    setTimeout(() => setIsOpen(false), 180);
                  }}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-[#01a4ff] hover:bg-[#01a4ff]/5 hover:text-[#01a4ff] transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .sleek-date-picker .rdrCalendarWrapper {
          background: transparent;
          border: none;
          font-family: inherit;
        }
        
        .sleek-date-picker .rdrMonth {
          width: 100%;
          padding: 0 8px 10px;
        }
        
        .sleek-date-picker .rdrMonthAndYearWrapper {
          background: transparent;
          border-bottom: 1px solid #f3f4f6;
          padding: 8px 0 10px;
        }
        
        .sleek-date-picker .rdrMonthAndYearPickers select {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 13px;
          color: #374151;
        }
        
        .sleek-date-picker .rdrWeekDays {
          padding: 0;
        }
        
        .sleek-date-picker .rdrWeekDay {
          color: #6b7280;
          font-weight: 500;
          font-size: 13px;
          padding: 10px 0;
        }
        
        .sleek-date-picker .rdrDays {
          padding: 0;
        }
        
        .sleek-date-picker .rdrDay {
          background: transparent;
          border: none;
        }
        
        .sleek-date-picker .rdrDayNumber {
          background: transparent;
          border: none;
          color: #374151;
          font-weight: 500;
          border-radius: 999px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .sleek-date-picker .rdrDayNumber:hover {
          background: #e5f4ff;
          color: #01a4ff;
        }
        
        .sleek-date-picker .rdrDayToday .rdrDayNumber {
          background: #f3f4f6;
          font-weight: 600;
        }
        
        .sleek-date-picker .rdrDayInRange .rdrDayNumber,
        .sleek-date-picker .rdrDayStartOfRange .rdrDayNumber,
        .sleek-date-picker .rdrDayEndOfRange .rdrDayNumber,
        .sleek-date-picker .rdrDayInPreview .rdrDayNumber,
        .sleek-date-picker .rdrDayStartPreview .rdrDayNumber,
        .sleek-date-picker .rdrDayEndPreview .rdrDayNumber {
          background: #01a4ff !important;
          color: #ffffff !important;
        }

        /* Ensure inner span doesn't keep default white background/border
           for selected/preview states so the chip looks fully blue */
        .sleek-date-picker .rdrDayInRange .rdrDayNumber span,
        .sleek-date-picker .rdrDayStartOfRange .rdrDayNumber span,
        .sleek-date-picker .rdrDayEndOfRange .rdrDayNumber span,
        .sleek-date-picker .rdrDayInPreview .rdrDayNumber span,
        .sleek-date-picker .rdrDayStartPreview .rdrDayNumber span,
        .sleek-date-picker .rdrDayEndPreview .rdrDayNumber span {
          background: transparent !important;
          border: none !important;
          color: #ffffff !important;
        }

        /* Remove library default rectangular range backgrounds so the
           highlight fits perfectly inside our circular chips */
        .sleek-date-picker .rdrInRange,
        .sleek-date-picker .rdrStartEdge,
        .sleek-date-picker .rdrEndEdge,
        .sleek-date-picker .rdrSelected,
        .sleek-date-picker .rdrDayInPreview,
        .sleek-date-picker .rdrDayStartPreview,
        .sleek-date-picker .rdrDayEndPreview {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* Hide the separate preview overlay element so only the blue
           circular chips are visible while dragging */
        .sleek-date-picker .rdrDayPreview {
          background: transparent !important;
          border: none !important;
        }

        /* Finally, make the drag overlay itself blue so the user sees
           a blue bar while dragging across days */
        .sleek-date-picker .rdrDayStartPreview,
        .sleek-date-picker .rdrDayInPreview,
        .sleek-date-picker .rdrDayEndPreview {
          background: #01a4ff !important;
          border-color: #01a4ff !important;
        }
        
        .sleek-date-picker .rdrDayDisabled .rdrDayNumber {
          background: transparent;
          color: #d1d5db;
          cursor: not-allowed;
        }
        
        .sleek-date-picker .rdrDayDisabled .rdrDayNumber:hover {
          background: transparent;
          color: #d1d5db;
        }
        
        .sleek-date-picker .rdrMonthPicker select,
        .sleek-date-picker .rdrYearPicker select {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 4px 8px;
          margin: 0 4px;
        }
        
        .sleek-date-picker .rdrNextPrevButton {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #6b7280;
          width: 32px;
          height: 32px;
        }
        
        .sleek-date-picker .rdrNextPrevButton:hover {
          border-color: #01a4ff;
          color: #01a4ff;
        }
      `}</style>
    </div>
  );
}
