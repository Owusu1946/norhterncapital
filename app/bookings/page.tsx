"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";
import { Header } from "@/components/sections/Header";
import { BookingReceipt } from "@/components/BookingReceipt";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Mail,
  Phone,
  RefreshCw
} from "lucide-react";

interface Booking {
  id: string;
  bookingReference: string;
  roomName: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalAmount: number;
  status: "confirmed" | "cancelled" | "completed";
  paymentStatus: "paid" | "pending" | "refunded";
  createdAt: string;
  services?: string[];
  checkInStatus: "not-checked-in" | "checked-in" | "checked-out";
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
}

// Mock data - Replace with actual API call
const mockBookings: Booking[] = [
  {
    id: "1",
    bookingReference: "NCH-2024-001",
    roomName: "Deluxe Room",
    roomImage: "/hero.jpg",
    checkIn: "2025-11-25",
    checkOut: "2025-11-28",
    guests: 2,
    rooms: 1,
    totalAmount: 780,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: "2024-11-15",
    services: ["Airport Pickup", "Breakfast"],
    checkInStatus: "not-checked-in"
  },
  {
    id: "2",
    bookingReference: "NCH-2024-002",
    roomName: "Family Room",
    roomImage: "/hero.jpg",
    checkIn: "2025-12-20",
    checkOut: "2025-12-25",
    guests: 4,
    rooms: 1,
    totalAmount: 1300,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: "2024-11-10",
    services: ["Spa Package", "Dinner Package"],
    checkInStatus: "not-checked-in"
  },
  {
    id: "5",
    bookingReference: "NCH-2024-005",
    roomName: "Executive Suite",
    roomImage: "/hero.jpg",
    checkIn: "2024-11-18",
    checkOut: "2024-11-22",
    guests: 2,
    rooms: 1,
    totalAmount: 950,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: "2024-11-05",
    services: ["Airport Pickup", "Spa Package"],
    checkInStatus: "checked-in",
    actualCheckInTime: "2024-11-18T15:45:00"
  },
  {
    id: "3",
    bookingReference: "NCH-2024-003",
    roomName: "Standard Room",
    roomImage: "/hero.jpg",
    checkIn: "2024-10-15",
    checkOut: "2024-10-18",
    guests: 2,
    rooms: 1,
    totalAmount: 520,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2024-10-01",
    checkInStatus: "checked-out",
    actualCheckInTime: "2024-10-15T15:30:00",
    actualCheckOutTime: "2024-10-18T11:45:00"
  },
  {
    id: "4",
    bookingReference: "NCH-2024-004",
    roomName: "Suite",
    roomImage: "/hero.jpg",
    checkIn: "2024-09-05",
    checkOut: "2024-09-08",
    guests: 2,
    rooms: 1,
    totalAmount: 1200,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2024-08-20",
    checkInStatus: "checked-out",
    actualCheckInTime: "2024-09-05T14:15:00",
    actualCheckOutTime: "2024-09-08T10:30:00"
  }
];

export default function BookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${selectedBookingForReceipt?.bookingReference}`,
    onAfterPrint: () => setSelectedBookingForReceipt(null),
  });

  // Detect if user is on mobile
  const isMobile = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const handleDownloadReceipt = (booking: Booking) => {
    if (isMobile()) {
      // For mobile, open receipt in a new window that can be saved as PDF
      setSelectedBookingForReceipt(booking);
      setTimeout(() => {
        if (receiptRef.current) {
          const receiptContent = receiptRef.current.innerHTML;
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Receipt - ${booking.bookingReference}</title>
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      padding: 20px;
                      background: #f9fafb;
                    }
                    @media print {
                      body { background: white; }
                    }
                  </style>
                </head>
                <body>
                  ${receiptContent}
                  <div style="margin-top: 30px; text-align: center;">
                    <button 
                      onclick="window.print()" 
                      style="
                        background: #01a4ff;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-right: 10px;
                      "
                    >
                      Print / Save as PDF
                    </button>
                    <button 
                      onclick="window.close()" 
                      style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                      "
                    >
                      Close
                    </button>
                  </div>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
        }
        setSelectedBookingForReceipt(null);
      }, 100);
    } else {
      // For desktop, use react-to-print
      setSelectedBookingForReceipt(booking);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setBookings(mockBookings);
      setIsLoadingBookings(false);
    }, 1000);
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (selectedBookingForReceipt && receiptRef.current && !isMobile()) {
      handlePrint();
    }
  }, [selectedBookingForReceipt, handlePrint]);

  const upcomingBookings = bookings.filter(booking => {
    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    return checkInDate >= today && booking.status === "confirmed";
  });

  const pastBookings = bookings.filter(booking => {
    const checkOutDate = new Date(booking.checkOut);
    const today = new Date();
    return checkOutDate < today || booking.status === "completed" || booking.status === "cancelled";
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getCheckInStatusColor = (checkInStatus: string) => {
    switch (checkInStatus) {
      case "checked-in":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "checked-out":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "not-checked-in":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getCheckInStatusText = (checkInStatus: string) => {
    switch (checkInStatus) {
      case "checked-in":
        return "Checked In";
      case "checked-out":
        return "Checked Out";
      case "not-checked-in":
        return "Not Checked In";
      default:
        return "Unknown";
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const handleRebook = (booking: Booking) => {
    // Calculate new dates (starting from tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nights = calculateNights(booking.checkIn, booking.checkOut);
    const newCheckOut = new Date(tomorrow);
    newCheckOut.setDate(newCheckOut.getDate() + nights);

    // Format dates for URL
    const checkInDate = tomorrow.toISOString().split('T')[0];
    const checkOutDate = newCheckOut.toISOString().split('T')[0];

    // Build query parameters with booking details
    const params = new URLSearchParams({
      roomName: booking.roomName,
      roomImage: booking.roomImage,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: booking.guests.toString(),
      children: '0',
      guests: booking.guests.toString(),
      rooms: booking.rooms.toString(),
      price: (booking.totalAmount / nights).toString(),
      rebook: 'true'
    });

    // Redirect to booking page with pre-filled data
    router.push(`/booking?${params.toString()}`);
  };

  const handleContactHotel = (booking: Booking) => {
    const subject = `Inquiry about Booking ${booking.bookingReference}`;
    const body = `Dear Northern Capital Hotel,\n\nI would like to inquire about my booking:\n\nBooking Reference: ${booking.bookingReference}\nRoom: ${booking.roomName}\nCheck-in: ${formatDate(booking.checkIn)}\nCheck-out: ${formatDate(booking.checkOut)}\n\nMy question:\n\n[Please type your question here]\n\nBest regards,\n${user?.firstName} ${user?.lastName}`;
    
    // Open email client
    window.location.href = `mailto:reservations@northerncapitalhotel.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);

    try {
      // TODO: Call API to cancel booking
      // const response = await fetch(`/api/bookings/${bookingToCancel.id}/cancel`, {
      //   method: 'POST',
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingToCancel.id
            ? { ...booking, status: "cancelled" as const }
            : booking
        )
      );

      setShowCancelModal(false);
      setBookingToCancel(null);
      
      // Show success message (you can add a toast notification here)
      alert('Booking cancelled successfully. A refund will be processed within 5-7 business days.');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again or contact support.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white px-6 py-12 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-black">
                  My Bookings
                </h1>
                <p className="mt-2 text-sm text-black/70">
                  Manage your reservations at Northern Capital Hotel
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="rounded-2xl border border-black/5 bg-gray-50 p-4">
                  <p className="text-xs text-black/60">Total Bookings</p>
                  <p className="mt-1 text-2xl font-semibold text-black">{bookings.length}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8 flex gap-2 border-b border-black/5">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "upcoming"
                    ? "border-b-2 border-[#01a4ff] text-[#01a4ff]"
                    : "text-black/60 hover:text-black"
                }`}
              >
                Upcoming ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "past"
                    ? "border-b-2 border-[#01a4ff] text-[#01a4ff]"
                    : "text-black/60 hover:text-black"
                }`}
              >
                Past ({pastBookings.length})
              </button>
            </div>
          </div>
        </section>

        {/* Bookings List */}
        <section className="px-6 py-8 sm:px-10">
          <div className="mx-auto max-w-6xl">
            {isLoadingBookings ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#01a4ff] border-t-transparent"></div>
                  <p className="mt-4 text-sm text-black/60">Loading your bookings...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(activeTab === "upcoming" ? upcomingBookings : pastBookings).length === 0 ? (
                  <div className="rounded-3xl border border-black/5 bg-white p-12 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-black/20" />
                    <h3 className="mt-4 text-lg font-semibold text-black">
                      No {activeTab} bookings
                    </h3>
                    <p className="mt-2 text-sm text-black/60">
                      {activeTab === "upcoming"
                        ? "You don't have any upcoming reservations."
                        : "You don't have any past bookings."}
                    </p>
                    {activeTab === "upcoming" && (
                      <a
                        href="/rooms"
                        className="mt-6 inline-block rounded-full bg-[#01a4ff] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0084cc]"
                      >
                        Browse Rooms
                      </a>
                    )}
                  </div>
                ) : (
                  (activeTab === "upcoming" ? upcomingBookings : pastBookings).map((booking) => (
                    <div
                      key={booking.id}
                      className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr]">
                        {/* Room Image */}
                        <div className="relative h-48 overflow-hidden rounded-2xl md:h-auto">
                          <Image
                            src={booking.roomImage}
                            alt={booking.roomName}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Booking Details */}
                        <div className="flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-semibold text-black">
                                  {booking.roomName}
                                </h3>
                                <p className="mt-1 text-sm text-black/60">
                                  Booking Ref: {booking.bookingReference}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                                    booking.status
                                  )}`}
                                >
                                  {getStatusIcon(booking.status)}
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getCheckInStatusColor(
                                    booking.checkInStatus
                                  )}`}
                                >
                                  {booking.checkInStatus === "checked-in" && <CheckCircle className="h-3.5 w-3.5" />}
                                  {booking.checkInStatus === "checked-out" && <CheckCircle className="h-3.5 w-3.5" />}
                                  {booking.checkInStatus === "not-checked-in" && <Clock className="h-3.5 w-3.5" />}
                                  {getCheckInStatusText(booking.checkInStatus)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                                  <Calendar className="h-5 w-5 text-[#01a4ff]" />
                                </div>
                                <div>
                                  <p className="text-xs text-black/60">Check-in</p>
                                  <p className="mt-0.5 text-sm font-medium text-black">
                                    {formatDate(booking.checkIn)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                                  <Calendar className="h-5 w-5 text-[#01a4ff]" />
                                </div>
                                <div>
                                  <p className="text-xs text-black/60">Check-out</p>
                                  <p className="mt-0.5 text-sm font-medium text-black">
                                    {formatDate(booking.checkOut)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                                  <Clock className="h-5 w-5 text-[#01a4ff]" />
                                </div>
                                <div>
                                  <p className="text-xs text-black/60">Duration</p>
                                  <p className="mt-0.5 text-sm font-medium text-black">
                                    {calculateNights(booking.checkIn, booking.checkOut)} nights
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                                  <Users className="h-5 w-5 text-[#01a4ff]" />
                                </div>
                                <div>
                                  <p className="text-xs text-black/60">Guests</p>
                                  <p className="mt-0.5 text-sm font-medium text-black">
                                    {booking.guests} guests, {booking.rooms} room
                                  </p>
                                </div>
                              </div>
                            </div>

                            {booking.services && booking.services.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs text-black/60">Additional Services</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {booking.services.map((service, index) => (
                                    <span
                                      key={index}
                                      className="rounded-full bg-gray-100 px-3 py-1 text-xs text-black/70"
                                    >
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Actual Check-in/Check-out Times */}
                            {(booking.actualCheckInTime || booking.actualCheckOutTime) && (
                              <div className="mt-4 rounded-2xl border border-black/5 bg-gray-50 p-4">
                                <p className="text-xs font-medium text-black/60">Reception Activity</p>
                                <div className="mt-3 space-y-2">
                                  {booking.actualCheckInTime && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="text-black/70">
                                        Checked in: <span className="font-medium text-black">{formatDateTime(booking.actualCheckInTime)}</span>
                                      </span>
                                    </div>
                                  )}
                                  {booking.actualCheckOutTime && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="h-4 w-4 text-blue-600" />
                                      <span className="text-black/70">
                                        Checked out: <span className="font-medium text-black">{formatDateTime(booking.actualCheckOutTime)}</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-4">
                            <div>
                              <p className="text-xs text-black/60">Total Amount</p>
                              <p className="mt-0.5 text-2xl font-semibold text-black">
                                ₵{booking.totalAmount.toFixed(2)}
                              </p>
                              <p className="mt-0.5 text-xs text-green-600">
                                {booking.paymentStatus === "paid" ? "✓ Paid" : "Pending"}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button 
                                onClick={() => handleDownloadReceipt(booking)}
                                className="flex items-center gap-2 rounded-2xl border border-black/10 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                              >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Download Receipt</span>
                                <span className="sm:hidden">Receipt</span>
                              </button>
                              {booking.status === "confirmed" && (
                                <>
                                  <button 
                                    onClick={() => handleContactHotel(booking)}
                                    className="flex items-center gap-2 rounded-2xl border border-black/10 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                  >
                                    <Mail className="h-4 w-4" />
                                    <span className="hidden sm:inline">Contact Hotel</span>
                                    <span className="sm:hidden">Contact</span>
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setBookingToCancel(booking);
                                      setShowCancelModal(true);
                                    }}
                                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 active:bg-red-200 touch-manipulation"
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                  >
                                    <span className="hidden sm:inline">Cancel Booking</span>
                                    <span className="sm:hidden">Cancel</span>
                                  </button>
                                </>
                              )}
                              {(booking.status === "completed" || booking.status === "cancelled") && activeTab === "past" && (
                                <button 
                                  onClick={() => handleRebook(booking)}
                                  className="flex items-center gap-2 rounded-2xl border border-[#01a4ff] bg-[#01a4ff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0084cc] active:bg-[#006699] touch-manipulation"
                                  style={{ WebkitTapHighlightColor: 'transparent' }}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  <span className="hidden sm:inline">Book Again</span>
                                  <span className="sm:hidden">Rebook</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* Help Section */}
        <section className="bg-white px-6 py-12 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl border border-black/5 bg-gray-50 p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-black">Need Help?</h3>
                  <p className="mt-2 text-sm text-black/70">
                    Our team is here to assist you with any questions about your bookings.
                  </p>
                  <div className="mt-6 space-y-3">
                    <a
                      href="tel:+233372123456"
                      className="flex items-center gap-3 text-sm text-black/70 transition-colors hover:text-[#01a4ff]"
                    >
                      <Phone className="h-4 w-4" />
                      +233 (0) 372 123 456
                    </a>
                    <a
                      href="mailto:reservations@northerncapitalhotel.com"
                      className="flex items-center gap-3 text-sm text-black/70 transition-colors hover:text-[#01a4ff]"
                    >
                      <Mail className="h-4 w-4" />
                      reservations@northerncapitalhotel.com
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Cancellation Policy</h3>
                  <p className="mt-2 text-sm text-black/70">
                    Free cancellation up to 48 hours before check-in. Cancellations made within 48
                    hours will incur a one-night charge.
                  </p>
                  <a
                    href="/contact"
                    className="mt-4 inline-block text-sm font-medium text-[#01a4ff] hover:text-[#0084cc]"
                  >
                    View Full Policy →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Hidden Receipt Component for Printing */}
      {selectedBookingForReceipt && user && (
        <div style={{ display: "none" }}>
          <BookingReceipt
            ref={receiptRef}
            booking={selectedBookingForReceipt}
            guestDetails={{
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
            }}
          />
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900">Cancel Booking?</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Are you sure you want to cancel your booking for <span className="font-semibold">{bookingToCancel.roomName}</span>?
            </p>
            
            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Reference:</span>
                  <span className="font-medium text-gray-900">{bookingToCancel.bookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium text-gray-900">{formatDate(bookingToCancel.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-900">₵{bookingToCancel.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-xs text-yellow-800">
                <strong>Cancellation Policy:</strong> Free cancellation up to 48 hours before check-in. 
                A refund will be processed within 5-7 business days.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setBookingToCancel(null);
                }}
                disabled={isCancelling}
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
