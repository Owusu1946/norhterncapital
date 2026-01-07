"use client";

import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useStaffAuth } from "@/contexts/StaffAuthContext";

export function SecurityForm() {
    const { user } = useStaffAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const toggleShow = (field: "current" | "new" | "confirm") => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passwords.new !== passwords.confirm) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        if (passwords.new.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters" });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/pos/auth/update-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ type: "success", text: "Password updated successfully" });
                setPasswords({ current: "", new: "", confirm: "" });
            } else {
                setMessage({ type: "error", text: data.error || "Failed to update password" });
            }
        } catch {
            setMessage({ type: "error", text: "Network error. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-50 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-orange-500">🔒</span>
                Login & Password
            </h2>

            {message && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                        <input
                            type={showPasswords.current ? "text" : "password"}
                            name="current"
                            value={passwords.current}
                            onChange={handleChange}
                            required
                            className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all pr-12 font-medium"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => toggleShow("current")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                name="new"
                                value={passwords.new}
                                onChange={handleChange}
                                required
                                className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all pr-12 font-medium"
                                placeholder="Min 6 chars"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow("new")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirm"
                                value={passwords.confirm}
                                onChange={handleChange}
                                required
                                className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all pr-12 font-medium"
                                placeholder="Re-enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow("confirm")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Update Password
                    </button>
                </div>
            </div>
        </form>
    );
}
