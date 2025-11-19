"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Header } from "@/components/sections/Header";
import PaystackPop from "@paystack/inline-js";

interface BookingData {
  roomSlug?: string;
  roomName?: string;
  roomImage?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  guests?: number;
  rooms?: number;
  pricePerNight?: number;
}

interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "transport" | "spa" | "dining" | "activities";
}

const additionalServices: AdditionalService[] = [
  {
    id: "airport-pickup",
    name: "Airport Pickup",
    description: "Luxury vehicle pickup from Kotoka International Airport",
    price: 150,
    category: "transport"
  },
  {
    id: "airport-dropoff",
    name: "Airport Drop-off",
    description: "Comfortable ride to Kotoka International Airport",
    price: 120,
    category: "transport"
  },
  {
    id: "spa-package",
    name: "Spa Wellness Package",
    description: "Full body massage, facial treatment, and access to wellness center",
    price: 300,
    category: "spa"
  },
  {
    id: "couples-spa",
    name: "Couples Spa Experience",
    description: "Romantic spa session for two with champagne service",
    price: 550,
    category: "spa"
  },
  {
    id: "breakfast-upgrade",
    name: "Premium Breakfast",
    description: "Continental breakfast served in your room or executive lounge",
    price: 45,
    category: "dining"
  },
  {
    id: "dinner-package",
    name: "Fine Dining Experience",
    description: "3-course dinner at our signature restaurant with wine pairing",
    price: 180,
    category: "dining"
  },
  {
    id: "city-tour",
    name: "Accra City Tour",
    description: "Guided tour of Accra's cultural landmarks and markets",
    price: 200,
    category: "activities"
  },
  {
    id: "beach-excursion",
    name: "Beach Day Excursion",
    description: "Day trip to beautiful coastal beaches with lunch included",
    price: 250,
    category: "activities"
  }
];

export function BookingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    specialRequests: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Get booking data from URL params
    const adultsParam = searchParams.get("adults");
    const childrenParam = searchParams.get("children");
    const guestsParam = searchParams.get("guests");

    const adults = adultsParam ? Number(adultsParam) : undefined;
    const children = childrenParam ? Number(childrenParam) : undefined;
    const derivedGuests =
      guestsParam && !Number.isNaN(Number(guestsParam))
        ? Number(guestsParam)
        : (adults ?? 0) + (children ?? 0) || 1;

    const data: BookingData = {
      roomSlug: searchParams.get("roomSlug") || undefined,
      roomName: searchParams.get("roomName") || undefined,
      roomImage: searchParams.get("roomImage") || "/hero.jpg",
      checkIn: searchParams.get("checkIn") || undefined,
      checkOut: searchParams.get("checkOut") || undefined,
      adults,
      children,
      guests: derivedGuests,
      rooms: Number(searchParams.get("rooms")) || 1,
      pricePerNight: Number(searchParams.get("price")) || 350
    };
    setBookingData(data);
  }, [searchParams]);

  // Auto-fill guest details when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      setGuestDetails(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        country: user.country || prev.country
      }));
    }
  }, [user, isAuthenticated]);

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const roomTotal = (bookingData.pricePerNight || 0) * nights * (bookingData.rooms || 1);
    const servicesTotal = selectedServices.reduce((total, serviceId) => {
      const service = additionalServices.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
    return roomTotal + servicesTotal;
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleStepNavigation = (nextStep: number) => {
    // Check authentication before proceeding to guest details (step 2)
    if (nextStep === 2 && !isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setCurrentStep(nextStep);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Initialize transaction with backend
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: guestDetails.email,
          amount: calculateTotal(),
          metadata: {
            roomSlug: bookingData.roomSlug,
            roomName: bookingData.roomName,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            adults: bookingData.adults,
            children: bookingData.children,
            rooms: bookingData.rooms,
            selectedServices: selectedServices.map(id => {
              const service = additionalServices.find(s => s.id === id);
              return service ? { id: service.id, name: service.name, price: service.price } : null;
            }).filter(Boolean),
            guestDetails: guestDetails,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Use Paystack Popup to complete payment
      const paystack = new PaystackPop();
      paystack.resumeTransaction(data.data.access_code);

      // Listen for payment completion
      const checkPaymentStatus = setInterval(async () => {
        try {
          const verifyResponse = await fetch(
            `/api/paystack/verify?reference=${data.data.reference}`
          );
          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            clearInterval(checkPaymentStatus);
            setIsProcessing(false);
            setBookingComplete(true);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 3000);

      // Clear interval after 5 minutes
      setTimeout(() => {
        clearInterval(checkPaymentStatus);
        setIsProcessing(false);
      }, 300000);

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-3xl bg-white p-8 shadow-lg text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600">Your reservation at Northern Capital Hotel has been successfully processed.</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{bookingData.roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{bookingData.checkIn && formatDate(bookingData.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{bookingData.checkOut && formatDate(bookingData.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-[#01a4ff]">₵{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              A confirmation email has been sent to {guestDetails.email}. Our team will contact you within 24 hours to finalize your reservation.
            </p>
            
            <button
              onClick={() => router.push("/")}
              className="bg-[#01a4ff] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-[#0084cc] transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm sm:text-base text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Room Details</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-sm sm:text-base text-gray-600">Secure your stay at Northern Capital Hotel</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center justify-center min-w-max px-4 sm:px-0">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all ${
                    currentStep >= step 
                      ? "bg-[#01a4ff] text-white shadow-lg shadow-[#01a4ff]/30" 
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}>
                    {step}
                  </div>
                  <span className={`mt-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    currentStep >= step ? "text-[#01a4ff]" : "text-gray-400"
                  }`}>
                    {step === 1 ? "Room" : step === 2 ? "Details" : "Payment"}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`w-12 sm:w-20 h-1 mx-2 sm:mx-4 rounded-full transition-all ${
                    currentStep > step ? "bg-[#01a4ff]" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6 sm:space-y-8">
            {/* Step 1: Room Summary & Additional Services */}
            {currentStep === 1 && (
              <>
                {/* Room Summary */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Room Selection</h2>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0">
                      <Image 
                        src={bookingData.roomImage || "/hero.jpg"} 
                        alt={bookingData.roomName || "Room"} 
                        width={96} 
                        height={96} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{bookingData.roomName}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{bookingData.checkIn && formatDate(bookingData.checkIn)} - {bookingData.checkOut && formatDate(bookingData.checkOut)}</p>
                        <p>
                          {calculateNights()} nights 
                          {" "}
                          {bookingData.adults ?? bookingData.guests ?? 1} adult{(bookingData.adults ?? bookingData.guests ?? 1) === 1 ? "" : "s"}
                          {bookingData.children != null && bookingData.children > 0 && (
                            <>
                              {" "}
                              {bookingData.children} child{bookingData.children === 1 ? "" : "ren"}
                            </>
                          )}
                          {" "}
                          {bookingData.rooms} room(s)
                        </p>
                        <p className="font-semibold text-[#01a4ff]">₵{bookingData.pricePerNight?.toLocaleString()}/night</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Enhance Your Stay</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Select additional services to make your experience unforgettable</p>
                  
                  {["transport", "spa", "dining", "activities"].map((category) => (
                    <div key={category} className="mb-4 sm:mb-6">
                      <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 capitalize text-gray-800">
                        {category === "transport" ? "Transportation" : category}
                      </h3>
                      <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
                        {additionalServices
                          .filter(service => service.category === category)
                          .map((service) => (
                            <div
                              key={service.id}
                              className={`border rounded-xl sm:rounded-2xl p-3 sm:p-4 cursor-pointer transition-all ${
                                selectedServices.includes(service.id)
                                  ? "border-[#01a4ff] bg-[#01a4ff]/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleServiceToggle(service.id)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm sm:text-base text-gray-900">{service.name}</h4>
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                                  <p className="font-semibold text-sm sm:text-base text-[#01a4ff] mt-2">₵{service.price.toLocaleString()}</p>
                                </div>
                                <div className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center ${
                                  selectedServices.includes(service.id)
                                    ? "border-[#01a4ff] bg-[#01a4ff]"
                                    : "border-gray-300"
                                }`}>
                                  {selectedServices.includes(service.id) && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Guest Details */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Guest Information</h2>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={guestDetails.firstName}
                      onChange={(e) => setGuestDetails(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full rounded-xl sm:rounded-2xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#01a4ff] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={guestDetails.lastName}
                      onChange={(e) => setGuestDetails(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full rounded-xl sm:rounded-2xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#01a4ff] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-xl sm:rounded-2xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#01a4ff] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={guestDetails.phone}
                      onChange={(e) => setGuestDetails(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-xl sm:rounded-2xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#01a4ff] focus:outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select
                      value={guestDetails.country}
                      onChange={(e) => setGuestDetails(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full rounded-xl sm:rounded-2xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#01a4ff] focus:outline-none"
                      required
                    >
                      <option value="">Select Country</option>
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                    <textarea
                      value={guestDetails.specialRequests}
                      onChange={(e) => setGuestDetails(prev => ({ ...prev, specialRequests: e.target.value }))}
                      rows={3}
                      className="w-full rounded-xl sm:rounded-2xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#01a4ff] focus:outline-none"
                      placeholder="Any special requirements or preferences..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      { id: "card", name: "Credit/Debit Card", icon: "💳" },
                      { id: "mobile", name: "Mobile Money", icon: "📱" },
                      { id: "bank", name: "Bank Transfer", icon: "🏦" }
                    ].map((method) => (
                      <div
                        key={method.id}
                        className={`border rounded-2xl p-4 cursor-pointer text-center transition-all ${
                          paymentMethod === method.id
                            ? "border-[#01a4ff] bg-[#01a4ff]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <div className="font-medium text-sm">{method.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full rounded-xl sm:rounded-2xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#01a4ff] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                        placeholder="MM/YY"
                        className="w-full rounded-xl sm:rounded-2xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#01a4ff] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="123"
                        className="w-full rounded-xl sm:rounded-2xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#01a4ff] focus:outline-none"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name *</label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-xl sm:rounded-2xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#01a4ff] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "mobile" && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📱</div>
                    <h3 className="font-semibold text-lg mb-2">Mobile Money Payment</h3>
                    <p className="text-gray-600 mb-4">You will be redirected to complete payment via MTN Mobile Money or Vodafone Cash</p>
                    <div className="flex justify-center space-x-4">
                      <div className="bg-yellow-100 px-4 py-2 rounded-lg text-sm font-medium">MTN MoMo</div>
                      <div className="bg-red-100 px-4 py-2 rounded-lg text-sm font-medium">Vodafone Cash</div>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🏦</div>
                    <h3 className="font-semibold text-lg mb-2">Bank Transfer</h3>
                    <p className="text-gray-600 mb-4">Transfer details will be provided after booking confirmation</p>
                    <div className="bg-blue-50 p-4 rounded-2xl text-sm">
                      <p className="font-medium mb-2">Payment Instructions:</p>
                      <p>1. Complete booking to receive transfer details</p>
                      <p>2. Make payment within 24 hours</p>
                      <p>3. Upload payment receipt for verification</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
              <h3 className="font-semibold text-base sm:text-lg mb-4">Booking Summary</h3>
              
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room ({calculateNights()} nights)</span>
                  <span>₵{((bookingData.pricePerNight || 0) * calculateNights() * (bookingData.rooms || 1)).toLocaleString()}</span>
                </div>
                
                {selectedServices.length > 0 && (
                  <>
                    <div className="border-t pt-3">
                      <span className="text-gray-600 font-medium">Additional Services:</span>
                    </div>
                    {selectedServices.map(serviceId => {
                      const service = additionalServices.find(s => s.id === serviceId);
                      return service ? (
                        <div key={serviceId} className="flex justify-between">
                          <span className="text-gray-600">{service.name}</span>
                          <span>₵{service.price.toLocaleString()}</span>
                        </div>
                      ) : null;
                    })}
                  </>
                )}
                
                <div className="border-t pt-2 sm:pt-3">
                  <div className="flex justify-between font-semibold text-base sm:text-lg">
                    <span>Total</span>
                    <span className="text-[#01a4ff]">₵{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                {currentStep < 3 && (
                  <button
                    onClick={() => handleStepNavigation(currentStep + 1)}
                    className="w-full bg-[#01a4ff] text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold hover:bg-[#0084cc] transition-colors"
                  >
                    <span className="hidden sm:inline">{currentStep === 1 ? "Continue to Guest Details" : "Continue to Payment"}</span>
                    <span className="sm:hidden">{currentStep === 1 ? "Next: Guest Details" : "Next: Payment"}</span>
                  </button>
                )}
                
                {currentStep === 3 && (
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-[#01a4ff] text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold hover:bg-[#0084cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Processing..." : `Pay ₵${calculateTotal().toLocaleString()}`}
                  </button>
                )}
                
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="w-full border border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
              </div>
              
              <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-500 text-center space-y-1">
                <p>🔒 Secure payment powered by SSL encryption</p>
                <p>Free cancellation up to 24 hours before check-in</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo={`/booking?${searchParams.toString()}`}
      />
      </div>
    </>
  );
}
