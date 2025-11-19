"use client";

import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function AuthModal({ isOpen, onClose, redirectTo = "/" }: AuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleAuthRedirect = () => {
    const params = new URLSearchParams();
    if (redirectTo !== "/") {
      params.set("redirect", redirectTo);
    }
    router.push(`/auth?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-auto transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#01a4ff] rounded-2xl mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Account Required</h2>
              <p className="text-sm text-gray-600">
                Sign in or create an account to complete your booking
              </p>
            </div>

            {/* Compact Benefits */}
            <div className="bg-[#01a4ff]/5 rounded-2xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="w-8 h-8 bg-[#01a4ff]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-[#01a4ff]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Secure Booking</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-[#01a4ff]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-[#01a4ff]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Booking History</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleAuthRedirect}
              className="w-full bg-[#01a4ff] text-white py-3 px-4 rounded-2xl font-semibold hover:bg-[#0084cc] transition-colors"
            >
              Continue to Sign In
            </button>

            {/* Quick Note */}
            <p className="text-xs text-gray-500 text-center mt-3">
              Your booking progress will be saved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
