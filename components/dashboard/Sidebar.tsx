"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
    Home,
    UtensilsCrossed,
    Clock,
    FileText,
    Bell,
    Settings,
    User,
    LogOut,
    LucideCalculator,
} from "lucide-react";
import { useStaffAuth } from "@/contexts/StaffAuthContext";

const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: LucideCalculator, label: "POS", href: "/dashboard/pos" },
    { icon: UtensilsCrossed, label: "Menu", href: "/dashboard/menu" },
    { icon: Clock, label: "History", href: "/dashboard/history" },
    { icon: FileText, label: "Report", href: "/dashboard/reports" },
    { icon: Bell, label: "Alert", href: "/dashboard/alerts", hasBadge: true },
];

export function Sidebar() {
    const pathname = usePathname();
    const [orderCount, setOrderCount] = useState(0);
    const [lastSeenCount, setLastSeenCount] = useState(0);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const { user, logout } = useStaffAuth();

    // Fetch order count
    const fetchOrderCount = async () => {
        try {
            const res = await fetch("/api/pos/orders?limit=1");
            if (res.ok) {
                // Get total count from a separate endpoint or use order number
                const countRes = await fetch("/api/pos/orders/next-number");
                if (countRes.ok) {
                    const data = await countRes.json();
                    const currentCount = data.data.orderNumber - 1001; // Since orders start at 1001
                    setOrderCount(Math.max(0, currentCount));
                }
            }
        } catch (error) {
            console.error("Failed to fetch order count:", error);
        }
    };

    useEffect(() => {
        fetchOrderCount();

        // Poll every 3 seconds for real-time badge updates
        pollingRef.current = setInterval(fetchOrderCount, 3000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    // Calculate unseen notifications
    const unseenCount = Math.max(0, orderCount - lastSeenCount);

    // Mark as seen when visiting alerts
    useEffect(() => {
        if (pathname === "/dashboard/alerts") {
            setLastSeenCount(orderCount);
        }
    }, [pathname, orderCount]);

    // Persist lastSeenCount in localStorage
    useEffect(() => {
        const saved = localStorage.getItem("lastSeenOrderCount");
        if (saved) {
            setLastSeenCount(parseInt(saved, 10));
        }
    }, []);

    useEffect(() => {
        if (lastSeenCount > 0) {
            localStorage.setItem("lastSeenOrderCount", lastSeenCount.toString());
        }
    }, [lastSeenCount]);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-20 bg-white flex flex-col items-center py-6 shadow-sm z-50">
            {/* Logo Placeholder */}
            <div className="mb-8">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 font-bold text-xl">
                    C
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 w-full flex flex-col items-center gap-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const showBadge = item.hasBadge && unseenCount > 0 && pathname !== "/dashboard/alerts";

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group relative ${isActive
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                                : "text-gray-400 hover:bg-orange-50 hover:text-orange-400"
                                }`}
                        >
                            <item.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>

                            {/* Notification Badge */}
                            {showBadge && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse shadow-sm">
                                    {unseenCount > 99 ? "99+" : unseenCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom User Section */}
            <div className="mt-auto flex flex-col items-center gap-4">
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-6 h-6" />
                </button>
                <Link href="/dashboard/profile" className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden border-2 border-white shadow-sm hover:ring-2 hover:ring-orange-500 transition-all flex items-center justify-center">
                    {user ? (
                        <span className="text-orange-500 font-bold text-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </span>
                    ) : (
                        <User size={20} className="text-gray-500" />
                    )}
                </Link>
            </div>
        </aside>
    );
}
