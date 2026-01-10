import { Metadata, Viewport } from "next";

export const viewport: Viewport = {
    themeColor: "#1e293b",
    viewportFit: "cover",
    width: "device-width",
    initialScale: 1,
    minimumScale: 1,
};

export const metadata: Metadata = {
    title: "Northern Capital Hotel - Admin Dashboard",
    description: "Administrative control panel for Northern Capital Hotel",
    manifest: "/manifest-admin.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Northern Capital Admin",
    },
    formatDetection: {
        telephone: false,
    },
    applicationName: "Northern Capital Admin",
    other: {
        "mobile-web-app-capable": "yes",
        "msapplication-TileColor": "#1e293b",
        "msapplication-tap-highlight": "no",
    },
};

import { PWARegistration } from "@/components/admin/PWARegistration";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <PWARegistration />
            {children}
        </>
    );
}
