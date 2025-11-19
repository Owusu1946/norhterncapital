"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  BedDouble,
  User2,
  CheckCircle,
  Users,
  Wifi,
  Coffee,
  Tv,
  X,
} from "lucide-react";
import { DateRange } from "react-date-range";
import { format, differenceInDays } from "date-fns";
import Image from "next/image";
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

export interface AvailableRoom {
  id: string;
  name: string;
  category: RoomCategory;
  image: string;
  price: number;
  available: number;
  maxGuests: number;
  amenities: string[];
  description: string;
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
  const router = useRouter();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isRoomTypeOpen, setIsRoomTypeOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<AvailableRoom[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
        setIsGuestsOpen(false);
        setIsRoomTypeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdowns on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDatePickerOpen(false);
        setIsGuestsOpen(false);
        setIsRoomTypeOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

  // Check if all required fields are filled
  const isSearchEnabled = Boolean(
    selectedRoomCategory && 
    checkInDate && 
    checkOutDate && 
    guestAndRoomSelection.adults > 0 && 
    guestAndRoomSelection.rooms > 0
  );

  const handleSearchClick = async () => {
    if (isSearchEnabled) {
      // Close all dropdowns before searching
      setIsDatePickerOpen(false);
      setIsGuestsOpen(false);
      setIsRoomTypeOpen(false);
      
      setIsSearching(true);
      
      // Simulate API call to search for available rooms
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock search results based on selected category
      const mockResults: AvailableRoom[] = [
        {
          id: "1",
          name: selectedRoomCategory,
          category: selectedRoomCategory,
          image: "/hero.jpg",
          price: selectedRoomCategory === "Standard Room" ? 180 : 
                 selectedRoomCategory === "Deluxe Room" ? 260 :
                 selectedRoomCategory === "Suite" ? 450 : 320,
          available: 5,
          maxGuests: selectedRoomCategory === "Family Room" ? 6 : 
                     selectedRoomCategory === "Suite" ? 4 : 2,
          amenities: ["Free WiFi", "TV", "Coffee Maker", "Air Conditioning"],
          description: `Comfortable ${selectedRoomCategory.toLowerCase()} with modern amenities and stunning views.`
        }
      ];
      
      setSearchResults(mockResults);
      setShowSearchResults(true);
      setIsSearching(false);
      
      // Call the original onSearch callback
      onSearch();
    }
  };

  const handleBookRoom = (room: AvailableRoom) => {
    if (!checkInDate || !checkOutDate) return;
    
    const nights = differenceInDays(checkOutDate, checkInDate);
    const totalGuests = guestAndRoomSelection.adults + guestAndRoomSelection.children;
    
    // Build query parameters for booking page
    const params = new URLSearchParams({
      roomName: room.name,
      roomImage: room.image,
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      adults: guestAndRoomSelection.adults.toString(),
      children: guestAndRoomSelection.children.toString(),
      guests: totalGuests.toString(),
      rooms: guestAndRoomSelection.rooms.toString(),
      price: room.price.toString(),
    });
    
    // Navigate to booking page
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <section
      ref={cardRef}
      aria-label="Search stays"
      className="rounded-3xl border border-black/5 bg-white p-4 text-black shadow-xl shadow-black/10 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:gap-6">
        <InteractiveField
          label="Room Type"
          description={selectedRoomCategory ?? defaultRoomType}
          icon={<BedDouble className="h-4 w-4" />}
          isOpen={isRoomTypeOpen}
          onToggle={() => setIsRoomTypeOpen((open) => !open)}
        >
          <div className="space-y-2">
            {availableCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  onRoomCategoryChange(category);
                  setIsRoomTypeOpen(false);
                }}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  selectedRoomCategory === category
                    ? "border-[#01a4ff] bg-[#01a4ff]/10 text-[#01a4ff]"
                    : "border-black/10 bg-white text-black/70 hover:border-[#01a4ff]/40 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </InteractiveField>

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
            onClick={handleSearchClick}
            disabled={!isSearchEnabled}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition-all md:w-auto ${
              isSearchEnabled
                ? "bg-[#01a4ff] text-white hover:bg-[#0084cc] hover:shadow-md"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            {isSearching ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Searching...
              </>
            ) : (
              <>
                Search
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
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

      {/* Search Results Modal */}
      {showSearchResults && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearchResults(false)}
          />
          
          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 transform px-4">
            <div className="max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex-1 min-w-0 pr-2">
                  <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Available Rooms</h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 truncate">
                    {checkInDate && checkOutDate && (
                      <>
                        <span className="hidden sm:inline">{format(checkInDate, "MMM d, yyyy")} - {format(checkOutDate, "MMM d, yyyy")}</span>
                        <span className="sm:hidden">{format(checkInDate, "MMM d")} - {format(checkOutDate, "MMM d")}</span>
                        <span className="ml-1 sm:ml-2 text-gray-400">•</span>
                        <span className="ml-1 sm:ml-2">{differenceInDays(checkOutDate, checkInDate)} nights</span>
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation flex-shrink-0"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  aria-label="Close"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Search Results */}
              <div className="p-3 sm:p-6">
                {searchResults.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {searchResults.map((room) => (
                      <div
                        key={room.id}
                        className="overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Room Image */}
                          <div className="relative h-40 sm:h-48 w-full md:h-auto md:w-64 flex-shrink-0">
                            <Image
                              src={room.image}
                              alt={room.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Room Details */}
                          <div className="flex flex-1 flex-col p-4 sm:p-6">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-xl font-semibold text-gray-900">{room.name}</h3>
                                <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">{room.description}</p>
                              </div>
                              <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-green-700 whitespace-nowrap flex-shrink-0">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">{room.available} available</span>
                                <span className="sm:hidden">{room.available}</span>
                              </div>
                            </div>

                            {/* Amenities */}
                            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
                              {room.amenities.slice(0, 4).map((amenity, index) => (
                                <div key={index} className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-600">
                                  {amenity === "Free WiFi" && <Wifi className="h-3 w-3 sm:h-4 sm:w-4" />}
                                  {amenity === "TV" && <Tv className="h-3 w-3 sm:h-4 sm:w-4" />}
                                  {amenity === "Coffee Maker" && <Coffee className="h-3 w-3 sm:h-4 sm:w-4" />}
                                  {amenity !== "Free WiFi" && amenity !== "TV" && amenity !== "Coffee Maker" && (
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                  )}
                                  <span className="hidden sm:inline">{amenity}</span>
                                  <span className="sm:hidden">{amenity.split(' ')[0]}</span>
                                </div>
                              ))}
                            </div>

                            {/* Capacity */}
                            <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Max {room.maxGuests} guests</span>
                            </div>

                            {/* Price and Book Button */}
                            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-t border-gray-100 pt-3 sm:pt-4">
                              <div className="flex-1">
                                <p className="text-xs sm:text-sm text-gray-600">Price per night</p>
                                <p className="text-xl sm:text-3xl font-bold text-gray-900">
                                  ₵{room.price}
                                  <span className="text-sm sm:text-base font-normal text-gray-500">/night</span>
                                </p>
                                {checkInDate && checkOutDate && (
                                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                    Total: ₵{(room.price * differenceInDays(checkOutDate, checkInDate)).toFixed(2)}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleBookRoom(room)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#01a4ff] px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0084cc] active:bg-[#006699] touch-manipulation"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                              >
                                <span className="hidden sm:inline">Proceed to Book</span>
                                <span className="sm:hidden">Book Now</span>
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-lg text-gray-600">No rooms available for your selected dates.</p>
                    <button
                      onClick={() => setShowSearchResults(false)}
                      className="mt-4 text-sm font-medium text-[#01a4ff] hover:text-[#0084cc]"
                    >
                      Try different dates
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
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
