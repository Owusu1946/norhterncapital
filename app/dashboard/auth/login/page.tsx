"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2, ChefHat } from "lucide-react";

export default function StaffLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/pos/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push("/dashboard");
            } else {
                setError(data.error || "Login failed");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">
            {/* Left Side - Hero Image */}
            <div className="hidden md:flex md:w-1/2 bg-orange-50 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: "url('/images/login-bg.png')" }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/80 to-transparent mix-blend-multiply" />
                </div>

                <div className="relative z-10 p-12 text-white max-w-lg">
                    <div className="mb-6 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 text-white">
                        <ChefHat size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                        Experience the taste of <span className="text-orange-400">Northern Capital</span>
                    </h1>
                    <p className="text-lg opacity-80 leading-relaxed">
                        Streamline your restaurant operations with our advanced POS system.
                        Manage orders, menus, and staff with ease.
                    </p>

                    <div className="mt-12 flex items-center gap-4 text-sm font-medium opacity-60">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-orange-900" />
                            <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-orange-900" />
                            <div className="w-10 h-10 rounded-full bg-white/40 border-2 border-orange-900" />
                        </div>
                        <p>Trusted by Northern Capital Hotel Staff</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back! 👋</h2>
                        <p className="text-gray-500">Sign in to your dashboard to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@northerncapital.com"
                                required
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-gray-700">Password</label>
                                <a href="#" className="text-sm font-bold text-orange-500 hover:text-orange-600">Forgot?</a>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Sign In to Dashboard</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center md:text-left">
                        <p className="text-gray-500 font-medium">
                            Don't have an account?{" "}
                            <Link href="/dashboard/auth/signup" className="text-orange-500 font-bold hover:text-orange-600 transition-colors">
                                Create Staff Account
                            </Link>
                        </p>
                    </div>

                    <div className="pt-8 mt-8 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Northern Capital Hotel.</p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-gray-600">Privacy</a>
                            <a href="#" className="hover:text-gray-600">Terms</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
