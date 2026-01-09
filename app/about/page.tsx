"use client";

import Image from "next/image";
import { Header } from "@/components/sections/Header";
import { Users, Award, Heart, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          <Image
            src="/hotel-images/IMG_3725.PNG"
            alt="Northern Capital Hotel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 sm:px-10">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
              About Us
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              A Warm Beacon of Hospitality
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90">
              Nestled in the heart of Savelugu, Northern Capital Hotel is your calm escape just moments away from the city.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
                    Our Story
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                    Where Northern Hospitality Meets Modern Comfort
                  </h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-black/70">
                  <p>
                    Northern Capital Hotel was born from a vision to showcase the warmth of northern Ghanaian hospitality in a contemporary setting. Located just five minutes from Tamale International Airport and a minute from Savelugu Police Station, we offer the perfect blend of accessibility and tranquility.
                  </p>
                  <p>
                    From our thoughtfully designed interiors to our attentive service, every detail is crafted to make your stay feel effortless, memorable, and uniquely local. Whether you're arriving from a late-night flight or exploring the vibrant culture of Tamale and Savelugu, we're here to welcome you with comfort, safety, and a genuine smile.
                  </p>
                  <p>
                    Our commitment goes beyond providing a place to rest. We strive to create an experience that reflects the rich heritage of the Northern Region while offering all the modern amenities today's travelers expect.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative h-48 overflow-hidden rounded-3xl border border-black/5 shadow-sm">
                      <Image
                        src="/hotel-images/18.JPG"
                        alt="Hotel exterior"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative h-64 overflow-hidden rounded-3xl border border-black/5 shadow-sm">
                      <Image
                        src="/hotel-images/3.JPG"
                        alt="Hotel room"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="relative h-64 overflow-hidden rounded-3xl border border-black/5 shadow-sm">
                      <Image
                        src="/hotel-images/21.JPG"
                        alt="Hotel lounge"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative h-48 overflow-hidden rounded-3xl border border-black/5 shadow-sm">
                      <Image
                        src="/hotel-images/14.JPG"
                        alt="Hotel dining"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-gray-50 px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
                Our Values
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                What We Stand For
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Heart,
                  title: "Hospitality",
                  description: "Genuine warmth and care in every interaction, making you feel at home away from home."
                },
                {
                  icon: Award,
                  title: "Excellence",
                  description: "Commitment to the highest standards in service, comfort, and attention to detail."
                },
                {
                  icon: Users,
                  title: "Community",
                  description: "Celebrating local culture and creating connections between our guests and the Northern Region."
                },
                {
                  icon: Target,
                  title: "Integrity",
                  description: "Transparent, honest service that builds trust and lasting relationships with our guests."
                }
              ].map((value, index) => (
                <div
                  key={index}
                  className="group rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#01a4ff]/60 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#01a4ff]/10">
                    <value.icon className="h-6 w-6 text-[#01a4ff]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-black">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-black/70">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
                    Location
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                    Perfectly Positioned in Savelugu
                  </h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-black/70">
                  <p>
                    Our strategic location offers the best of both worlds – the tranquility of Savelugu with easy access to Tamale's vibrant city life and cultural attractions.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#01a4ff]/10">
                        <div className="h-2 w-2 rounded-full bg-[#01a4ff]" />
                      </div>
                      <div>
                        <p className="font-medium text-black">5 minutes from Tamale International Airport</p>
                        <p className="text-xs text-black/60">Perfect for business travelers and tourists</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#01a4ff]/10">
                        <div className="h-2 w-2 rounded-full bg-[#01a4ff]" />
                      </div>
                      <div>
                        <p className="font-medium text-black">1 minute from Savelugu Police Station</p>
                        <p className="text-xs text-black/60">Safe and secure location</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#01a4ff]/10">
                        <div className="h-2 w-2 rounded-full bg-[#01a4ff]" />
                      </div>
                      <div>
                        <p className="font-medium text-black">Close to local attractions</p>
                        <p className="text-xs text-black/60">Explore Tamale's markets, cultural sites, and more</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-[400px] overflow-hidden rounded-3xl border border-black/5 shadow-lg">
                <Image
                  src="/hotel-images/15.JPG"
                  alt="Hotel location"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="rounded-2xl bg-white/95 p-4 backdrop-blur-sm">
                    <p className="text-xs font-medium text-black/60">Address</p>
                    <p className="mt-1 text-sm font-semibold text-black">
                      123 Central Business District<br />
                      Savelugu, Northern Region<br />
                      Ghana
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-neutral-900 px-6 py-16 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Experience Northern Capital Hotel
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Whether you're here for business or leisure, we're ready to make your stay memorable and luxurious
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="/rooms"
                className="rounded-full bg-[#01a4ff] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0084cc]"
              >
                View Our Rooms
              </a>
              <a
                href="/contact"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
