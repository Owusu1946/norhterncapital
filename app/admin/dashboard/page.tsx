"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { SatisfactionCard } from "@/components/admin/SatisfactionCard";
import { BookingsChart } from "@/components/admin/BookingsChart";
import { TasksCard } from "@/components/admin/TasksCard";
import { NewGuestsCard } from "@/components/admin/NewGuestsCard";
import { GuestsList } from "@/components/admin/GuestsList";
import { CalendarWidget } from "@/components/admin/CalendarWidget";
import { ActivityLog } from "@/components/admin/ActivityLog";

export default function AdminDashboard() {
  const [selectedView, setSelectedView] = useState("Overview");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <DashboardHeader 
          selectedView={selectedView}
          onViewChange={setSelectedView}
        />

        {/* Dashboard Content */}
        <div className="p-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 auto-rows-min">
              {/* Left column */}
              <div className="lg:col-span-1 space-y-4">
                <SatisfactionCard />
                <TasksCard />
              </div>

              {/* Center top: bookings */}
              <div className="lg:col-span-2">
                <BookingsChart />
              </div>

              {/* Top right: new guests and guests list together */}
              <div className="lg:col-span-1 space-y-4">
                <NewGuestsCard />
                <GuestsList />
              </div>

              {/* Calendar beneath tasks and bookings */}
              <div className="lg:col-span-3 lg:col-start-1">
                <CalendarWidget />
              </div>

              {/* Activity log to the right of calendar */}
              <div className="lg:col-span-1 lg:col-start-4">
                <ActivityLog />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
