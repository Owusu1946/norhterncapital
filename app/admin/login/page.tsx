"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2, Shield } from "lucide-react";

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
    console.log("\n🔐 ===== CLIENT: ADMIN LOGIN STARTED =====");
    console.log("📧 Email:", formData.email);
    console.log("🔒 Password length:", formData.password.length);
    
    setIsLoading(true);
    setError("");

    try {
      console.log("📤 Sending login request to /api/admin/login...");
      
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      const data = await response.json();
      console.log("📦 Response data:", data);

      if (response.ok && data.success) {
        console.log("✅ Login successful!");
        console.log("👤 User data:", data.data?.user);
        console.log("🎫 Token received:", data.data?.token ? "Yes" : "No");
        console.log("🔄 Redirecting to /admin/dashboard...");
        
        // Redirect to admin dashboard
        router.push("/admin/dashboard");
        
        console.log("✅ Redirect initiated");
      } else {
        console.log("❌ Login failed:", data.error || "Invalid credentials");
        setError(data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("Error details:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
      console.log("===== CLIENT: ADMIN LOGIN ENDED =====\n");
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="mt-2 text-sm text-gray-400">
            Northern Capital Hotel Management
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-3xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Sign in to continue
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                  className="block w-full rounded-2xl border border-gray-600 bg-gray-700/50 py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="admin@northerncapital.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-2xl border border-gray-600 bg-gray-700/50 py-3 pl-12 pr-12 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-300"
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
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Authorized personnel only. All access is monitored.
            </p>
          </div>
        </div>

        {/* Back to Website */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Website
          </button>
        </div>
      </div>
    </div>
  );
}
