"use client";

import { useState } from "react";
import Image from "next/image";
import { Header } from "@/components/sections/Header";
import { GoogleMapWithDirections } from "@/components/GoogleMapWithDirections";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitStatus("success");

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setSubmitStatus("idle");
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <Header />
      <main className="bg-white">
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          <Image
            src="/hotel-images/27.JPG"
            alt="Contact Northern Capital Hotel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 sm:px-10">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#01a4ff]">
              Get In Touch
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Contact Us
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90">
              We're here to help. Reach out to us for reservations, inquiries, or any assistance you need.
            </p>
          </div>
        </section>

        {/* Contact Information & Form */}
        <section className="px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
              {/* Contact Information */}
              <div className="space-y-8 lg:col-span-2">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-black">
                    Contact Information
                  </h2>
                  <p className="mt-2 text-sm text-black/70">
                    Feel free to reach out through any of these channels
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                      <MapPin className="h-6 w-6 text-[#01a4ff]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Address</h3>
                      <p className="mt-1 text-sm text-black/70">
                        Savelugu, Northern Region<br />
                        Ghana
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                      <Phone className="h-6 w-6 text-[#01a4ff]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Phone</h3>
                      <p className="mt-1 text-sm text-black/70">
                        +233 (0) 538 514 700<br />
                        +233 (0) 538 424 430
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                      <Mail className="h-6 w-6 text-[#01a4ff]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Email</h3>
                      <p className="mt-1 text-sm text-black/70">
                        info@northerncapitalhotel.com<br />
                        reservations@northerncapitalhotel.com
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                      <Clock className="h-6 w-6 text-[#01a4ff]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Front Desk Hours</h3>
                      <p className="mt-1 text-sm text-black/70">
                        24/7 - We're always here for you
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="rounded-2xl border border-black/5 bg-gray-50 p-6">
                  <h3 className="font-semibold text-black">Quick Actions</h3>
                  <div className="mt-4 space-y-2">
                    <a
                      href="/rooms"
                      className="block rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-[#01a4ff]/5"
                    >
                      View Available Rooms
                    </a>
                    <a
                      href="/booking"
                      className="block rounded-xl bg-[#01a4ff] px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-[#0084cc]"
                    >
                      Make a Reservation
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                  <h2 className="text-2xl font-semibold tracking-tight text-black">
                    Send Us a Message
                  </h2>
                  <p className="mt-2 text-sm text-black/70">
                    Fill out the form below and we'll get back to you as soon as possible
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-black">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-black focus:border-[#01a4ff] focus:outline-none focus:ring-2 focus:ring-[#01a4ff]/20"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-black">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-black focus:border-[#01a4ff] focus:outline-none focus:ring-2 focus:ring-[#01a4ff]/20"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-black">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-black focus:border-[#01a4ff] focus:outline-none focus:ring-2 focus:ring-[#01a4ff]/20"
                          placeholder="+233 123 456 789"
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-black">
                          Subject *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-black focus:border-[#01a4ff] focus:outline-none focus:ring-2 focus:ring-[#01a4ff]/20"
                        >
                          <option value="">Select a subject</option>
                          <option value="reservation">Reservation Inquiry</option>
                          <option value="general">General Question</option>
                          <option value="feedback">Feedback</option>
                          <option value="event">Event Booking</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-black">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-black focus:border-[#01a4ff] focus:outline-none focus:ring-2 focus:ring-[#01a4ff]/20"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    {submitStatus === "success" && (
                      <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-800">
                        Thank you for your message! We'll get back to you soon.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#01a4ff] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0084cc] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section with Live Directions */}
        <section className="px-6 pb-16 sm:px-10 sm:pb-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-black">
                Find Us on the Map
              </h2>
              <p className="mt-2 text-sm text-black/70">
                Get live directions from your current location to Northern Capital Hotel
              </p>
            </div>
            <GoogleMapWithDirections />
          </div>
        </section>
      </main>
    </>
  );
}
