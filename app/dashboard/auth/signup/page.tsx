"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2, ChefHat, ArrowRight } from "lucide-react";

export default function StaffSignupPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/pos/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    staffRole: "Cashier",
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push("/dashboard");
            } else {
                setError(data.error || "Signup failed");
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
            <div className="hidden md:flex md:w-1/2 bg-orange-900 relative overflow-hidden items-center justify-center order-2">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/images/signup-bg.png')" }}>
                    <div className="absolute inset-0 bg-gradient-to-bl from-orange-900/90 to-transparent mix-blend-multiply" />
                </div>

                <div className="relative z-10 p-12 text-white max-w-lg text-right">
                    <div className="mb-6 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 text-white ml-auto">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                        Join our <span className="text-orange-400">Winning Team</span>
                    </h1>
                    <p className="text-lg opacity-80 leading-relaxed mb-8">
                        Be part of Northern Capital Hotel's success story. Create your staff account to get started with the POS system.
                    </p>

                    <div className="inline-flex flex-col gap-4 items-end">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10">
                            <div className="text-right">
                                <p className="font-bold text-lg">Fast & Secure</p>
                                <p className="text-sm opacity-70">Optimized workflow</p>
                            </div>
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <ArrowRight size={20} className="-rotate-45" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white order-1">
                <div className="w-full max-w-lg space-y-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                                <ChefHat size={20} />
                            </div>
                            <span className="font-bold text-xl text-gray-800">Northern Capital</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900">Create Account</h2>
                        <p className="text-gray-500 mt-1">Setup your staff profile in seconds.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    required
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    required
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+233..."
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 characters"
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-gray-900 pr-12"
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
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter password"
                                    required
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-gray-900"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 mt-4"
                        >
                            {isLoading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center md:text-left">
                        <p className="text-gray-500 font-medium">
                            Already have an account?{" "}
                            <Link href="/dashboard/auth/login" className="text-orange-500 font-bold hover:text-orange-600 transition-colors">
                                Sign In Instead
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
