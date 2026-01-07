"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface StaffUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    staffRole?: string;
}

interface StaffAuthContextType {
    user: StaffUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

interface SignupData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    staffRole?: string;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<StaffUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            const res = await fetch("/api/pos/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data.data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch("/api/pos/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setUser(data.data.user);
                return { success: true };
            }

            return { success: false, error: data.error || "Login failed" };
        } catch (error) {
            return { success: false, error: "Network error" };
        }
    };

    const signup = async (signupData: SignupData) => {
        try {
            const res = await fetch("/api/pos/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signupData),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setUser(data.data.user);
                return { success: true };
            }

            return { success: false, error: data.error || "Signup failed" };
        } catch (error) {
            return { success: false, error: "Network error" };
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/pos/auth/logout", { method: "POST" });
        } finally {
            setUser(null);
            router.push("/dashboard/auth/login");
        }
    };

    return (
        <StaffAuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                refreshUser,
            }}
        >
            {children}
        </StaffAuthContext.Provider>
    );
}

export function useStaffAuth() {
    const context = useContext(StaffAuthContext);
    if (context === undefined) {
        throw new Error("useStaffAuth must be used within a StaffAuthProvider");
    }
    return context;
}
