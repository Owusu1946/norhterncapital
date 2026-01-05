"use client";

import Image from "next/image";

const diningHighlights = [
  {
    name: "Northern Capital Restaurant",
    description:
      "All-day dining with a calm atmosphere, serving contemporary Ghanaian and international dishes.",
    image: "/hotel-images/24.JPG",
    tag: "All Day",
  },
  {
    name: "Morning Buffet",
    description:
      "A generous breakfast spread with fresh fruits, warm pastries, and made-to-order favourites.",
    image: "/hotel-images/3.JPG",
    tag: "Breakfast",
  },
  {
    name: "On the Rocks Bar",
    description:
      "An intimate bar with cocktails, chilled drinks, and light bites into the evening.",
    image: "/hotel-images/IMG_3725.PNG",
    tag: "Evening",
  },
];

export function DiningSection() {
  return (
    <section className="bg-white px-6 pb-20 pt-10 text-black sm:px-10 sm:pb-24 sm:pt-14">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
              Dining at Northern Capital
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-black sm:text-3xl md:text-4xl">
              A calm, flavourful table
            </h2>
          </div>
          <p className="max-w-md text-sm text-black/70">
            Start the day with a bright breakfast, pause for a quiet lunch, or wind
            down at the bar. Dining at Northern Capital Hotel is relaxed, modern,
            and welcoming.
          </p>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {diningHighlights.map((item) => (
            <article
              key={item.name}
              className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm shadow-black/5 transition hover:-translate-y-1.5 hover:border-[#01a4ff]/60 hover:shadow-lg hover:shadow-black/10"
            >
              <div className="relative h-40 w-full overflow-hidden sm:h-48">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#01a4ff]" />
                  {item.tag}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
                <h3 className="text-sm font-semibold text-black">{item.name}</h3>
                <p className="text-[11px] leading-relaxed text-black/65">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
