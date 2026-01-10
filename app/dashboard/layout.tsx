import type { Metadata, Viewport } from "next";
import { DashboardLayoutShell } from "@/components/dashboard/DashboardLayoutShell";

export const metadata: Metadata = {
    title: "Northern Capital Hotel - POS Dashboard",
    description: "Point of Sale system for Northern Capital Hotel",
    manifest: "/manifest-dashboard.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Northern POS",
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    themeColor: "#2563eb",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
