"use client";

import { type ReactNode, useState } from "react";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  BedDouble,
  User2,
} from "lucide-react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export type RoomCategory =
  | "Standard Room"
  | "Deluxe Room"
  | "Suite"
  | "Family Room"

export interface GuestAndRoomSelection {
  adults: number;
  children: number;
  rooms: number;
}

export interface BookingCardProps {
  defaultRoomType?: string;
  selectedRoomCategory: RoomCategory;
  onRoomCategoryChange: (category: RoomCategory) => void;
  guestAndRoomSelection: GuestAndRoomSelection;
  onGuestAndRoomChange: (selection: GuestAndRoomSelection) => void;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  onDatesChange: (dates: { checkIn: Date | null; checkOut: Date | null }) => void;
  availableCategories: RoomCategory[];
  onSearch: () => void;
}

export function BookingCard({
  defaultRoomType = "Select room type",
  selectedRoomCategory,
  onRoomCategoryChange,
  guestAndRoomSelection,
  onGuestAndRoomChange,
  checkInDate,
  checkOutDate,
  onDatesChange,
  availableCategories,
  onSearch,
}: BookingCardProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  const totalAdults = guestAndRoomSelection.adults;
  const totalChildren = guestAndRoomSelection.children;

  const guestParts: string[] = [];
  if (totalAdults > 0) {
    guestParts.push(`${totalAdults} adult${totalAdults > 1 ? "s" : ""}`);
  }
  if (totalChildren > 0) {
    guestParts.push(
      `${totalChildren} child${totalChildren > 1 ? "ren" : ""}`,
    );
  }

  const guestLabel = guestParts.join(", ") || "Add guests";
  const roomsLabel = `${guestAndRoomSelection.rooms} room${
    guestAndRoomSelection.rooms > 1 ? "s" : ""
  }`;

  const guestSummary = `${guestLabel} · ${roomsLabel}`;

  const hasBothDates = Boolean(checkInDate && checkOutDate);
  const datesSummary = hasBothDates
    ? `${format(checkInDate as Date, "MMM d")} · ${format(
        checkOutDate as Date,
        "MMM d",
      )}`
    : "Add dates";

  return (
    <section
      aria-label="Search stays"
      className="rounded-3xl border border-black/5 bg-white p-4 text-black shadow-xl shadow-black/10 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:gap-6">
        <Field
          label="Room Type"
          description={selectedRoomCategory ?? defaultRoomType}
          icon={<BedDouble className="h-4 w-4" />}
        />

        <InteractiveField
          label="Check-in and Check-out Date"
          description={datesSummary}
          icon={<Calendar className="h-4 w-4" />}
          isOpen={isDatePickerOpen}
          onToggle={() => setIsDatePickerOpen((open) => !open)}
        >
          <div className="max-h-[340px] overflow-auto sm:max-h-none">
            <DateRange
              onChange={(ranges) => {
                const range = ranges.selection;
                onDatesChange({
                  checkIn: range.startDate ?? null,
                  checkOut: range.endDate ?? null,
                });
              }}
              moveRangeOnFirstSelection={false}
              ranges={[
                {
                  key: "selection",
                  startDate: checkInDate ?? new Date(),
                  endDate: checkOutDate ?? new Date(),
                },
              ]}
              months={1}
              direction="horizontal"
              rangeColors={["#01a4ff"]}
              showDateDisplay={false}
            />
          </div>
        </InteractiveField>

        <InteractiveField
          label="Guests and Rooms"
          description={guestSummary}
          icon={<User2 className="h-4 w-4" />}
          isOpen={isGuestsOpen}
          onToggle={() => setIsGuestsOpen((open) => !open)}
        >
          <GuestControls
            selection={guestAndRoomSelection}
            onChange={onGuestAndRoomChange}
          />
        </InteractiveField>

        <div className="flex items-end md:ml-auto">
          <button
            type="button"
            onClick={onSearch}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#01a4ff] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0084cc] md:w-auto"
          >
            Search
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm sm:gap-3">
        <span className="font-medium text-black/60">Filter:</span>
        {availableCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onRoomCategoryChange(category)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              selectedRoomCategory === category
                ? "border-[#01a4ff] bg-[#01a4ff] text-white shadow-sm"
                : "border-black/10 bg-white text-black/70 hover:border-[#01a4ff]/40 hover:text-black"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  description: string;
  icon: ReactNode;
}

function Field({ label, description, icon }: FieldProps) {
  return (
    <div className="w-full md:flex-1 md:min-w-[210px]">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/60">
        <span>{label}</span>
      </p>
      <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-black/70">
          <span>{icon}</span>
          <span>{description}</span>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#01a4ff]/10 text-[#01a4ff]">
          <ChevronDown className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

interface InteractiveFieldProps extends FieldProps {
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function InteractiveField({
  label,
  description,
  icon,
  isOpen,
  onToggle,
  children,
}: InteractiveFieldProps) {
  return (
    <div className="relative w-full md:flex-1 md:min-w-[210px]">
      <button
        type="button"
        className="w-full text-left"
        onClick={onToggle}
      >
        <Field label={label} description={description} icon={icon} />
      </button>
      {isOpen ? (
        <div className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border border-[#01a4ff]/15 bg-white p-4 shadow-xl shadow-black/10">
          {children}
        </div>
      ) : null}
    </div>
  );
}

interface GuestControlsProps {
  selection: GuestAndRoomSelection;
  onChange: (selection: GuestAndRoomSelection) => void;
}

function GuestControls({ selection, onChange }: GuestControlsProps) {
  function update(partial: Partial<GuestAndRoomSelection>) {
    onChange({ ...selection, ...partial });
  }

  return (
    <div className="space-y-3 text-sm text-black">
      <GuestRow
        label="Adults"
        value={selection.adults}
        min={1}
        onChange={(value) => update({ adults: value })}
      />
      <GuestRow
        label="Children"
        value={selection.children}
        min={0}
        onChange={(value) => update({ children: value })}
      />
      <GuestRow
        label="Rooms"
        value={selection.rooms}
        min={1}
        onChange={(value) => update({ rooms: value })}
      />
    </div>
  );
}

interface GuestRowProps {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}

function GuestRow({ label, value, min, onChange }: GuestRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-sm text-black/70 disabled:opacity-40"
          disabled={value <= min}
        >
          -
        </button>
        <span className="w-6 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#01a4ff] bg-[#01a4ff] text-sm text-white"
        >
          +
        </button>
      </div>
    </div>
  );
}
