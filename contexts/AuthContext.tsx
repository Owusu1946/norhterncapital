"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    country?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem("nch_user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user exists in localStorage (mock database)
      const users = JSON.parse(localStorage.getItem("nch_users") || "[]");
      const existingUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (!existingUser) {
        setIsLoading(false);
        return { success: false, error: "Invalid email or password" };
      }

      const userData: User = {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        phone: existingUser.phone,
        country: existingUser.country
      };

      setUser(userData);
      localStorage.setItem("nch_user", JSON.stringify(userData));
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    country?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem("nch_users") || "[]");
      const existingUser = users.find((u: any) => u.email === userData.email);
      
      if (existingUser) {
        setIsLoading(false);
        return { success: false, error: "An account with this email already exists" };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        ...userData
      };

      users.push(newUser);
      localStorage.setItem("nch_users", JSON.stringify(users));

      const userForState: User = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        country: newUser.country
      };

      setUser(userForState);
      localStorage.setItem("nch_user", JSON.stringify(userForState));
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Signup failed. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("nch_user");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
