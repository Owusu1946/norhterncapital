"use client";

import { User, Lock, LogOut, Edit2, Loader2 } from "lucide-react";
import { useStaffAuth } from "@/contexts/StaffAuthContext";

interface ProfileSidebarProps {
    activeTab: "personal" | "security";
    onTabChange: (tab: "personal" | "security") => void;
}

export function ProfileSidebar({ activeTab, onTabChange }: ProfileSidebarProps) {
    const { user, logout, isLoading } = useStaffAuth();

    const handleLogout = async () => {
        await logout();
    };

    const displayName = user ? `${user.firstName} ${user.lastName}` : "Loading...";
    const staffRole = user?.staffRole || "Staff";

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center h-full w-[320px] shrink-0">
            {/* Avatar Section */}
            <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-orange-100 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
                    {user ? (
                        <span className="text-3xl font-bold text-orange-500">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </span>
                    ) : (
                        <User size={40} className="text-orange-300" />
                    )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-md">
                    <Edit2 size={12} />
                </button>
            </div>

            {/* User Info */}
            <div className="text-center mb-10">
                <h3 className="font-bold text-xl text-gray-800">{displayName}</h3>
                <p className="text-sm text-gray-500 font-medium">{staffRole}</p>
            </div>

            {/* Navigation Menu */}
            <div className="w-full space-y-2 flex-1">
                <button
                    onClick={() => onTabChange("personal")}
                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === "personal"
                            ? "bg-orange-50 text-orange-600 shadow-sm"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                        }`}
                >
                    <User size={20} />
                    Personal Information
                </button>
                <button
                    onClick={() => onTabChange("security")}
                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === "security"
                            ? "bg-orange-50 text-orange-600 shadow-sm"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                        }`}
                >
                    <Lock size={20} />
                    Login & Password
                </button>
                <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 font-medium transition-colors"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                    Log Out
                </button>
            </div>
        </div>
    );
}
