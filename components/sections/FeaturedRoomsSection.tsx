"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Room } from "../../lib/rooms";

export function FeaturedRoomsSection() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch("/api/public/room-types");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.roomTypes) {
          // Take first 3 room types for featured section
          setRooms(data.data.roomTypes.slice(0, 3));
        }
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white px-6 py-12 text-black sm:px-10 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-center items-center py-12">
            <div className="text-sm text-gray-600">Loading rooms...</div>
          </div>
        </div>
      </section>
    );
  }

  if (rooms.length === 0) {
    return null; // Don't show section if no rooms
  }

  return (
    <section className="bg-white px-6 py-12 text-black sm:px-10 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium tracking-wide text-[#01a4ff]">
              Featured Rooms
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Stay in comfort and style
            </h2>
          </div>
          <p className="max-w-md text-sm text-black/70">
            Discover a curated selection of our most loved rooms, designed for
            effortless city stays, weekend escapes, and longer business trips.
          </p>
        </header>

        <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-3">
          {rooms.map((room) => (
            <article
              key={room.slug}
              className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm shadow-black/5 transition hover:-translate-y-1 hover:shadow-md hover:shadow-black/10"
            >
              <div className="relative h-44 w-full overflow-hidden sm:h-52">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold leading-tight text-black">
                      {room.name}
                    </h3>
                    <p className="mt-1 text-xs text-black/50">
                      {room.size}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-black/50">From</p>
                    <p className="text-sm font-semibold text-black">
                      ₵{room.priceFrom.toLocaleString()}
                      <span className="ml-1 text-xs font-normal text-black/50">
                        /night
                      </span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-black/70">
                  {room.description}
                </p>

                <div className="mt-1 flex flex-wrap gap-1.5">
                  {room.perks.map((perk) => (
                    <span
                      key={perk}
                      className="rounded-full bg-[#01a4ff]/5 px-2 py-1 text-[10px] font-medium text-black/70 ring-1 ring-[#01a4ff]/20"
                    >
                      {perk}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href={`/rooms/${room.slug}`}
                    className="rounded-full bg-[#01a4ff] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0084cc]"
                  >
                    View details
                  </Link>
                  <button
                    type="button"
                    className="text-xs font-medium text-black/70 underline-offset-4 hover:text-[#01a4ff] hover:underline"
                  >
                    Book now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
