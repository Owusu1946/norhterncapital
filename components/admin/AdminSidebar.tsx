"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Users,
  MessageSquare,
  CreditCard,
  Bed,
  Settings,
  User,
  PanelLeftOpen,
  PanelLeftClose,
  ListChecks,
  PlusCircle,
  Sparkles,
  BedDouble,
  Plus,
  ChevronRight,
  ChevronDown,
  KeyRound,
  Calendar,
  ShoppingBag,
  LogOut,
  UtensilsCrossed,
  ShoppingCart,
  Coffee,
  Receipt,
  ChefHat,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Users, label: "Guests", href: "/admin/guests" },
  { icon: Calendar, label: "Bookings", href: "/admin/bookings" },
  // { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: User, label: "Staff", href: "/admin/staff" },
  // { icon: KeyRound, label: "Users", href: "/admin/users" },
  {
    icon: Bed,
    label: "Rooms",
    href: "/admin/rooms",
    subItems: [
      { label: "All rooms", icon: BedDouble, href: "/admin/rooms" },
      { label: "Room type", icon: ListChecks, href: "/admin/rooms/add-room-type" },
      { label: "Add room", icon: PlusCircle, href: "/admin/rooms/add-room" },
      { label: "Services", icon: ShoppingBag, href: "/admin/rooms/services" },
    ],
  },
  // {
  //   icon: UtensilsCrossed,
  //   label: "Restaurant",
  //   href: "/admin/restaurant",
  //   subItems: [
  //     { label: "POS", icon: ShoppingCart, href: "/admin/restaurant/pos" },
  //     { label: "Menu Items", icon: Coffee, href: "/admin/restaurant/menu" },
  //     { label: "Orders", icon: Receipt, href: "/admin/restaurant/orders" },
  //     { label: "Kitchen", icon: ChefHat, href: "/admin/restaurant/kitchen" },
  //     { label: "Analytics", icon: TrendingUp, href: "/admin/restaurant/analytics" },
  //   ],
  // },
];

// Tooltip component
const Tooltip = ({ children, text, show }: { children: React.ReactNode; text: string; show: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!show) return <>{children}</>;

  return (
    <div className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50
                        shadow-lg pointer-events-none animate-in fade-in-0 zoom-in-95 duration-100">
          {text}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );
};

export function AdminSidebar() {
  const [expanded, setExpanded] = useState(true);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [restaurantOpen, setRestaurantOpen] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [allowedMenus, setAllowedMenus] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("admin");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Auto-open rooms submenu if a sub-item is active
  useEffect(() => {
    const roomsItem = navItems.find(item => item.label === "Rooms");
    if (roomsItem?.subItems?.some(sub => pathname === sub.href)) {
      setRoomsOpen(true);
    }
    const restaurantItem = navItems.find(item => item.label === "Restaurant");
    if (restaurantItem?.subItems?.some(sub => pathname === sub.href)) {
      setRestaurantOpen(true);
    }
  }, [pathname]);

  // Logout handler
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Clear any local storage if needed
        localStorage.removeItem("user");
        sessionStorage.clear();

        // Redirect to login page
        router.push("/admin/login");
      } else {
        console.error("Failed to logout");
        // Still redirect to login on error
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect to login on error
      router.push("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  // Fetch user data to get allowed menus
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/admin/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.user) {
            const user = data.data.user;
            setUserRole(user.role);

            console.log("User role:", user.role);
            console.log("User allowed menus:", user.allowedMenus);

            // If staff, use their allowed menus; if admin, show all
            if (user.role === "staff") {
              // For staff, only show menus they are allowed to see
              const staffMenus = user.allowedMenus && user.allowedMenus.length > 0
                ? user.allowedMenus
                : ["Dashboard"]; // Default to Dashboard only if no menus specified
              setAllowedMenus(staffMenus);
            } else if (user.role === "admin") {
              // Admin sees all menus
              setAllowedMenus(["Dashboard", "Analytics", "Guests", "Bookings", "Messages", "Payments", "Staff", "Users", "Rooms"]);
            } else {
              // Unauthorized role - show no menus
              setAllowedMenus([]);
            }
          }
        } else {
          console.error("Failed to fetch user data");
          setAllowedMenus([]); // Show no menus on error
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAllowedMenus([]); // Show no menus on error
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  // Fetch upcoming bookings count for sidebar badge
  useEffect(() => {
    let isMounted = true;

    async function fetchUpcomingBookingsCount() {
      try {
        const response = await fetch("/api/bookings/all?limit=200", {
          credentials: "include",
        });

        if (!response.ok) {
          if (isMounted) setBookingsCount(0);
          return;
        }

        const json = await response.json();
        const bookings: any[] = json?.data?.bookings || [];

        if (!Array.isArray(bookings)) {
          if (isMounted) setBookingsCount(0);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = bookings.filter((b) => {
          if (b.paymentStatus === "failed") return false;
          if (b.bookingStatus !== "pending" && b.bookingStatus !== "confirmed") return false;
          if (!b.checkIn) return false;
          const checkIn = new Date(b.checkIn);
          checkIn.setHours(0, 0, 0, 0);
          return checkIn >= today;
        }).length;

        if (isMounted) setBookingsCount(upcoming);
      } catch (error) {
        console.error("Failed to fetch upcoming bookings count:", error);
        if (isMounted) setBookingsCount(0);
      }
    }

    fetchUpcomingBookingsCount();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className={`${expanded ? "w-64" : "w-20"} bg-white border-r border-gray-100 flex flex-col h-screen transition-all duration-300 ease-in-out relative shadow-sm`}
      style={{
        /* Hide scrollbar for Chrome, Safari and Opera */
        msOverflowStyle: 'none',  /* IE and Edge */
        scrollbarWidth: 'none',  /* Firefox */
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105" style={{ background: "linear-gradient(135deg, #01a4ff 0%, #0090e0 100%)" }}>
            <span className="text-white font-bold text-xl">♦</span>
          </div>
          <div className={`transition-all duration-300 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'}`}>
            <span className="text-base font-semibold text-gray-800 block leading-tight">
              Northern Capital
            </span>
            <span className="text-xs text-gray-500">Hotel Management</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 hover:shadow-sm ${!expanded ? 'ml-0' : 'ml-auto'
            }`}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col gap-1.5 px-3 py-4 overflow-y-auto overflow-x-hidden"
        style={{
          /* Hide scrollbar */
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}>
        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`flex items-center px-3 py-2.5 ${!expanded ? "justify-center" : ""}`}
              >
                <div className="h-5 w-5 rounded bg-gray-100 animate-pulse shrink-0" />
                {expanded && (
                  <div className="ml-3 h-4 w-24 rounded bg-gray-100 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        ) : navItems.filter(item => {
          // Filter menu items based on user's allowed menus
          if (userRole === "admin") return true; // Admin sees all
          if (userRole === "staff") {
            return allowedMenus && allowedMenus.includes(item.label); // Staff sees only allowed menus
          }
          return false; // Hide menus for any other role
        }).map((item, index) => {
          const Icon = item.icon;
          // Check if current route matches this nav item
          const isActive = item.href ? (
            item.subItems ?
              pathname?.startsWith(item.href) || item.subItems.some(sub => pathname === sub.href) :
              pathname === item.href
          ) : false;
          const isRooms = item.label === "Rooms";
          const isRestaurant = item.label === "Restaurant";
          const isBookings = item.label === "Bookings";
          const hasSubItems =
            Array.isArray(item.subItems) && item.subItems.length > 0;
          const showSubItems =
            expanded && hasSubItems && ((isRooms && roomsOpen) || (isRestaurant && restaurantOpen));

          return (
            <div key={index}>
              <Tooltip text={item.label} show={!expanded}>
                <button
                  type="button"
                  onClick={() => {
                    if ((isRooms || isRestaurant) && hasSubItems) {
                      // For Rooms and Restaurant, only toggle submenu (and expand if collapsed), do not navigate
                      if (!expanded) {
                        setExpanded(true);
                      }
                      if (isRooms) {
                        setRoomsOpen((v) => !v);
                      } else if (isRestaurant) {
                        setRestaurantOpen((v) => !v);
                      }
                      return;
                    }
                    if (item.href) {
                      router.push(item.href);
                    }
                  }}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${isActive
                      ? "bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                    }`}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full transition-all duration-300"
                      style={{ background: "linear-gradient(180deg, #01a4ff 0%, #0090e0 100%)" }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 transition-all duration-200 ${isActive
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-gray-700"
                        } ${!expanded ? 'mx-auto' : ''}`}
                    />
                    <div className={`flex items-center gap-2 transition-all duration-300 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'
                      }`}>
                      <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                        {item.label}
                      </span>
                      {isBookings && bookingsCount > 0 && (
                        <span className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                          {bookingsCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {!expanded && isBookings && bookingsCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  )}

                  {expanded && (isRooms || isRestaurant) && hasSubItems && (
                    <span className="relative z-10 text-gray-400 group-hover:text-gray-600 transition-transform duration-200">
                      {(isRooms && roomsOpen) || (isRestaurant && restaurantOpen) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </button>
              </Tooltip>

              {showSubItems && item.subItems && (
                <div className="ml-8 mt-1 flex flex-col gap-0.5 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {item.subItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = pathname === sub.href;
                    return (
                      <button
                        key={sub.label}
                        type="button"
                        onClick={() => {
                          if (sub.href) {
                            router.push(sub.href);
                          }
                        }}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-all duration-200 group ${isSubActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <SubIcon className={`h-4 w-4 transition-colors ${isSubActive
                              ? "text-blue-500"
                              : "text-gray-400 group-hover:text-gray-600"
                            }`} />
                          <span className={`text-[13px] font-medium ${isSubActive ? "text-blue-700" : ""
                            }`}>
                            {sub.label}
                          </span>
                        </span>
                        {!isSubActive && (
                          <Plus className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Icons */}
      <div className="mt-auto border-t border-gray-100 p-3 space-y-2">
        <Tooltip text="Settings" show={!expanded}>
          <button
            type="button"
            onClick={() => router.push("/admin/settings")}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 group ${pathname === "/admin/settings"
                ? "bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            <Settings className={`h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors ${!expanded ? 'mx-auto' : ''}`} />
            <span className={`text-sm font-medium transition-all duration-300 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'
              }`}>Settings</span>
          </button>
        </Tooltip>

        <Tooltip text="Profile" show={!expanded}>
          <button
            type="button"
            onClick={() => router.push("/admin/profile")}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group ${pathname === "/admin/profile"
                ? "bg-gradient-to-r from-blue-50 to-blue-50/50"
                : "hover:bg-gray-50"
              }`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-gray-300 group-hover:to-gray-400 transition-all duration-200 ${!expanded ? 'mx-auto' : ''
              }`}>
              <User className="h-4 w-4 text-gray-700" />
            </div>
            <div className={`flex flex-col items-start transition-all duration-300 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'
              }`}>
              <span className="text-sm font-medium text-gray-800">Admin</span>
              <span className="text-xs text-gray-500">Manager</span>
            </div>
          </button>
        </Tooltip>

        {/* Logout Button */}
        <Tooltip text="Logout" show={!expanded}>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <LogOut className={`h-5 w-5 group-hover:scale-110 transition-transform ${!expanded ? 'mx-auto' : ''}`} />
            <span className={`text-sm font-medium transition-all duration-300 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'
              }`}>
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
