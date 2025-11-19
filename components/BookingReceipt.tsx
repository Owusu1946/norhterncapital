import React from "react";
import { CheckCircle, MapPin, Phone, Mail, Globe } from "lucide-react";

interface BookingReceiptProps {
  booking: {
    id: string;
    bookingReference: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
    services?: string[];
    actualCheckInTime?: string;
    actualCheckOutTime?: string;
  };
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export const BookingReceipt = React.forwardRef<HTMLDivElement, BookingReceiptProps>(
  ({ booking, guestDetails }, ref) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
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

    const calculateNights = (checkIn: string, checkOut: string) => {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    const nights = calculateNights(booking.checkIn, booking.checkOut);
    const pricePerNight = booking.totalAmount / nights;
    const roomTotal = pricePerNight * nights;
    const servicesTotal = 0; // Calculate from services if needed
    const subtotal = roomTotal + servicesTotal;
    const tax = subtotal * 0.15; // 15% tax
    const total = booking.totalAmount;

    return (
      <div ref={ref} className="bg-white p-12" style={{ width: "210mm", minHeight: "297mm" }}>
        {/* Header */}
        <div className="border-b-2 border-[#01a4ff] pb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#01a4ff] shadow-lg">
                <span className="text-2xl font-bold text-white">NCH</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Northern Capital Hotel</h1>
                <p className="mt-1 text-sm text-gray-600">Luxury Accommodation in Savelugu</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">PAID</span>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Title */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">BOOKING RECEIPT</h2>
          <p className="mt-2 text-sm text-gray-600">
            Booking Reference: <span className="font-semibold text-[#01a4ff]">{booking.bookingReference}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Issued on {formatDate(booking.createdAt)}
          </p>
        </div>

        {/* Guest and Hotel Information */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          {/* Guest Details */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Guest Information
            </h3>
            <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">
                {guestDetails.firstName} {guestDetails.lastName}
              </p>
              <p className="text-sm text-gray-600">{guestDetails.email}</p>
              {guestDetails.phone && (
                <p className="text-sm text-gray-600">{guestDetails.phone}</p>
              )}
            </div>
          </div>

          {/* Hotel Details */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Hotel Information
            </h3>
            <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-[#01a4ff]" />
                <p className="text-gray-700">
                  123 Central Business District<br />
                  Savelugu, Northern Region<br />
                  Ghana
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#01a4ff]" />
                <p className="text-gray-700">+233 (0) 372 123 456</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#01a4ff]" />
                <p className="text-gray-700">info@northerncapitalhotel.com</p>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#01a4ff]" />
                <p className="text-gray-700">www.northerncapitalhotel.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Reservation Details
          </h3>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">Room Type</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{booking.roomName}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">Check-in Date</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(booking.checkIn)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">Check-out Date</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(booking.checkOut)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">Number of Nights</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{nights} nights</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">Guests</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">Rooms</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.rooms} {booking.rooms === 1 ? "room" : "rooms"}
                  </td>
                </tr>
                {booking.actualCheckInTime && (
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-700">Actual Check-in</td>
                    <td className="px-4 py-3 text-sm text-blue-900">
                      {formatDateTime(booking.actualCheckInTime)}
                    </td>
                  </tr>
                )}
                {booking.actualCheckOutTime && (
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-700">Actual Check-out</td>
                    <td className="px-4 py-3 text-sm text-blue-900">
                      {formatDateTime(booking.actualCheckOutTime)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Services */}
        {booking.services && booking.services.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Additional Services
            </h3>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <ul className="space-y-1">
                {booking.services.map((service, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#01a4ff]"></span>
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Payment Summary
          </h3>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    Room Charges ({nights} nights × ₵{pricePerNight.toFixed(2)})
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    ₵{roomTotal.toFixed(2)}
                  </td>
                </tr>
                {booking.services && booking.services.length > 0 && (
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Additional Services</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      ₵{servicesTotal.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">Subtotal</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    ₵{subtotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">Tax (15%)</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    ₵{tax.toFixed(2)}
                  </td>
                </tr>
                <tr className="bg-[#01a4ff]/10">
                  <td className="px-4 py-4 text-base font-bold text-gray-900">TOTAL AMOUNT</td>
                  <td className="px-4 py-4 text-right text-xl font-bold text-[#01a4ff]">
                    ₵{total.toFixed(2)}
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-4 py-3 text-sm font-medium text-green-700">Payment Status</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-green-700">
                    {booking.paymentStatus.toUpperCase()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
            Important Information
          </h3>
          <ul className="space-y-2 text-xs text-gray-600">
            <li>• Check-in time is 3:00 PM. Early check-in subject to availability.</li>
            <li>• Check-out time is 12:00 PM. Late check-out may incur additional charges.</li>
            <li>• Valid photo ID required at check-in.</li>
            <li>• Cancellation must be made 48 hours before check-in for full refund.</li>
            <li>• Please present this receipt at the front desk upon arrival.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t-2 border-gray-200 pt-6 text-center">
          <p className="text-sm font-medium text-gray-900">
            Thank you for choosing Northern Capital Hotel
          </p>
          <p className="mt-2 text-xs text-gray-500">
            We look forward to welcoming you and making your stay memorable.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
            <span>Tax ID: GH-123456789</span>
            <span>•</span>
            <span>Receipt ID: {booking.id}</span>
            <span>•</span>
            <span>Printed: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Watermark */}
        <div className="mt-4 text-center">
          <div className="inline-block rounded-full border-2 border-[#01a4ff]/20 px-6 py-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#01a4ff]/40">
              Official Receipt
            </p>
          </div>
        </div>
      </div>
    );
  }
);

BookingReceipt.displayName = "BookingReceipt";
