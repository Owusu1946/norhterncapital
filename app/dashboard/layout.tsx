"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StaffAuthProvider } from "@/contexts/StaffAuthContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith("/dashboard/auth");

    // Auth pages get full-screen layout without sidebar
    if (isAuthPage) {
        return (
            <StaffAuthProvider>
                <div className="min-h-screen bg-[#F8F9FD] text-gray-800 font-sans">
                    {children}
                </div>
            </StaffAuthProvider>
        );
    }

    // Regular dashboard layout with sidebar
    return (
        <StaffAuthProvider>
            <div className="min-h-screen bg-[#F8F9FD] text-gray-800 font-sans">
                <Sidebar />
                <main className="pl-24 h-screen overflow-hidden">
                    {children}
                </main>
            </div>
        </StaffAuthProvider>
    );
}
