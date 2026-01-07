"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/sections/Footer";

export function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldHideFooter = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}
