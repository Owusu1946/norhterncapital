"use client";

import { useEffect } from "react";

export function PWARegistration() {
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            (window as any).workbox !== undefined
        ) {
            // next-pwa already injects a registration script if register: true
            // but sometimes we need to ensure it's triggered in App Router
            console.log("PWA Registration component mounted. Checking service worker...");
            if (typeof window !== "undefined" && "serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistration("/admin").then((registration) => {
                    if (registration) {
                        console.log("PWA Service Worker already registered for /admin", registration);
                    } else {
                        console.log("PWA Service Worker NOT found for /admin. next-pwa should register it automatically at root.");
                    }
                });
            }
        }
    }, []);

    return null;
}
