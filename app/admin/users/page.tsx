"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { UserPlus, Mail, Lock, ShieldCheck } from "lucide-react";

interface StaffOption {
  id: string;
  name: string;
  role: string;
}

interface UserAccount {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  email: string;
  status: "active" | "disabled";
}

const staffOptions: StaffOption[] = [
  { id: "s-1", name: "Ama Mensimah", role: "Front desk agent" },
  { id: "s-2", name: "Kojo Asante", role: "Housekeeping" },
  { id: "s-3", name: "Adwoa Agyeman", role: "Night manager" },
];

const initialUsers: UserAccount[] = [
  {
    id: "u-1",
    staffId: "s-3",
    staffName: "Adwoa Agyeman",
    role: "Night manager",
    email: "admin@northerncapital.com",
    status: "active",
  },
];

function statusBadge(status: UserAccount["status"]) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <ShieldCheck className="h-3 w-3" /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
      Disabled
    </span>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [staffId, setStaffId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    const staff = staffOptions.find((s) => s.id === staffId);
    const trimmedEmail = email.trim();
    if (!staff || !trimmedEmail || !password.trim()) return;

    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      email: trimmedEmail,
      status: "active",
    };

    setUsers((prev) => [newUser, ...prev]);
    setStaffId("");
    setEmail("");
    setPassword("");
  }

  function toggleStatus(id: string) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "active" ? "disabled" : "active" }
          : user
      )
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Users</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Link staff to login accounts for the admin dashboard.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Users list */}
              <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="hidden border-b border-gray-100 bg-gray-50 px-4 py-2 text-[11px] font-medium text-gray-500 md:grid md:grid-cols-[2fr,2fr,2fr,1.2fr]">
                  <div>User / role</div>
                  <div>Staff member</div>
                  <div>Email</div>
                  <div className="text-right">Status</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="grid gap-3 px-4 py-3 text-xs text-gray-700 md:grid-cols-[2fr,2fr,2fr,1.2fr] md:items-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-gray-900">{user.staffName}</p>
                        <p className="text-[11px] text-gray-500">Role: {user.role}</p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-[11px] text-gray-500">Linked staff ID: {user.staffId}</p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="inline-flex items-center gap-1 text-[11px] text-gray-700">
                          <Mail className="h-3 w-3" /> {user.email}
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {statusBadge(user.status)}
                        <button
                          type="button"
                          onClick={() => toggleStatus(user.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                        >
                          {user.status === "active" ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </div>
                  ))}

                  {users.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-gray-400">
                      No users yet. Create one on the right.
                    </div>
                  )}
                </div>
              </div>

              {/* Create user form */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">Create dashboard user</h2>
                <form onSubmit={handleCreateUser} className="space-y-3 text-xs text-gray-700">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-700">Staff member</label>
                    <select
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select staff</option>
                      {staffOptions.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} – {staff.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Set a password"
                        className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                      Create user
                    </button>
                  </div>

                  <p className="pt-1 text-[10px] text-gray-400">
                    This is a demo UI for managing dashboard users. Hook it up to your auth
                    system to make the accounts real.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
