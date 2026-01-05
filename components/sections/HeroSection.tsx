"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import {
  BookingCard,
  type GuestAndRoomSelection,
  type RoomCategory,
} from "../BookingCard";

const heroSlides = [
  {
    image: "/hotel-images/42.JPG",
    alt: "Northern Capital Hotel suite with warm lighting",
    label: "Signature stays",
  },
  {
    image: "/hotel-images/18.JPG",
    alt: "Lounge space at Northern Capital Hotel",
    label: "Evening lounge",
  },
  {
    image: "/hotel-images/19.JPG",
    alt: "Dining and social area at Northern Capital Hotel",
    label: "Social corners",
  },
];

interface HeroSectionProps {
  defaultRoomType?: string;
}

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedRoomCategory, setSelectedRoomCategory] =
    useState<RoomCategory>('');
  const [guestAndRoomSelection, setGuestAndRoomSelection] =
    useState<GuestAndRoomSelection>({ adults: 1, children: 0, rooms: 1 });
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [availableCategories, setAvailableCategories] = useState<RoomCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const defaultRoomType = "Select room type";

  function handleSearch() {
    // TODO: Integrate with search results page or API.
    // For now this is a semantic placeholder to be wired to real logic.
    const searchPayload = {
      roomType: selectedRoomCategory,
      adults: guestAndRoomSelection.adults,
      children: guestAndRoomSelection.children,
      rooms: guestAndRoomSelection.rooms,
      checkInDate,
      checkOutDate,
    };

    console.log("Searching stays with:", searchPayload);
  }

  useEffect(() => {
    async function fetchRoomTypes() {
      setIsLoadingCategories(true);
      try {
        const response = await fetch('/api/public/room-types');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.roomTypes) {
            const categories = data.data.roomTypes.map((rt: any) => rt.name);
            setAvailableCategories(categories);
            // Set first category as default if available
            if (categories.length > 0 && !selectedRoomCategory) {
              setSelectedRoomCategory(categories[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching room types:', error);
        // Fallback to default categories if API fails
        setAvailableCategories(["Standard Room", "Deluxe Room", "Suite", "Family Room"]);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchRoomTypes();
  }, []);

  return (
    <section className="relative min-h-screen bg-neutral-900 text-white">
      <HeroBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header variant="hero" />
        <HeroContent
          defaultRoomType={defaultRoomType}
          selectedRoomCategory={selectedRoomCategory}
          onRoomCategoryChange={setSelectedRoomCategory}
          guestAndRoomSelection={guestAndRoomSelection}
          onGuestAndRoomChange={setGuestAndRoomSelection}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onDatesChange={({ checkIn, checkOut }) => {
            setCheckInDate(checkIn);
            setCheckOutDate(checkOut);
          }}
          onSearch={handleSearch}
          availableCategories={availableCategories}
          isLoadingCategories={isLoadingCategories}
        />
      </div>
    </section>
  );
}

function HeroBackdrop() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroSlides.length);
    }, 8000);

    return () => window.clearInterval(id);
  }, []);

  function goTo(index: number) {
    setActiveIndex((index + heroSlides.length) % heroSlides.length);
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.label + index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
          <div className="pointer-events-none absolute bottom-8 left-6 sm:left-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#01a4ff] ring-1 ring-[#01a4ff]/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#01a4ff]" />
              {slide.label}
            </span>
          </div>
        </div>
      ))}

      <div className="pointer-events-none absolute top-1/2 left-6 right-6 flex -translate-y-1/2 items-center justify-between sm:left-10 sm:right-10">
        {/* Previous Button - Left Side */}
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-black/60 hover:ring-white/40"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
          </svg>
        </button>

        {/* Next Button - Right Side */}
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-black/60 hover:ring-white/40"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M8.59 16.09l4.58-4.59-4.58-4.59L10 5.5l6 6-6 6z" />
          </svg>
        </button>
      </div>

      {/* Slide Indicators - Bottom Center */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto flex gap-1.5 rounded-full bg-black/40 px-3 py-2 ring-1 ring-white/20 backdrop-blur-sm">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all ${index === activeIndex
                ? "w-6 bg-[#01a4ff]"
                : "w-1.5 bg-white/50 hover:bg-white"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


interface HeroContentProps {
  defaultRoomType: string;
  selectedRoomCategory: RoomCategory;
  onRoomCategoryChange: (category: RoomCategory) => void;
  guestAndRoomSelection: GuestAndRoomSelection;
  onGuestAndRoomChange: (selection: GuestAndRoomSelection) => void;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  onDatesChange: (dates: { checkIn: Date | null; checkOut: Date | null }) => void;
  onSearch: () => void;
  availableCategories: RoomCategory[];
  isLoadingCategories: boolean;
}

function HeroContent({
  defaultRoomType,
  selectedRoomCategory,
  onRoomCategoryChange,
  guestAndRoomSelection,
  onGuestAndRoomChange,
  checkInDate,
  checkOutDate,
  onDatesChange,
  onSearch,
  availableCategories,
  isLoadingCategories,
}: HeroContentProps) {
  return (
    <main className="flex flex-1 flex-col justify-end px-6 pb-10 sm:px-10 sm:pb-14">
      <div className="mb-8 max-w-3xl space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
          Welcome to
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          Northern Capital Hotel
        </h1>
      </div>

      <section aria-label="Room booking" id="booking">
        <BookingCard
          defaultRoomType={defaultRoomType}
          selectedRoomCategory={selectedRoomCategory}
          onRoomCategoryChange={onRoomCategoryChange}
          guestAndRoomSelection={guestAndRoomSelection}
          onGuestAndRoomChange={onGuestAndRoomChange}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onDatesChange={onDatesChange}
          availableCategories={availableCategories}
          onSearch={onSearch}
        />
      </section>
    </main>
  );
}
