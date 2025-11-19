'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white text-black">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hotel Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#01a4ff] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">NCH</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Northern Capital</h3>
                <p className="text-sm text-black/60">Hotel</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-black/70">
              Experience luxury and comfort in the heart of Tamale. Your premier destination for exceptional hospitality and modern amenities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-black/60 transition-colors hover:text-[#01a4ff]">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-black/60 transition-colors hover:text-[#01a4ff]">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-black/60 transition-colors hover:text-[#01a4ff]">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-black/60 transition-colors hover:text-[#01a4ff]">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-black">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-black/70 transition-colors hover:text-[#01a4ff]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="text-sm text-black/70 transition-colors hover:text-[#01a4ff]">
                  Rooms & Suites
                </Link>
              </li>
              <li>
                <Link href="/amenities" className="text-sm text-black/70 transition-colors hover:text-[#01a4ff]">
                  Amenities
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-black/70 transition-colors hover:text-[#01a4ff]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-black/70 transition-colors hover:text-[#01a4ff]">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-sm text-black/70 transition-colors hover:text-[#01a4ff]">
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-black">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-[#01a4ff] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-black/70">
                    123 Central Business District<br />
                    Tamale, Northern Region<br />
                    Ghana
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-[#01a4ff] flex-shrink-0" />
                <p className="text-sm text-black/70">+233 (0) 372 123 456</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-[#01a4ff] flex-shrink-0" />
                <p className="text-sm text-black/70">info@northerncapitalhotel.com</p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock size={16} className="text-[#01a4ff] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-black/70">
                    24/7 Front Desk<br />
                    Check-in: 3:00 PM<br />
                    Check-out: 12:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-black">Stay Updated</h4>
            <p className="text-sm text-black/70">
              Subscribe to our newsletter for exclusive offers and updates.
            </p>
            <div className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-l-md border border-black/10 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#01a4ff] focus:border-transparent"
                />
                <button className="rounded-r-md bg-[#01a4ff] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0084cc]">
                  Subscribe
                </button>
              </div>
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-black">Services</h5>
                <ul className="space-y-1 text-xs text-black/60">
                  <li>• Free WiFi</li>
                  <li>• Airport Shuttle</li>
                  <li>• Restaurant & Bar</li>
                  <li>• Conference Rooms</li>
                  <li>• Fitness Center</li>
                  <li>• Swimming Pool</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-black/5">
        <div className="mx-auto max-w-6xl px-6 py-6 sm:px-10">
          <div className="flex flex-col items-center justify-between space-y-4 text-xs text-black/60 md:flex-row md:space-y-0">
            <div>
              &copy; 2024 Northern Capital Hotel. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="transition-colors hover:text-[#01a4ff]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-[#01a4ff]">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="transition-colors hover:text-[#01a4ff]">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
