"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Bell,
  Globe,
  Mail,
  Shield,
  Smartphone,
  DollarSign,
  Calendar,
  Clock,
  Save,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General
    hotelName: "Northern Capital Hotel",
    hotelEmail: "info@northerncapital.com",
    hotelPhone: "+233 123 456 789",
    hotelAddress: "123 Main Street, Accra, Ghana",
    currency: "GHS",
    timezone: "Africa/Accra",
    
    // Booking
    checkInTime: "14:00",
    checkOutTime: "11:00",
    maxAdvanceBookingDays: 365,
    minAdvanceBookingHours: 2,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    bookingConfirmationEmail: true,
    paymentReceiptEmail: true,
    checkInReminder: true,
    
    // Payment
    acceptCash: true,
    acceptCard: true,
    acceptMobileMoney: true,
    requireDeposit: true,
    depositPercentage: 30,
  });

  function handleChange(key: string, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    // In a real app, this would save to backend
    alert("Settings saved successfully!");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Configure your hotel management system.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save changes
              </button>
            </div>

            {/* General Settings */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-400" />
                <h2 className="text-base font-semibold text-gray-900">
                  General Information
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    value={settings.hotelName}
                    onChange={(e) => handleChange("hotelName", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.hotelEmail}
                    onChange={(e) => handleChange("hotelEmail", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.hotelPhone}
                    onChange={(e) => handleChange("hotelPhone", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="GHS">GHS (₵)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settings.hotelAddress}
                    onChange={(e) => handleChange("hotelAddress", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Africa/Accra">Africa/Accra (GMT)</option>
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Booking Settings */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <h2 className="text-base font-semibold text-gray-900">
                  Booking Configuration
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={settings.checkInTime}
                    onChange={(e) => handleChange("checkInTime", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    value={settings.checkOutTime}
                    onChange={(e) => handleChange("checkOutTime", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Max Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    value={settings.maxAdvanceBookingDays}
                    onChange={(e) =>
                      handleChange("maxAdvanceBookingDays", parseInt(e.target.value))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Min Advance Booking (hours)
                  </label>
                  <input
                    type="number"
                    value={settings.minAdvanceBookingHours}
                    onChange={(e) =>
                      handleChange("minAdvanceBookingHours", parseInt(e.target.value))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <h2 className="text-base font-semibold text-gray-900">
                  Notifications
                </h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Email Notifications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      handleChange("emailNotifications", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">SMS Notifications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) =>
                      handleChange("smsNotifications", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Send booking confirmation emails
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.bookingConfirmationEmail}
                    onChange={(e) =>
                      handleChange("bookingConfirmationEmail", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Send payment receipt emails
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.paymentReceiptEmail}
                    onChange={(e) =>
                      handleChange("paymentReceiptEmail", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Send check-in reminders
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.checkInReminder}
                    onChange={(e) =>
                      handleChange("checkInReminder", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <h2 className="text-base font-semibold text-gray-900">
                  Payment Methods
                </h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Accept Cash</span>
                  <input
                    type="checkbox"
                    checked={settings.acceptCash}
                    onChange={(e) => handleChange("acceptCash", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Accept Card Payments</span>
                  <input
                    type="checkbox"
                    checked={settings.acceptCard}
                    onChange={(e) => handleChange("acceptCard", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Accept Mobile Money</span>
                  <input
                    type="checkbox"
                    checked={settings.acceptMobileMoney}
                    onChange={(e) =>
                      handleChange("acceptMobileMoney", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Require Deposit</span>
                  <input
                    type="checkbox"
                    checked={settings.requireDeposit}
                    onChange={(e) =>
                      handleChange("requireDeposit", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                {settings.requireDeposit && (
                  <div className="ml-6">
                    <label className="block text-xs font-medium text-gray-700">
                      Deposit Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.depositPercentage}
                      onChange={(e) =>
                        handleChange("depositPercentage", parseInt(e.target.value))
                      }
                      className="mt-1 w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
