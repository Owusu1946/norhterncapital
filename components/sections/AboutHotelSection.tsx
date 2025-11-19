"use client";

import Image from "next/image";

export function AboutHotelSection() {
  return (
    <section className="bg-white px-6 py-14 text-black sm:px-10 sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(circle_at_top,_rgba(1,164,255,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(15,23,42,0.08),_transparent_70%)] opacity-90" />

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            <div className="group relative col-span-2 h-44 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm shadow-black/5 transition-transform duration-500 hover:-translate-y-1 hover:shadow-md hover:shadow-black/10 sm:h-56">
              <Image
                src="/hero.jpg"
                alt="Northern Capital Hotel suite"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#01a4ff] ring-1 ring-[#01a4ff]/60">
                Signature stays
              </div>
            </div>

            <div className="group relative h-32 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm shadow-black/5 transition-transform duration-500 hover:-translate-y-1 hover:shadow-md hover:shadow-black/10 sm:h-40">
              <Image
                src="/hero.jpg"
                alt="Warm lounge corner at Northern Capital Hotel"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-medium text-white/90 ring-1 ring-[#01a4ff]/40">
                Evening lounge
              </div>
            </div>

            <div className="group relative h-32 translate-y-3 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm shadow-black/5 transition-transform duration-500 hover:-translate-y-4 hover:shadow-md hover:shadow-black/10 sm:h-40 sm:translate-y-4">
              <Image
                src="/hero.jpg"
                alt="Dining and social space at Northern Capital Hotel"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-medium text-white/90 ring-1 ring-[#01a4ff]/40">
                Social corners
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5 md:space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#01a4ff]">
              Welcome to Northern Capital Hotel
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl md:text-4xl">
              A Warm Beacon of Hospitality in Savelugu
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-relaxed text-black/70">
            Nestled in the heart of Savelugu, Northern Capital Hotel is your calm
            escape just moments away from the city. We are located about five
            minutes drive from Tamale International Airport and only a minute away
            from the Savelugu Police Station, making us perfectly placed for both
            business and leisure travellers.
          </p>

          <div className="grid gap-4 text-sm text-black/75 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-black">Our Story</h3>
              <p className="text-xs leading-relaxed text-black/70">
                Northern Capital Hotel was created to showcase the warmth of
                northern Ghanaian hospitality in a contemporary setting. From
                thoughtful interiors to attentive service, every detail is
                designed to make your stay feel effortless, memorable, and
                uniquely local.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-black">Our Promise</h3>
              <p className="text-xs leading-relaxed text-black/70">
                Whether you are arriving from a late-night flight or exploring
                Savelugu and Tamale, we are here to welcome you with comfort,
                safety, and a genuine smile. Expect quiet rooms, reliable
                essentials, and a team that knows you by name.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 text-xs text-black/75">
            <div className="flex items-center gap-2 rounded-full bg-[#01a4ff]/5 px-3 py-1.5 ring-1 ring-[#01a4ff]/30">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#01a4ff]" />
              <span>5 mins from Tamale International Airport</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5 ring-1 ring-black/10">
              <span className="inline-flex h-2 w-2 rounded-full bg-black/60" />
              <span>1 min from Savelugu Police Station</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
