"use client";

import { useState, useEffect } from "react";
import { ChevronDown, UserPlus, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  selectedView: string;
  onViewChange: (view: string) => void;
}

interface AdminUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function DashboardHeader({ selectedView }: DashboardHeaderProps) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [sessionTime, setSessionTime] = useState(0);

  // Fetch admin user data
  useEffect(() => {
    async function fetchAdminData() {
      try {
        const response = await fetch("/api/admin/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.user) {
            setAdminUser(data.data.user);
          }
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      }
    }

    fetchAdminData();
  }, []);

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatSessionTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="px-6 pt-4 pb-3">
        {/* Top meta row */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-400 mb-6">
          <span>Updates</span>
          <div className="flex items-center gap-6">
            <span>Session: {formatSessionTime(sessionTime)}</span>
            <span>
              User: {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : "Loading..."}
            </span>
          </div>
        </div>

        {/* Main header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Dashboard</h1>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 shadow-sm shadow-blue-50/80 hover:bg-blue-100 transition-colors"
            >
              <span>{selectedView}</span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/guests/new")}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <span>New Guest</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <span>New Reservation</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
