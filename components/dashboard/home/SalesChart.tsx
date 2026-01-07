"use client";

import { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface SalesDataPoint {
    time: string;
    sales: number;
}

interface SalesChartProps {
    data?: SalesDataPoint[];
}

export function SalesChart({ data = [] }: SalesChartProps) {
    // Use provided data or default empty data
    const chartData = data.length > 0 ? data : [
        { time: "6:00am", sales: 0 },
        { time: "9:00am", sales: 0 },
        { time: "12:00pm", sales: 0 },
        { time: "3:00pm", sales: 0 },
        { time: "6:00pm", sales: 0 },
        { time: "9:00pm", sales: 0 },
    ];

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 h-[300px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Daily Sales</h3>
                <div className="text-sm text-gray-400">Today</div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FB923C" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            tickFormatter={(value) => `₵${value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: number) => [`GH₵${value.toFixed(2)}`, 'Sales']}
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#F97316"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
