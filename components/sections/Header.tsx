"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Globe, Search, Menu, X } from "lucide-react";
import { UserAccount } from "@/components/UserAccount";

interface HeaderProps {
  variant?: "hero" | "default";
  className?: string;
}

export function Header({ variant = "default", className = "" }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHeroVariant = variant === "hero";

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);
  
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
    <>
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

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden flex items-center justify-center h-10 w-10 rounded-xl transition-colors ${
            isHeroVariant
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* User Account Component with Authentication - Desktop */}
        <div className="hidden md:block">
          <UserAccount variant={variant} />
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )}

    {/* Mobile Menu Sidebar */}
    <div
      className={`fixed right-0 top-0 z-50 h-full w-[280px] transform bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#01a4ff] text-xs font-semibold text-white">
              NCH
            </div>
            <span className="text-sm font-semibold text-gray-900">Menu</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            <MobileNavLink
              label="Rooms"
              href="/rooms"
              isActive={pathname === "/rooms"}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <MobileNavLink
              label="About"
              href="/about"
              isActive={pathname === "/about"}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <MobileNavLink
              label="Amenities"
              href="/amenities"
              isActive={pathname === "/amenities"}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <MobileNavLink
              label="Contact"
              href="/contact"
              isActive={pathname === "/contact"}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>

          {/* Mobile Search */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Search className="h-4 w-4" />
              <span>Search anything...</span>
            </div>
          </div>

          {/* Mobile Language Selector */}
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700"
          >
            <Globe className="h-4 w-4" />
            <span>English (EN)</span>
          </button>
        </nav>

        {/* Mobile User Account */}
        <div className="border-t border-gray-100 px-4 py-4">
          <UserAccount variant="default" />
        </div>
      </div>
    </div>
    </>
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

interface MobileNavLinkProps {
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

function MobileNavLink({ label, href, isActive, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
        isActive
          ? "bg-[#01a4ff]/10 text-[#01a4ff]"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}
