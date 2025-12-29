"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/sections/Header";
import { Search } from "lucide-react";

interface SearchRoom {
  _id?: string;
  slug: string;
  name: string;
  description?: string;
  pricePerNight?: number;
  mainImage?: string;
}

interface SearchSection {
  id: string;
  title: string;
  href: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [rooms, setRooms] = useState<SearchRoom[]>([]);
  const [sections, setSections] = useState<SearchSection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    if (q.trim()) {
      runSearch(q.trim());
    } else {
      setRooms([]);
      setSections([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function runSearch(q: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setRooms(data.data.rooms || []);
        setSections(data.data.sections || []);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-6 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Search results</h1>
              {query && (
                <p className="text-sm text-gray-500 mt-0.5">Showing matches for “{query}”.</p>
              )}
            </div>
          </div>

          {(!query || !query.trim()) && (
            <p className="text-sm text-gray-500">Type something in the search box in the header to get started.</p>
          )}

          {loading && (
            <p className="text-sm text-gray-500">Searching...</p>
          )}

          {!loading && query && rooms.length === 0 && sections.length === 0 && (
            <p className="text-sm text-gray-500">No results found. Try a different keyword.</p>
          )}

          {sections.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-700">Site sections</h2>
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={section.href}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600"
                  >
                    <span>{section.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {rooms.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Rooms</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {rooms.map((room) => (
                  <Link
                    key={room.slug}
                    href={`/rooms/${room.slug}`}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={room.mainImage || "/hero.jpg"}
                        alt={room.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4 space-y-1.5">
                      <h3 className="text-sm font-semibold text-gray-900">{room.name}</h3>
                      {room.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{room.description}</p>
                      )}
                      {room.pricePerNight != null && (
                        <p className="mt-auto text-xs font-semibold text-blue-600">
                          From ₵{room.pricePerNight.toLocaleString()} / night
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
