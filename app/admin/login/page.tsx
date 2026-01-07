"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2, Shield, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Side - Hero Image */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/images/admin-bg.png')" }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 to-transparent mix-blend-multiply" />
        </div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-900/50">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">Secure Management Portal</h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Northern Capital Hotel's centralized administration system. Monitor performance, manage staff, and oversee operations with enterprise-grade security.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Operational
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50/50">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-XL flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
          </div>

          <div className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please sign in to your administrator account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  placeholder="admin@northerncapital.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 ml-1">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete="current-password"
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Protected by Northern Capital Security System. <br />
              Attempted unauthorized access will be logged.
            </p>
          </div>

          {/* Back to Website */}
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Back to Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
