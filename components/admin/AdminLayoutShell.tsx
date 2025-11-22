"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/sections/Footer";

export function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
    </div>
  );
}
