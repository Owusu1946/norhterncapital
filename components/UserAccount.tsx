"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface UserAccountProps {
  variant?: "hero" | "default";
}

export function UserAccount({ variant = "default" }: UserAccountProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isHeroVariant = variant === "hero";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDropdown]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {isHeroVariant && (
          <button
            onClick={() => router.push("/auth")}
            className="hidden text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-colors md:inline-flex"
          >
            Log In
          </button>
        )}
        <button
          onClick={() => router.push("/auth")}
          className={
            isHeroVariant
              ? "rounded-full bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-neutral-900 shadow-sm hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              : "inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-[#01a4ff] text-[#01a4ff] rounded-xl sm:rounded-2xl text-xs sm:text-sm hover:bg-[#01a4ff] hover:text-white active:bg-[#0084cc] transition-colors touch-manipulation"
          }
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {!isHeroVariant && (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
          {isHeroVariant ? "Sign Up" : "Sign In"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={
          isHeroVariant
            ? "flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation"
            : "flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
        }
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#01a4ff] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs sm:text-sm font-semibold">
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
        <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${isHeroVariant ? "text-white/70" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Mobile Full-Screen Modal */}
          <div className="md:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Modal */}
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up">
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#01a4ff] rounded-full flex items-center justify-center">
                    <span className="text-white text-base font-semibold">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="px-4 py-2">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push("/bookings");
                  }}
                  className="w-full text-left px-4 py-4 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center rounded-xl transition-colors touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <svg className="w-5 h-5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Bookings
                </button>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push("/profile");
                  }}
                  className="w-full text-left px-4 py-4 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center rounded-xl transition-colors touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <svg className="w-5 h-5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </button>
                
                <div className="border-t border-gray-100 my-2" />
                
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                    router.push("/");
                  }}
                  className="w-full text-left px-4 py-4 text-base text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center rounded-xl transition-colors touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <svg className="w-5 h-5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
              
              {/* Safe Area Padding */}
              <div className="h-8" />
            </div>
          </div>

          {/* Desktop Dropdown */}
          <div className="hidden md:block absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
            
            <button
              onClick={() => {
                setShowDropdown(false);
                router.push("/bookings");
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center transition-colors touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Bookings
            </button>
            
            <button
              onClick={() => {
                setShowDropdown(false);
                router.push("/profile");
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center transition-colors touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center transition-colors touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
