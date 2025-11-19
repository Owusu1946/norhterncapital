"use client";

import dynamic from "next/dynamic";

const BookingClient = dynamic(
  () => import("@/components/BookingClient").then((mod) => mod.BookingClient),
  { 
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#01a4ff] border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading booking form...</p>
        </div>
      </div>
    )
  }
);

export default function BookingPage() {
  return <BookingClient />;
}
