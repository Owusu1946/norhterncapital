import { AllRoomsSection } from "../../components/sections/AllRoomsSection";
import { Header } from "../../components/sections/Header";

export default function RoomsPage() {
  return (
    <>
      <Header />
      <main className="bg-white px-6 py-12 text-black sm:px-10 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
            Rooms &amp; Suites
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            Find the right stay at Northern Capital Hotel
          </h1>
          <p className="max-w-2xl text-sm text-black/70">
            Whether you are here for a quick stopover, a business retreat, or a
            family weekend, explore our selection of rooms designed for calm and
            comfort.
          </p>
        </header>

        <AllRoomsSection />
      </div>
      </main>
    </>
  );
}
