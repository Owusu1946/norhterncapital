"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Globe, Search } from "lucide-react";
import { UserAccount } from "@/components/UserAccount";

interface HeaderProps {
  variant?: "hero" | "default";
  className?: string;
}

export function Header({ variant = "default", className = "" }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isHeroVariant = variant === "hero";
  
  const headerClasses = isHeroVariant
    ? "flex items-center justify-between px-6 py-4 sm:px-10 sm:py-6"
    : "flex items-center justify-between px-6 py-4 sm:px-10 sm:py-6 bg-white border-b border-gray-100 sticky top-0 z-40";

  const logoClasses = isHeroVariant
    ? "flex h-9 w-9 items-center justify-center rounded-2xl bg-white/90 text-xs font-semibold text-neutral-900 shadow-md"
    : "flex h-9 w-9 items-center justify-center rounded-2xl bg-[#01a4ff] text-xs font-semibold text-white shadow-md";

  const brandTextClasses = isHeroVariant
    ? "text-lg font-semibold tracking-tight text-white"
    : "text-lg font-semibold tracking-tight text-gray-900";

  const navTextClasses = isHeroVariant
    ? "hidden items-center gap-6 text-sm font-medium text-white/80 md:flex"
    : "hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex";

  const searchClasses = isHeroVariant
    ? "hidden max-w-md flex-1 items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 shadow-lg ring-1 ring-white/15 backdrop-blur-md md:flex"
    : "hidden max-w-md flex-1 items-center gap-3 rounded-full bg-gray-50 px-4 py-2 text-sm text-gray-500 border border-gray-200 md:flex";

  const searchButtonClasses = isHeroVariant
    ? "ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs text-white ring-1 ring-white/30 backdrop-blur"
    : "ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 transition-colors";

  const languageButtonClasses = isHeroVariant
    ? "hidden items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-sm font-medium backdrop-blur text-white md:inline-flex"
    : "hidden items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors md:inline-flex";

  return (
    <header className={`${headerClasses} ${className}`}>
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2">
          <div className={logoClasses}>
            NCH
          </div>
          <span className={brandTextClasses}>Northern Capital</span>
        </Link>
        
        <nav className={navTextClasses}>
          <HeaderNavLink 
            label="Rooms" 
            href="/rooms" 
            isActive={pathname === "/rooms"}
            variant={variant}
          />
          <HeaderNavLink 
            label="About" 
            href="/about"
            isActive={pathname === "/about"}
            variant={variant}
          />
          <HeaderNavLink 
            label="Amenities" 
            href="/amenities"
            isActive={pathname === "/amenities"}
            variant={variant}
          />
          <HeaderNavLink 
            label="Contact" 
            href="/contact"
            isActive={pathname === "/contact"}
            variant={variant}
          />
        </nav>
      </div>

      <div className="flex flex-1 items-center justify-end gap-6 pl-6">
        <div className={searchClasses}>
          <span className={isHeroVariant ? "text-white/60" : "text-gray-400"}>
            Search anything...
          </span>
          <button
            type="button"
            className={searchButtonClasses}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          className={languageButtonClasses}
        >
          <Globe className="h-4 w-4" />
          <span>EN</span>
        </button>

        {/* User Account Component with Authentication */}
        <UserAccount variant={variant} />
      </div>
    </header>
  );
}

interface HeaderNavLinkProps {
  label: string;
  isActive?: boolean;
  href?: string;
  variant?: "hero" | "default";
}

function HeaderNavLink({ label, isActive, href, variant = "default" }: HeaderNavLinkProps) {
  const isHeroVariant = variant === "hero";
  
  const className = `text-sm transition-colors ${
    isActive 
      ? isHeroVariant 
        ? "font-semibold text-white" 
        : "font-semibold text-[#01a4ff]"
      : isHeroVariant 
        ? "text-white/75 hover:text-white" 
        : "text-gray-600 hover:text-gray-900"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return <span className={className}>{label}</span>;
}
