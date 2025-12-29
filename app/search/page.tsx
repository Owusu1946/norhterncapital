import { Suspense } from "react";
import SearchContent from "./SearchContent";
import { Header } from "@/components/sections/Header";

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-6 sm:py-10">
        <Suspense fallback={<div className="text-center pt-10 text-gray-500">Loading search...</div>}>
          <SearchContent />
        </Suspense>
      </main>
    </>
  );
}

