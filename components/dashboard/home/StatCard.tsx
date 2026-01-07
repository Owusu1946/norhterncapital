"use client";

import { createElement } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    icon: any; // Using any for flexibility with icons (emoji or Lucide)
    iconColor: string; // Tailwind bg class
    trend: "up" | "down";
    trendValue: string;
}

export function StatCard({ title, value, icon: Icon, iconColor, trend, trendValue }: StatCardProps) {
    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-500 font-bold mb-1">{title}</h3>
                    {/* Trend Indicator */}
                    <div className={`flex items-center text-xs font-bold ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
                        {trend === "up" ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />}
                        <span className="ml-1">{trendValue}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl text-white shadow-md ${iconColor}`}>
                    {/* If string (emoji) or Component */}
                    {typeof Icon === 'string' ? Icon : <Icon className="w-6 h-6" />}
                </div>
                <span className="text-3xl font-bold text-gray-800">{value}</span>
            </div>
        </div>
    );
}
