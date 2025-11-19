"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface UserAccountProps {
  variant?: "hero" | "default";
}

export function UserAccount({ variant = "default" }: UserAccountProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  
  const isHeroVariant = variant === "hero";

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3">
        {isHeroVariant && (
          <button
            onClick={() => router.push("/auth")}
            className="hidden text-sm font-medium text-white/90 hover:text-white transition-colors md:inline-flex"
          >
            Log In
          </button>
        )}
        <button
          onClick={() => router.push("/auth")}
          className={
            isHeroVariant
              ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-gray-100 transition-colors"
              : "inline-flex items-center px-4 py-2 border border-[#01a4ff] text-[#01a4ff] rounded-2xl hover:bg-[#01a4ff] hover:text-white transition-colors"
          }
        >
          {!isHeroVariant && (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
          {isHeroVariant ? "Sign Up" : "Sign In"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={
          isHeroVariant
            ? "flex items-center space-x-3 p-2 rounded-2xl hover:bg-white/10 transition-colors"
            : "flex items-center space-x-3 p-2 rounded-2xl hover:bg-gray-100 transition-colors"
        }
      >
        <div className="w-8 h-8 bg-[#01a4ff] rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className={`text-sm font-medium ${isHeroVariant ? "text-white" : "text-gray-900"}`}>
            {user.firstName} {user.lastName}
          </p>
          <p className={`text-xs ${isHeroVariant ? "text-white/70" : "text-gray-600"}`}>
            {user.email}
          </p>
        </div>
        <svg className={`w-4 h-4 ${isHeroVariant ? "text-white/70" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-600">{user.email}</p>
          </div>
          
          <button
            onClick={() => {
              setShowDropdown(false);
              router.push("/bookings");
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Bookings
          </button>
          
          <button
            onClick={() => {
              setShowDropdown(false);
              // Navigate to profile page
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Settings
          </button>
          
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={() => {
                logout();
                setShowDropdown(false);
                router.push("/");
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
