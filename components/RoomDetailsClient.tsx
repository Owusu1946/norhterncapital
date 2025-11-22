"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SleekDatePicker } from "./SleekDatePicker";

import type { Room } from "../lib/rooms";

// Extend Room type locally with optional capacity metadata coming from RoomType
interface RoomWithCapacity extends Room {
  maxAdults?: number;
  maxChildren?: number;
  totalRooms?: number;
}

interface RoomDetailsClientProps {
  room: RoomWithCapacity;
}

export function RoomDetailsClient({ room }: RoomDetailsClientProps) {
  const router = useRouter();
  const images = room.gallery.length > 0 ? room.gallery : [room.image];
  const [activeIndex, setActiveIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [canBook, setCanBook] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [warningModal, setWarningModal] = useState<{ open: boolean; message: string | null }>({
    open: false,
    message: null,
  });
  const [bookingData, setBookingData] = useState<{
    checkIn: string | null;
    checkOut: string | null;
    adults: number;
    children: number;
    rooms: number;
  }>({
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    rooms: 1
  });

  const handleDatesChange = (dates: { checkIn: string | null; checkOut: string | null }) => {
    setBookingData(prev => ({
      ...prev,
      checkIn: dates.checkIn,
      checkOut: dates.checkOut
    }));
  };

  // Auto-advance gallery every 6 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => window.clearInterval(id);
  }, [images.length]);

  function goTo(index: number) {
    setActiveIndex((index + images.length) % images.length);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const adults = Number(formData.get("adults") || 1);
    const children = Number(formData.get("children") || 0);
    const rooms = Number(formData.get("rooms") || 1);
    const totalGuests = adults + children;
    
    // Update guests breakdown in booking data
    setBookingData(prev => ({
      ...prev,
      adults,
      children,
      rooms
    }));

    const payload = {
      roomSlug: room.slug,
      roomName: room.name,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      adults,
      children,
      guests: totalGuests,
      rooms,
    };

    console.log("Check availability request", payload);
    const hasDates = bookingData.checkIn && bookingData.checkOut;

    if (!hasDates) {
      const message = "Please select your check-in and check-out dates to check availability.";
      setStatusMessage(message);
      setWarningModal({ open: true, message });
      setCanBook(false);
      setBookingMessage(null);
      return;
    }

    // Capacity constraints per room type
    const perRoomMaxGuests = room.maxGuests ?? Infinity;
    const perRoomMaxAdults = (room.maxAdults ?? room.maxGuests) ?? Infinity;
    const perRoomMaxChildren = (room.maxChildren ?? room.maxGuests) ?? Infinity;

    const maxGuestsAllowed = perRoomMaxGuests * rooms;
    const maxAdultsAllowed = perRoomMaxAdults * rooms;
    const maxChildrenAllowed = perRoomMaxChildren * rooms;

    // Validate against room type capacities
    if (adults > maxAdultsAllowed) {
      const message =
        `This room type allows up to ${perRoomMaxAdults} adult${perRoomMaxAdults !== 1 ? "s" : ""} per room (${maxAdultsAllowed} total for ${rooms} room${rooms !== 1 ? "s" : ""}).`;
      setStatusMessage(message);
      setWarningModal({ open: true, message });
      setCanBook(false);
      setBookingMessage(null);
      return;
    }

    if (children > maxChildrenAllowed) {
      const message =
        `This room type allows up to ${perRoomMaxChildren} child${perRoomMaxChildren !== 1 ? "ren" : ""} per room (${maxChildrenAllowed} total for ${rooms} room${rooms !== 1 ? "s" : ""}).`;
      setStatusMessage(message);
      setWarningModal({ open: true, message });
      setCanBook(false);
      setBookingMessage(null);
      return;
    }

    if (totalGuests > maxGuestsAllowed) {
      const message =
        `This room type allows up to ${perRoomMaxGuests} guest${perRoomMaxGuests !== 1 ? "s" : ""} per room (${maxGuestsAllowed} total for ${rooms} room${rooms !== 1 ? "s" : ""}).`;
      setStatusMessage(message);
      setWarningModal({ open: true, message });
      setCanBook(false);
      setBookingMessage(null);
      return;
    }

    // Check how many rooms of this type are actually available
    try {
      setStatusMessage("Checking availability...");
      setCanBook(false);
      setBookingMessage(null);

      const response = await fetch(`/api/rooms?roomType=${encodeURIComponent(room.slug)}&status=available`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const message = "We couldn't check availability at the moment. Please try again.";
        setStatusMessage(message);
        setWarningModal({ open: true, message });
        return;
      }

      const data = await response.json();
      const availableRooms = Array.isArray(data?.data?.rooms) ? data.data.rooms.length : 0;

      if (availableRooms === 0) {
        const message = "All rooms of this type are currently occupied for your selected dates.";
        setStatusMessage(message);
        setWarningModal({ open: true, message });
        setCanBook(false);
        return;
      }

      if (rooms > availableRooms) {
        const label = availableRooms === 1 ? "room is" : "rooms are";
        const message =
          `Only ${availableRooms} ${label} available for this room type. Please reduce the number of rooms or choose different dates.`;
        setStatusMessage(message);
        setWarningModal({ open: true, message });
        setCanBook(false);
        return;
      }

      setStatusMessage("Good news this room is available for your selected dates.");
      setCanBook(true);
      setBookingMessage(null);
    } catch (error) {
      console.error("Error checking availability", error);
      const message = "We couldn't check availability at the moment. Please try again.";
      setStatusMessage(message);
      setWarningModal({ open: true, message });
      setCanBook(false);
      setBookingMessage(null);
    }
  }

  function handleBookClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate dates before booking
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setStatusMessage("Please select your check-in and check-out dates first.");
      setCanBook(false);
      return;
    }
    
    // Navigate to booking page with all necessary data
    const totalGuests = bookingData.adults + bookingData.children;
    const params = new URLSearchParams({
      roomSlug: room.slug,
      roomName: room.name,
      roomImage: room.image,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      adults: bookingData.adults.toString(),
      children: bookingData.children.toString(),
      guests: totalGuests.toString(),
      rooms: bookingData.rooms.toString(),
      price: room.priceFrom.toString()
    });
    
    // Use window.location for better iOS Safari compatibility
    const url = `/booking?${params.toString()}`;
    router.push(url);
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Warning modal */}
      {warningModal.open && warningModal.message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl shadow-black/30">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <span className="absolute inline-flex h-10 w-10 animate-ping rounded-full bg-red-400/40" />
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Please review your booking</h2>
                <p className="mt-1 text-xs text-gray-500">We need you to adjust a few details before continuing.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">{warningModal.message}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setWarningModal({ open: false, message: null })}
                className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8 space-y-2 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#01a4ff]">
          Room Details
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          {room.name}
        </h1>
        <p className="text-sm text-black/70">
          {room.size} · {room.bedType} · Up to {room.maxGuests} guests
        </p>
      </header>

      <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] md:items-start">
        {/* Gallery & description */}
        <section aria-label="Room gallery and description" className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-black/5">
            <div className="relative h-64 w-full sm:h-80 md:h-96">
              {images.map((src, index) => (
                <div
                  key={src + index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                    index === activeIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={src}
                    alt={room.name}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    quality={95}
                    sizes="(min-width: 1024px) 960px, (min-width: 640px) 100vw, 100vw"
                  />
                </div>
              ))}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-4">
              <div className="pointer-events-auto inline-flex gap-1.5 rounded-full bg-black/40 px-2 py-1 ring-1 ring-white/30">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goTo(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeIndex
                        ? "w-4 bg-[#01a4ff]"
                        : "w-2 bg-white/60 hover:bg-white"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              <div className="pointer-events-auto hidden gap-1 rounded-full bg-black/40 p-1 ring-1 ring-white/30 sm:flex">
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white hover:bg-white/10"
                  aria-label="Previous image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white hover:bg-white/10"
                  aria-label="Next image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M8.59 16.09l4.58-4.59-4.58-4.59L10 5.5l6 6-6 6z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, index) => (
                <button
                  key={src + index + "-thumb"}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-2xl border transition-all ${
                    index === activeIndex
                      ? "border-[#01a4ff] ring-2 ring-[#01a4ff]/40"
                      : "border-black/10 hover:border-[#01a4ff]/60"
                  }`}
                  aria-label={`Preview image ${index + 1}`}
                >
                  <Image
                    src={src}
                    alt={`${room.name} preview ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-black/75">
              {room.longDescription}
            </p>
          </div>

          <section aria-label="Room amenities" className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-black/70">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-[#01a4ff]/5 px-3 py-1 text-xs font-medium text-black/80 ring-1 ring-[#01a4ff]/20"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </section>
        </section>

        {/* Booking module */}
        <aside
          aria-label="Booking module"
          className="space-y-4 rounded-3xl border border-black/5 bg-white p-5 shadow-sm shadow-black/5 md:sticky md:top-24"
        >
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                From
              </p>
              <p className="text-2xl font-semibold text-black">
                ₵{room.priceFrom.toLocaleString()}
                <span className="ml-1 text-xs font-normal text-black/60">/night</span>
              </p>
            </div>
            <p className="text-xs text-black/60">Flexible rates · No booking fees</p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <SleekDatePicker
              checkInDate={bookingData.checkIn}
              checkOutDate={bookingData.checkOut}
              onDatesChange={handleDatesChange}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-black/70">Adults</label>
                <input
                  type="number"
                  min={1}
                  defaultValue={bookingData.adults}
                  name="adults"
                  className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs text-black outline-none ring-0 focus:border-[#01a4ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-black/70">Children</label>
                <input
                  type="number"
                  min={0}
                  defaultValue={bookingData.children}
                  name="children"
                  className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs text-black outline-none ring-0 focus:border-[#01a4ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-black/70">Rooms</label>
                <input
                  type="number"
                  min={1}
                  defaultValue={bookingData.rooms}
                  name="rooms"
                  className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs text-black outline-none ring-0 focus:border-[#01a4ff]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-[#01a4ff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0084cc] active:bg-[#006699] transition-colors touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Check availability
            </button>

            <p className="text-[11px] text-black/60">
              No payment required at this step. You will receive a confirmation
              from Northern Capital Hotel after submitting your request.
            </p>

            {statusMessage && (
              <p className="text-[11px] font-medium text-[#01a4ff]">
                {statusMessage}
              </p>
            )}

            {canBook && (
              <button
                type="button"
                onClick={handleBookClick}
                className="mt-2 inline-flex w-full items-center justify-center rounded-2xl border border-[#01a4ff]/60 bg-white px-4 py-2.5 text-sm font-semibold text-[#01a4ff] shadow-sm hover:bg-[#01a4ff]/5 active:bg-[#01a4ff]/10 transition-colors touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Book this room
              </button>
            )}

            {bookingMessage && (
              <p className="text-[11px] font-medium text-emerald-600">
                {bookingMessage}
              </p>
            )}
          </form>

          <div className="border-t border-black/5 pt-3 text-xs text-black/60">
            Need help with a group booking or airport pickup? Contact our
            reservations team for a tailored stay.
          </div>
        </aside>
      </div>
    </div>
  );
}
