"use client";

const highlightServices = [
  {
    name: "Airport Pickup",
    tag: "Arrival",
    description: "Private transfers from Tamale International Airport, ready when you land.",
  },
  {
    name: "Buffet Breakfast",
    tag: "Mornings",
    description: "Fresh Ghanaian and international favourites served every morning.",
  },
  {
    name: "Spa & Wellness",
    tag: "Wellness",
    description: "Quiet treatments and reset rituals after a day in the city.",
  },
  {
    name: "Swimming Pool",
    tag: "Leisure",
    description: "An outdoor pool to cool off and unwind under the northern skies.",
  },
  {
    name: "Conference & Events",
    tag: "Business",
    description: "Modern spaces for intimate meetings, retreats, and celebrations.",
  },
  {
    name: "24-Hour Room Service",
    tag: "Anytime",
    description: "Day or night, a curated menu delivered quietly to your room.",
  },
];

const additionalServices = [
  "Welcome Drinks",
  "Multi Cuisine Restaurant",
  "Childcare",
  "Billiard Board",
  "Mini Fridge",
  "Coffee & Pastry Shop",
  "Laundry & Dry Cleaning",
  "Car Rental",
  "On the Rocks (Bar)",
  "Wi-Fi Internet",
];

export function ServicesSection() {
  return (
    <section className="bg-white px-6 py-14 text-black sm:px-10 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
              From Arrival to Unwind
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-black sm:text-3xl md:text-4xl">
              Thoughtful services for every stay
            </h2>
          </div>
          <p className="max-w-md text-sm text-black/70">
            From airport pickup to late-night room service, Northern Capital Hotel
            is designed to keep every moment of your journey effortless and calm.
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {highlightServices.map((service) => (
            <article
              key={service.name}
              className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white px-5 py-5 shadow-sm shadow-black/5 transition hover:-translate-y-1.5 hover:border-[#01a4ff]/60 hover:shadow-lg hover:shadow-black/10"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="pointer-events-none absolute inset-[-40%] bg-[radial-gradient(circle_at_top,_rgba(1,164,255,0.2),_transparent_60%)]" />
              </div>
              <div className="relative flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#01a4ff]/6 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#01a4ff]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#01a4ff]" />
                  {service.tag}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-black">
                    {service.name}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-black/65">
                    {service.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2 text-[11px] text-black/65">
          {additionalServices.map((service) => (
            <span
              key={service}
              className="rounded-full border border-black/10 bg-black/5 px-3 py-1"
            >
              {service}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
