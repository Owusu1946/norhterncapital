"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { User, Phone, ShieldCheck, Edit2, FileSpreadsheet, Download, Loader2, Mail, Lock } from "lucide-react";
import { generateStaffReport } from "@/lib/reportGenerator";

interface StaffRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  staffRole: string;
  allowedMenus: string[];
  isActive: boolean;
  createdAt: string;
}

const allMenus = [
  "Dashboard",
  "Analytics",
  "Guests",
  "Bookings",
  "Messages",
  "Payments",
  "Staff",
  "Users",
  "Rooms",
];


function statusBadge(isActive: boolean) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <ShieldCheck className="h-3 w-3" /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
      Inactive
    </span>
  );
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [staffRole, setStaffRole] = useState("Receptionist");
  const [isActive, setIsActive] = useState(true);
  const [menus, setMenus] = useState<string[]>(["Dashboard", "Bookings", "Guests"]);
  const [roleOptions, setRoleOptions] = useState<string[]>(["Receptionist", "Manager", "Housekeeping", "Front Desk"]);
  const [newRole, setNewRole] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch staff members
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/staff/all", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaff(data.data.staff);
        }
      } else {
        console.error("Failed to fetch staff");
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  function startNew() {
    setSelectedId("new");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setStaffRole("Receptionist");
    setIsActive(true);
    setMenus(["Dashboard", "Bookings", "Guests"]);
    setMessage(null);
  }

  function startEdit(id: string) {
    const member = staff.find((s) => s.id === id);
    if (!member) return;
    setSelectedId(id);
    setEmail(member.email);
    setPassword(""); // Don't show password
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setPhone(member.phone);
    setStaffRole(member.staffRole);
    setIsActive(member.isActive);
    setMenus(member.allowedMenus);
    setMessage(null);
  }

  function toggleMenu(menu: string) {
    setMenus((prev) =>
      prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu]
    );
  }

  function handleExport(format: "csv" | "excel") {
    const exportData = staff.map(s => ({
      ...s,
      contact: s.phone,
      menuAccess: s.allowedMenus
    }));
    generateStaffReport(exportData, format);
  }

  function handleAddRole() {
    const trimmed = newRole.trim();
    if (!trimmed) return;
    setRoleOptions((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed]
    );
    setStaffRole(trimmed);
    setNewRole("");
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      if (!selectedId || selectedId === "new") {
        // Create new staff
        if (!email || !password || !firstName || !lastName) {
          setMessage({ type: "error", text: "Please fill in all required fields" });
          setSaving(false);
          return;
        }

        const response = await fetch("/api/staff/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            staffRole: staffRole || "Receptionist",
            allowedMenus: menus.length ? menus : ["Dashboard", "Bookings", "Guests"],
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setMessage({ type: "success", text: "Staff member created successfully!" });
          await fetchStaff();
          setSelectedId(null);
        } else {
          setMessage({ type: "error", text: data.message || "Failed to create staff member" });
        }
      } else {
        // Update existing staff
        const response = await fetch("/api/staff/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            staffId: selectedId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            staffRole: staffRole || "Receptionist",
            allowedMenus: menus.length ? menus : ["Dashboard", "Bookings", "Guests"],
            isActive,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setMessage({ type: "success", text: "Staff member updated successfully!" });
          await fetchStaff();
          setSelectedId(null);
        } else {
          setMessage({ type: "error", text: data.message || "Failed to update staff member" });
        }
      }
    } catch (error) {
      console.error("Error saving staff:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const selectedLabel =
    selectedId === "new"
      ? "Create staff member"
      : selectedId
      ? "Edit staff member"
      : "Staff details";

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Staff</h1>
                <p className="mt-1 text-sm text-gray-500">
                  See who is on duty, assign roles and control menu access.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExport("excel")}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={startNew}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
                >
                  <User className="h-4 w-4" />
                  <span>New staff</span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Staff list */}
              <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="hidden border-b border-gray-100 bg-gray-50 px-4 py-2 text-[11px] font-medium text-gray-500 md:grid md:grid-cols-[2fr,2fr,1.8fr,1.6fr]">
                  <div>Staff member</div>
                  <div>Role</div>
                  <div>Contact / shift</div>
                  <div className="text-right">Status / access</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-600">Loading staff...</p>
                      </div>
                    </div>
                  ) : staff.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                      <p className="text-sm text-gray-600">No staff members yet.</p>
                      <p className="text-xs text-gray-500 mt-1">Click "New staff" to add one.</p>
                    </div>
                  ) : staff.map((member) => (
                    <div
                      key={member.id}
                      className="grid gap-3 px-4 py-3 text-xs text-gray-700 md:grid-cols-[2fr,2fr,1.8fr,1.6fr] md:items-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-700">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-[11px] text-gray-500">Staff ID: {member.id}</p>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-gray-900">{member.staffRole}</p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {member.allowedMenus.join(" • ")}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="inline-flex items-center gap-1 text-[11px] text-gray-700">
                          <Phone className="h-3 w-3" /> {member.phone || "No phone"}
                        </p>
                        <p className="text-[11px] text-gray-500">{member.email}</p>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {statusBadge(member.isActive)}
                        <button
                          type="button"
                          onClick={() => startEdit(member.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor panel */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">{selectedLabel}</h2>
                
                {message && (
                  <div className={`mb-3 rounded-xl px-3 py-2 text-xs ${
                    message.type === "success" 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "bg-red-50 text-red-700"
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-3 text-xs text-gray-700">
                  {(!selectedId || selectedId === "new") && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-700">Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. staff@hotel.com"
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-700">Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            required
                            minLength={6}
                            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-700">First name *</label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Ama"
                        required
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-700">Last name *</label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Mensimah"
                        required
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-700">Role / title</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Add new role..."
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddRole}
                        className="rounded-xl border border-gray-300 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-700">Phone number</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +233 24 ..."
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {selectedId && selectedId !== "new" && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-700">Status</label>
                      <select
                        value={isActive ? "active" : "inactive"}
                        onChange={(e) => setIsActive(e.target.value === "active")}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-700">
                      Menus this staff can see
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {allMenus.map((menu) => {
                        const active = menus.includes(menu);
                        return (
                          <button
                            key={menu}
                            type="button"
                            onClick={() => toggleMenu(menu)}
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                              active
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {menu}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {saving ? "Saving..." : "Save staff"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
