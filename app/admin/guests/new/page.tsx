"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface CreatedGuest {
  id: string;
  bookingReference: string;
  fullName: string;
  email: string;
  phone: string;
  roomTypeSlug: string;
  roomTypeName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  amountDue: number;
  amountPaid: number;
  change: number;
  paymentMethod: string;
  bookingStatus: string;
  createdAt: string;
}

interface RoomType {
  id: string;
  slug: string;
  name: string;
  description: string;
  pricePerNight: number;
  size: string;
  bedType: string;
  maxGuests: number;
  maxAdults: number;
  maxChildren: number;
  totalRooms: number;
  mainImage?: string;
}

interface Room {
  id: string;
  roomNumber: string;
  roomTypeSlug: string;
  roomTypeName: string;
  status: string;
  floor: number;
}

function formatDateLabel(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calculateNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function NewGuestPage() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayISO = today.toISOString().slice(0, 10);
  const tomorrowISO = tomorrow.toISOString().slice(0, 10);

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [roomTypeSlug, setRoomTypeSlug] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [checkIn, setCheckIn] = useState(todayISO);
  const [checkOut, setCheckOut] = useState(tomorrowISO);
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [specialRequests, setSpecialRequests] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaidInput, setAmountPaidInput] = useState("");

  const [createdGuests, setCreatedGuests] = useState<CreatedGuest[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const selectedType = roomTypes.find((room) => room.slug === roomTypeSlug);

  const nightsForSummary = calculateNights(checkIn, checkOut);
  const baseAmount = selectedType
    ? selectedType.pricePerNight * Math.max(1, nightsForSummary || 1)
    : 0;

  const paidPreviewRaw = Number(amountPaidInput || 0);
  const paidPreview =
    Number.isFinite(paidPreviewRaw) && !Number.isNaN(paidPreviewRaw)
      ? paidPreviewRaw
      : 0;
  const changePreview = paidPreview > baseAmount ? paidPreview - baseAmount : 0;
  const outstandingPreview = paidPreview < baseAmount ? baseAmount - paidPreview : 0;

  // Fetch room types on mount
  useEffect(() => {
    fetchRoomTypes();
  }, []);

  // Fetch available rooms when room type changes
  useEffect(() => {
    if (roomTypeSlug) {
      fetchAvailableRooms(roomTypeSlug);
    }
  }, [roomTypeSlug]);

  async function fetchRoomTypes() {
    try {
      const response = await fetch('/api/room-types');
      const data = await response.json();
      if (data.success && data.data.roomTypes) {
        setRoomTypes(data.data.roomTypes);
        if (data.data.roomTypes.length > 0) {
          setRoomTypeSlug(data.data.roomTypes[0].slug);
        }
      }
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      toast.error('Failed to load room types');
    }
  }

  async function fetchAvailableRooms(typeSlug: string) {
    setLoadingRooms(true);
    try {
      const response = await fetch(`/api/rooms?roomType=${typeSlug}&status=available`);
      const data = await response.json();
      if (data.success && data.data.rooms) {
        setAvailableRooms(data.data.rooms);
        // Auto-select first available room if any
        if (data.data.rooms.length > 0 && !roomNumber) {
          setRoomNumber(data.data.rooms[0].roomNumber);
        }
      }
    } catch (error) {
      console.error('Failed to fetch available rooms:', error);
      toast.error('Failed to load available rooms');
    } finally {
      setLoadingRooms(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedRoomNumber = roomNumber.trim();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!roomTypeSlug || !trimmedRoomNumber || !fullName) {
      toast.error("Please fill in guest name, room type and room number.");
      return;
    }

    const nights = calculateNights(checkIn, checkOut);
    const amountDue = selectedType
      ? selectedType.pricePerNight * Math.max(1, nights || 1)
      : 0;

    const paidRaw = Number(amountPaidInput || 0);
    const amountPaid =
      Number.isFinite(paidRaw) && !Number.isNaN(paidRaw) && paidRaw > 0
        ? paidRaw
        : 0;
    const change = amountPaid > amountDue ? amountPaid - amountDue : 0;

    setLoading(true);
    try {
      // Create booking via API
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Guest details
          guestFirstName: firstName.trim(),
          guestLastName: lastName.trim(),
          guestEmail: email.trim() || `walkin.${Date.now()}@hotel.local`,
          guestPhone: phone.trim() || 'Walk-in Guest',
          guestCountry: country,
          specialRequests: specialRequests,
          
          // Room details
          roomSlug: roomTypeSlug,
          roomName: selectedType?.name || '',
          roomImage: selectedType?.mainImage || '/hero.jpg',
          pricePerNight: selectedType?.pricePerNight || 0,
          numberOfRooms: 1,
          roomNumber: trimmedRoomNumber,
          
          // Dates
          checkIn,
          checkOut,
          nights,
          
          // Guests
          adults: Number(adults || 1),
          children: Number(children || 0),
          totalGuests: Number(adults || 1) + Number(children || 0),
          
          // Payment
          totalAmount: amountDue,
          paymentMethod: paymentMethod,
          paymentStatus: amountPaid >= amountDue ? 'paid' : 'pending',
          bookingStatus: amountPaid >= amountDue ? 'confirmed' : 'pending',
          bookingSource: 'walk_in',
        }),
      });

      const data = await response.json();

      if (data.success) {
        const booking = data.data.booking;
        
        // Mark room as occupied if payment is complete
        if (amountPaid >= amountDue) {
          await updateRoomStatus(trimmedRoomNumber, 'occupied');
        }

        const newGuest: CreatedGuest = {
          id: booking.id,
          bookingReference: booking.bookingReference,
          fullName,
          email: email.trim(),
          phone: phone.trim(),
          roomTypeSlug,
          roomTypeName: selectedType?.name || '',
          roomNumber: trimmedRoomNumber,
          checkIn,
          checkOut,
          adults: Number(adults || 0),
          children: Number(children || 0),
          amountDue,
          amountPaid,
          change,
          paymentMethod,
          bookingStatus: booking.bookingStatus,
          createdAt: new Date().toISOString(),
        };

        setCreatedGuests((prev) => [newGuest, ...prev]);
        toast.success('Guest booking created successfully!');
        
        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setAmountPaidInput('');
        setSpecialRequests('');
        
        // Refresh available rooms
        fetchAvailableRooms(roomTypeSlug);
      } else {
        toast.error(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function updateRoomStatus(roomNum: string, status: string) {
    try {
      // Find the room and update its status
      const room = availableRooms.find(r => r.roomNumber === roomNum);
      if (room) {
        // You would need to create this endpoint or use existing room update API
        console.log(`Room ${roomNum} marked as ${status}`);
      }
    } catch (error) {
      console.error('Failed to update room status:', error);
    }
  }

  function handlePrintReceipt(guestId: string) {
    if (typeof window === "undefined") return;

    const guest = createdGuests.find((g) => g.id === guestId);
    if (!guest) return;

    const nights = calculateNights(guest.checkIn, guest.checkOut);
    const amountDue = guest.amountDue;
    const amountPaid = guest.amountPaid;
    const change = guest.change;
    const outstanding = amountPaid < amountDue ? amountDue - amountPaid : 0;

    const paymentLabel =
      guest.paymentMethod === "cash"
        ? "Cash"
        : guest.paymentMethod === "card"
        ? "Card"
        : guest.paymentMethod === "mobile_money"
        ? "Mobile money"
        : guest.paymentMethod === "bank_transfer"
        ? "Bank transfer"
        : guest.paymentMethod;

    const checkInLabel = formatDateLabel(guest.checkIn);
    const checkOutLabel = formatDateLabel(guest.checkOut);
    const createdAt = guest.createdAt
      ? new Date(guest.createdAt).toLocaleString()
      : new Date().toLocaleString();

    const win = window.open("", "_blank", "width=320,height=700");
    if (!win) return;

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <title>Guest Receipt - ${guest.bookingReference}</title>
    <style>
      @page { margin: 0; size: 80mm 297mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Courier New', monospace;
        width: 80mm;
        padding: 5mm;
        background: #fff;
        color: #000;
      }
      .receipt { width: 100%; }
      .header { text-align: center; margin-bottom: 3mm; }
      .logo { font-size: 16px; font-weight: bold; letter-spacing: -0.5px; }
      .subtitle { font-size: 10px; margin-top: 1mm; }
      .divider { border-top: 1px dashed #000; margin: 2mm 0; }
      .divider-thick { border-top: 2px solid #000; margin: 2mm 0; }
      .row { display: flex; justify-content: space-between; font-size: 10px; line-height: 1.4; }
      .label { text-align: left; }
      .value { text-align: right; font-weight: bold; }
      .section { margin: 2mm 0; }
      .section-title { font-size: 11px; font-weight: bold; margin-bottom: 1mm; text-transform: uppercase; }
      .total-row { font-size: 12px; font-weight: bold; margin: 2mm 0; }
      .footer { text-align: center; margin-top: 3mm; font-size: 9px; }
      .barcode { text-align: center; font-size: 8px; margin: 2mm 0; font-family: 'Libre Barcode 39', monospace; }
      .qr-placeholder { width: 25mm; height: 25mm; margin: 2mm auto; border: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 8px; }
      @media print { body { width: 80mm; } }
    </style>
  </head>
  <body>
    <div class="receipt">
      <!-- Header -->
      <div class="header">
        <div class="logo">NORTHERN CAPITAL HOTEL</div>
        <div class="subtitle">★ ★ ★ ★ ★</div>
        <div class="subtitle" style="margin-top: 2mm;">
          123 Independence Avenue<br>
          Tamale, Northern Region<br>
          Tel: +233 XX XXX XXXX
        </div>
      </div>
      
      <div class="divider-thick"></div>
      
      <!-- Receipt Type -->
      <div class="header" style="margin: 2mm 0;">
        <div style="font-size: 12px; font-weight: bold;">GUEST RECEIPT</div>
        <div style="font-size: 9px; margin-top: 1mm;">REF: ${guest.bookingReference}</div>
      </div>
      
      <div class="divider"></div>
      
      <!-- Guest Information -->
      <div class="section">
        <div class="section-title">Guest Details</div>
        <div class="row">
          <span class="label">Name:</span>
          <span class="value">${guest.fullName || "Walk-in Guest"}</span>
        </div>
        ${guest.phone ? `
        <div class="row">
          <span class="label">Phone:</span>
          <span class="value">${guest.phone}</span>
        </div>` : ''}
        ${guest.email && !guest.email.includes('@hotel.local') ? `
        <div class="row">
          <span class="label">Email:</span>
          <span class="value" style="font-size: 9px;">${guest.email}</span>
        </div>` : ''}
      </div>
      
      <div class="divider"></div>
      
      <!-- Room Information -->
      <div class="section">
        <div class="section-title">Accommodation</div>
        <div class="row">
          <span class="label">Room Type:</span>
          <span class="value">${guest.roomTypeName}</span>
        </div>
        <div class="row">
          <span class="label">Room Number:</span>
          <span class="value">${guest.roomNumber}</span>
        </div>
        <div class="row">
          <span class="label">Check-in:</span>
          <span class="value">${new Date(guest.checkIn).toLocaleDateString()}</span>
        </div>
        <div class="row">
          <span class="label">Check-out:</span>
          <span class="value">${new Date(guest.checkOut).toLocaleDateString()}</span>
        </div>
        <div class="row">
          <span class="label">Nights:</span>
          <span class="value">${nights}</span>
        </div>
        <div class="row">
          <span class="label">Guests:</span>
          <span class="value">${guest.adults}A${guest.children > 0 ? ` + ${guest.children}C` : ''}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- Payment Details -->
      <div class="section">
        <div class="section-title">Payment Summary</div>
        <div class="row">
          <span class="label">Room Rate:</span>
          <span class="value">₵${(amountDue/nights).toFixed(2)}</span>
        </div>
        <div class="row">
          <span class="label">× ${nights} Night${nights > 1 ? 's' : ''}:</span>
          <span class="value">₵${amountDue.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="divider-thick"></div>
      
      <div class="total-row row">
        <span>TOTAL DUE:</span>
        <span>₵${amountDue.toFixed(2)}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="section">
        <div class="row">
          <span class="label">Payment Method:</span>
          <span class="value">${paymentLabel}</span>
        </div>
        <div class="row">
          <span class="label">Amount Paid:</span>
          <span class="value">₵${amountPaid.toFixed(2)}</span>
        </div>
        ${change > 0 ? `
        <div class="row">
          <span class="label">Change Given:</span>
          <span class="value">₵${change.toFixed(2)}</span>
        </div>` : ''}
        ${outstanding > 0 ? `
        <div class="row" style="color: #dc2626;">
          <span class="label">Outstanding:</span>
          <span class="value">₵${outstanding.toFixed(2)}</span>
        </div>` : ''}
      </div>
      
      <div class="divider"></div>
      
      <!-- Status -->
      <div class="section">
        <div class="row">
          <span class="label">Booking Status:</span>
          <span class="value">${guest.bookingStatus.toUpperCase()}</span>
        </div>
        <div class="row">
          <span class="label">Date/Time:</span>
          <span class="value">${createdAt}</span>
        </div>
        <div class="row">
          <span class="label">Staff:</span>
          <span class="value">Reception</span>
        </div>
      </div>
      
      <div class="divider-thick"></div>
      
      <!-- Footer -->
      <div class="footer">
        <div style="margin-bottom: 2mm; font-weight: bold;">Thank You for Choosing</div>
        <div>NORTHERN CAPITAL HOTEL</div>
        <div style="margin-top: 2mm;">www.northerncapitalhotel.com</div>
        <div style="margin-top: 3mm; font-size: 8px;">GST/VAT Reg: GH123456789</div>
        <div style="margin-top: 1mm; font-size: 8px;">Terms & Conditions Apply</div>
      </div>
      
      <!-- Cut Line -->
      <div style="margin-top: 5mm; text-align: center; font-size: 8px;">
        <div>- - - - - - - - - - - - - - - -</div>
        <div style="margin-top: 1mm;">CUSTOMER COPY</div>
      </div>
    </div>
  </body>
</html>`;

    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">New guest</h1>
                <p className="mt-1 text-sm text-gray-500">
                  For receptionists to quickly record a walk-in guest and assign a room.
                </p>
              </div>
            </div>

            {/* Main layout: form + summary */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: form */}
              <section className="lg:col-span-2 space-y-4">
                {/* Stay details */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-sm font-semibold text-gray-900">
                    Stay details
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Room type
                      </label>
                      <select
                        value={roomTypeSlug}
                        onChange={(event) => setRoomTypeSlug(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select room type</option>
                        {roomTypes.map((room) => (
                          <option key={room.slug} value={room.slug}>
                            {room.name} (₵{room.pricePerNight}/night)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Room number {loadingRooms && "(Loading...)"}
                      </label>
                      {availableRooms.length > 0 ? (
                        <select
                          value={roomNumber}
                          onChange={(event) => setRoomNumber(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                          disabled={loadingRooms}
                        >
                          <option value="">Select a room</option>
                          {availableRooms.map((room) => (
                            <option key={room.id} value={room.roomNumber}>
                              Room {room.roomNumber} (Floor {room.floor})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                          {loadingRooms ? "Loading available rooms..." : "No available rooms for this type"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Check-in date
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(event) => setCheckIn(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Check-out date
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(event) => setCheckOut(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Adults
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={adults}
                        onChange={(event) => setAdults(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Children
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={children}
                        onChange={(event) => setChildren(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Guest details */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-sm font-semibold text-gray-900">
                    Guest details
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">
                          First name
                        </label>
                        <input
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">
                          Last name
                        </label>
                        <input
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">
                          Email (optional)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">
                          Phone number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-medium text-gray-700">
                          Country
                        </label>
                        <select
                          value={country}
                          onChange={(event) => setCountry(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="Ghana">Ghana</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="South Africa">South Africa</option>
                          <option value="Kenya">Kenya</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-medium text-gray-700">
                          Special requests
                        </label>
                        <textarea
                          value={specialRequests}
                          onChange={(event) => setSpecialRequests(event.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                          placeholder="Any preferences or notes for this guest..."
                        />
                      </div>
                    </div>

                    {/* Payment details */}
                    <div className="mt-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-600">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Front desk payment
                      </p>
                      <div className="grid gap-3 md:grid-cols-3 md:items-end">
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-medium text-gray-700">
                            Payment method
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: "cash", label: "Cash" },
                              { id: "mobile_money", label: "MoMo" },
                              { id: "card", label: "Card" },
                              { id: "bank_transfer", label: "Bank" },
                            ].map((method) => (
                              <button
                                key={method.id}
                                type="button"
                                onClick={() => setPaymentMethod(method.id)}
                                className={`rounded-full border px-2 py-1 text-[11px] font-medium transition-colors ${
                                  paymentMethod === method.id
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                }`}
                              >
                                {method.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-gray-700">
                            Amount due (approx.)
                          </label>
                          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900">
                            ₵{baseAmount.toLocaleString()}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-gray-700">
                            Amount received
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={amountPaidInput}
                            onChange={(event) => setAmountPaidInput(event.target.value)}
                            placeholder="e.g. 1200"
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
                        <span>
                          Change: <span className="font-semibold text-gray-800">₵{changePreview.toLocaleString()}</span>
                        </span>
                        {outstandingPreview > 0 && (
                          <span>
                            Outstanding: <span className="font-semibold text-amber-700">₵{outstandingPreview.toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {status && (
                        <p className="text-xs text-emerald-600 max-w-xs">
                          {status}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={loading || !roomNumber || availableRooms.length === 0}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Creating booking..." : "Add guest"}
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* Right: summary */}
              <section className="space-y-4">
                {/* Selected room type summary */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 text-sm font-semibold text-gray-900">
                    Stay overview
                  </h2>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedType?.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Room {roomNumber || "—"} · {selectedType?.size} · {selectedType?.bedType}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {checkIn && checkOut
                      ? `${formatDateLabel(checkIn)} → ${formatDateLabel(checkOut)}`
                      : "Select dates"}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {Number(adults || 0) + Number(children || 0)} guests · {calculateNights(checkIn, checkOut)} nights
                  </p>
                  <p className="mt-3 text-sm font-semibold text-blue-600">
                    From ₵
                    {selectedType
                      ? (selectedType.pricePerNight * Math.max(1, calculateNights(checkIn, checkOut))).toLocaleString()
                      : "0"}
                  </p>
                </div>

                {/* Guests created in this session */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Guests in this session
                    </h2>
                    <span className="text-[11px] text-gray-400">
                      {createdGuests.length} added
                    </span>
                  </div>

                  {createdGuests.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      New guests added by reception will appear here.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {createdGuests.map((guest) => {
                        const nights = calculateNights(guest.checkIn, guest.checkOut);
                        return (
                          <div
                            key={guest.id}
                            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {guest.fullName || "Walk-in guest"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Room {guest.roomNumber} · {guest.roomTypeName}
                              </p>
                              <p className="mt-0.5 text-[11px] text-gray-400">
                                {formatDateLabel(guest.checkIn)} → {formatDateLabel(guest.checkOut)} · {nights} nights
                              </p>
                            </div>
                            <div className="text-right text-[11px] text-gray-500">
                              <p>
                                {guest.adults} adults · {guest.children} children
                              </p>
                              <p className="mt-1 font-semibold text-blue-600">
                                ₵{guest.amountDue.toLocaleString()}
                              </p>
                              {guest.amountPaid > 0 && (
                                <p className="mt-0.5 text-[10px] text-gray-500">
                                  Paid ₵{guest.amountPaid.toLocaleString()} · Change ₵
                                  {guest.change.toLocaleString()}
                              </p>
                              )}
                              <button
                                type="button"
                                onClick={() => handlePrintReceipt(guest.id)}
                                className="mt-1 inline-flex items-center justify-center rounded-full border border-gray-300 px-2 py-0.5 text-[10px] font-medium text-gray-700 hover:bg-gray-100"
                              >
                                Print receipt
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
