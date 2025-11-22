"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Wrench, CheckCircle, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

interface StaffStatus {
  email: string;
  name: string;
  staffRole: string;
  hasMenus: boolean;
  menuCount: number;
  allowedMenus: string[];
}

export default function FixMenusPage() {
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [needsFix, setNeedsFix] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [staffStatus, setStaffStatus] = useState<StaffStatus[]>([]);
  const [fixResult, setFixResult] = useState<any>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/fix-staff-menus", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNeedsFix(data.data.needsFix);
          setTotalStaff(data.data.totalStaff);
          setStaffStatus(data.data.staffStatus);
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fixMenus = async () => {
    setFixing(true);
    setFixResult(null);
    try {
      const response = await fetch("/api/admin/fix-staff-menus", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFixResult(data);
          await checkStatus(); // Refresh the status
        }
      }
    } catch (error) {
      console.error("Error fixing menus:", error);
    } finally {
      setFixing(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Fix Staff Menu Permissions</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Check and repair staff menu permissions for proper access control.
                </p>
              </div>
              <button
                onClick={checkStatus}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {/* Status Card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Status</h2>
                {needsFix > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    <AlertTriangle className="h-3 w-3" />
                    {needsFix} staff need fixes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle className="h-3 w-3" />
                    All staff configured
                  </span>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{totalStaff}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-600">Need Fixes</p>
                  <p className="mt-1 text-2xl font-bold text-amber-900">{needsFix}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-600">Configured</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-900">{totalStaff - needsFix}</p>
                </div>
              </div>

              {needsFix > 0 && (
                <div className="mt-6">
                  <button
                    onClick={fixMenus}
                    disabled={fixing}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {fixing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wrench className="h-4 w-4" />
                    )}
                    {fixing ? "Fixing..." : "Fix All Staff Menus"}
                  </button>
                </div>
              )}
            </div>

            {/* Fix Results */}
            {fixResult && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-900">
                    Successfully updated {fixResult.data.updated} staff members
                  </p>
                </div>
              </div>
            )}

            {/* Staff List */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Staff Menu Permissions</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  staffStatus.map((staff, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                          <p className="text-xs text-gray-500">{staff.email}</p>
                          <p className="mt-1 text-xs text-gray-600">Role: {staff.staffRole}</p>
                        </div>
                        <div className="text-right">
                          {staff.hasMenus ? (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                <CheckCircle className="h-3 w-3" />
                                {staff.menuCount} menus
                              </span>
                              <div className="mt-2 flex flex-wrap justify-end gap-1">
                                {staff.allowedMenus.map((menu) => (
                                  <span
                                    key={menu}
                                    className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                                  >
                                    {menu}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                              <AlertTriangle className="h-3 w-3" />
                              No menus
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
