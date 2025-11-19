"use client";

import Image from "next/image";
import { Header } from "@/components/sections/Header";
import { 
  Wifi, 
  Car, 
  Coffee, 
  Utensils, 
  Dumbbell, 
  Waves, 
  Sparkles, 
  Users, 
  ShieldCheck,
  Clock,
  Wind,
  Tv,
  Phone,
  Shirt,
  Baby,
  Wine,
  Briefcase,
  MapPin
} from "lucide-react";

const amenitiesCategories = [
  {
    title: "Essential Services",
    description: "Everything you need for a comfortable stay",
    amenities: [
      { icon: Wifi, name: "Free High-Speed WiFi", description: "Stay connected throughout your stay" },
      { icon: Clock, name: "24/7 Front Desk", description: "Round-the-clock assistance" },
      { icon: ShieldCheck, name: "24/7 Security", description: "Your safety is our priority" },
      { icon: Car, name: "Free Parking", description: "Secure parking for all guests" },
      { icon: Phone, name: "Room Service", description: "Available 24 hours a day" },
      { icon: Wind, name: "Air Conditioning", description: "Climate control in all rooms" },
    ]
  },
  {
    title: "Dining & Refreshments",
    description: "Culinary experiences to delight your palate",
    amenities: [
      { icon: Utensils, name: "Multi-Cuisine Restaurant", description: "Local and international dishes" },
      { icon: Coffee, name: "Coffee & Pastry Shop", description: "Fresh coffee and baked goods" },
      { icon: Wine, name: "On the Rocks Bar", description: "Signature cocktails and beverages" },
      { icon: Utensils, name: "Buffet Breakfast", description: "Complimentary breakfast included" },
    ]
  },
  {
    title: "Recreation & Wellness",
    description: "Relax, rejuvenate, and stay active",
    amenities: [
      { icon: Waves, name: "Swimming Pool", description: "Outdoor pool with lounge area" },
      { icon: Dumbbell, name: "Fitness Center", description: "Modern gym equipment" },
      { icon: Sparkles, name: "Spa & Wellness", description: "Massage and beauty treatments" },
      { icon: Users, name: "Billiard Board", description: "Entertainment and games" },
    ]
  },
  {
    title: "Business & Events",
    description: "Professional spaces for work and celebrations",
    amenities: [
      { icon: Briefcase, name: "Conference Rooms", description: "Fully equipped meeting spaces" },
      { icon: Users, name: "Event Spaces", description: "Perfect for weddings and celebrations" },
      { icon: Wifi, name: "Business Center", description: "Printing and office services" },
      { icon: Tv, name: "AV Equipment", description: "Projectors and sound systems" },
    ]
  },
  {
    title: "Additional Services",
    description: "Extra touches to enhance your experience",
    amenities: [
      { icon: Car, name: "Airport Shuttle", description: "Convenient airport transfers" },
      { icon: Shirt, name: "Laundry & Dry Cleaning", description: "Same-day service available" },
      { icon: Baby, name: "Childcare Services", description: "Professional babysitting" },
      { icon: MapPin, name: "Tour Arrangements", description: "Explore local attractions" },
    ]
  }
];

const featuredAmenities = [
  {
    image: "/hero.jpg",
    title: "Swimming Pool",
    description: "Relax by our outdoor pool with comfortable loungers and refreshing drinks from our poolside bar."
  },
  {
    image: "/hero.jpg",
    title: "Restaurant",
    description: "Experience authentic Ghanaian cuisine alongside international favorites in our elegant dining space."
  },
  {
    image: "/hero.jpg",
    title: "Spa & Wellness",
    description: "Indulge in rejuvenating treatments and massages in our tranquil spa environment."
  },
  {
    image: "/hero.jpg",
    title: "Conference Facilities",
    description: "Host successful meetings and events in our modern, fully-equipped conference rooms."
  }
];

export default function AmenitiesPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          <Image
            src="/hero.jpg"
            alt="Hotel Amenities"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 sm:px-10">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
              Amenities & Services
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Everything You Need for a Perfect Stay
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90">
              From essential comforts to luxury indulgences, discover the amenities that make Northern Capital Hotel your home away from home.
            </p>
          </div>
        </section>

        {/* Featured Amenities */}
        <section className="px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
                Featured Facilities
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                Signature Experiences
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {featuredAmenities.map((amenity, index) => (
                <div
                  key={index}
                  className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={amenity.image}
                      alt={amenity.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-black">
                      {amenity.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/70">
                      {amenity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Amenities */}
        <section className="bg-gray-50 px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl space-y-16">
            {amenitiesCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-black">
                    {category.title}
                  </h2>
                  <p className="mt-2 text-sm text-black/70">
                    {category.description}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="group flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#01a4ff]/60 hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#01a4ff]/10 transition-colors group-hover:bg-[#01a4ff]/20">
                        <amenity.icon className="h-6 w-6 text-[#01a4ff]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">
                          {amenity.name}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-black/60">
                          {amenity.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Room Amenities */}
        <section className="px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
                In Every Room
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                Standard Room Features
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[
                "Air Conditioning",
                "Flat-screen TV",
                "Mini Fridge",
                "Work Desk",
                "Free WiFi",
                "Safe Box",
                "Tea/Coffee Maker",
                "Hair Dryer",
                "Iron & Board",
                "Complimentary Toiletries",
                "Daily Housekeeping",
                "Blackout Curtains"
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-4 py-3 text-sm text-black/70"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#01a4ff]" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-neutral-900 px-6 py-16 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to Experience Our Amenities?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Book your stay today and enjoy all the comforts and conveniences Northern Capital Hotel has to offer.
            </p>
            <div className="mt-8">
              <a
                href="/rooms"
                className="inline-block rounded-full bg-[#01a4ff] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0084cc]"
              >
                Book Now
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
