"use client";

import Image from "next/image";

const facilities = [
  {
    name: "Airport Shuttle",
    description: "Seamless transfers between Northern Capital Hotel and Tamale International Airport.",
    image: "/hero.jpg",
    tag: "Arrival",
  },
  {
    name: "Meeting & Event Spaces",
    description: "Elegant rooms for strategy sessions, retreats, and intimate celebrations.",
    image: "/hero.jpg",
    tag: "Business",
  },
  {
    name: "Spa & Wellness Center",
    description: "Quiet treatment rooms designed for deep rest and reset.",
    image: "/hero.jpg",
    tag: "Wellness",
  },
];

export function FacilitiesSection() {
  return (
    <section className="bg-white px-6 pb-16 pt-6 text-black sm:px-10 sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
              Facilities
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-black sm:text-3xl md:text-4xl">
              Spaces made for every moment
            </h2>
          </div>
          <p className="max-w-md text-sm text-black/70">
            From effortless arrivals to calm wellness rituals and focused meetings,
            our key facilities are designed to keep your stay balanced.
          </p>
        </header>

        <div className="mt-8 overflow-x-auto pb-2">
          <div className="flex min-w-full gap-4 md:grid md:grid-cols-3 md:gap-6">
            {facilities.map((facility) => (
              <article
                key={facility.name}
                className="group relative flex min-w-[260px] flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm shadow-black/5 transition hover:-translate-y-1.5 hover:border-[#01a4ff]/60 hover:shadow-lg hover:shadow-black/10"
              >
                <div className="relative h-40 w-full overflow-hidden sm:h-48">
                  <Image
                    src={facility.image}
                    alt={facility.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/85">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#01a4ff]" />
                    {facility.tag}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
                  <h3 className="text-sm font-semibold text-black">
                    {facility.name}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-black/65">
                    {facility.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
