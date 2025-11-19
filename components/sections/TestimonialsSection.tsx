"use client";

const testimonials = [
  {
    name: "Abena K.",
    role: "Weekend guest from Accra",
    quote:
      "Northern Capital Hotel felt like a quiet pocket away from the city. The airport pickup was smooth and the rooms were incredibly calm.",
    stayType: "Leisure stay",
  },
  {
    name: "Michael A.",
    role: "Business traveller",
    quote:
      "I loved how close it was to the airport and Savelugu town. The Wi-Fi was strong, and the team handled our meeting setup perfectly.",
    stayType: "Business retreat",
  },
  {
    name: "Fatima I.",
    role: "Family stay from Tamale",
    quote:
      "Our family felt very safe and looked after. The staff remembered our names, and breakfast was a highlight every morning.",
    stayType: "Family weekend",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-white px-6 pb-20 pt-8 text-black sm:px-10 sm:pb-24 sm:pt-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
              Guest Stories
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-black sm:text-3xl md:text-4xl">
              Stays that feel quietly special
            </h2>
          </div>
          <p className="max-w-md text-sm text-black/70">
            A few words from guests who chose Northern Capital Hotel for work,
            rest, and everything in between.
          </p>
        </header>

        <div className="mt-8 overflow-x-auto pb-2">
          <div className="flex min-w-full gap-4 md:grid md:grid-cols-3 md:gap-6">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="group relative flex min-w-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-black/5 bg-white px-5 py-5 shadow-sm shadow-black/5 transition hover:-translate-y-1.5 hover:border-[#01a4ff]/60 hover:shadow-lg hover:shadow-black/10"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="pointer-events-none absolute inset-[-40%] bg-[radial-gradient(circle_at_top,_rgba(1,164,255,0.16),_transparent_60%)]" />
                </div>

                <div className="relative flex flex-1 flex-col justify-between gap-4">
                  <p className="text-sm leading-relaxed text-black/75">
                    “{testimonial.quote}”
                  </p>

                  <div className="space-y-1 pt-2">
                    <p className="text-sm font-semibold text-black">
                      {testimonial.name}
                    </p>
                    <p className="text-[11px] text-black/60">
                      {testimonial.role}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#01a4ff]/6 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#01a4ff]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#01a4ff]" />
                      {testimonial.stayType}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
