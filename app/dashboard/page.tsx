"use client";

import { useState, useEffect } from "react";
import { Search, ArrowUpRight, ShoppingCart, Utensils, ShoppingBag } from "lucide-react";
import { StatCard } from "@/components/dashboard/home/StatCard";
import { SalesChart } from "@/components/dashboard/home/SalesChart";
import { IncomeChart } from "@/components/dashboard/home/IncomeChart";
import { DishList } from "@/components/dashboard/home/DishList";

interface Stats {
    today: {
        revenue: number;
        orders: number;
        dineIn: number;
        takeaway: number;
    };
    trends: {
        revenue: number;
        orders: number;
    };
    allTime: {
        totalOrders: number;
        totalIncome: number;
    };
    trendingDishes: Array<{
        id: string;
        name: string;
        totalOrders: number;
    }>;
    hourlySales: Array<{
        time: string;
        sales: number;
    }>;
    incomeByCategory: Array<{
        name: string;
        value: number;
    }>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/pos/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();

        // Poll every 10 seconds for real-time updates
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    // Format values with placeholders during loading
    const revenue = stats ? `GH₵${stats.today.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "GH₵--";
    const orders = stats ? stats.today.orders.toString() : "--";
    const dineIn = stats ? stats.today.dineIn.toString() : "--";
    const takeaway = stats ? stats.today.takeaway.toString() : "--";

    // Trends
    const revenueTrend = stats?.trends.revenue ?? 0;
    const ordersTrend = stats?.trends.orders ?? 0;

    // Trending dishes
    const trendingDishes = stats?.trendingDishes.map(dish => ({
        id: dish.id,
        name: dish.name,
        image: "",
        metaPrimary: `Order : ${dish.totalOrders}`,
    })) || [];

    return (
        <div className="p-8 pb-20 overflow-y-auto h-full pr-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Northern Capital Hotel</h1>
                    <p className="text-sm text-gray-500 mt-1">{new Date().toDateString()}</p>
                </div>
                <div className="relative w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search category, menu or etc"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm font-medium"
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Revenue"
                    value={revenue}
                    icon={ArrowUpRight}
                    iconColor="bg-orange-500"
                    trend={revenueTrend >= 0 ? "up" : "down"}
                    trendValue={`${revenueTrend >= 0 ? "+" : ""}${revenueTrend}%`}
                />
                <StatCard
                    title="Orders"
                    value={orders}
                    icon={ShoppingCart}
                    iconColor="bg-green-500"
                    trend={ordersTrend >= 0 ? "up" : "down"}
                    trendValue={`${ordersTrend >= 0 ? "+" : ""}${ordersTrend}%`}
                />
                <StatCard
                    title="Dine in"
                    value={dineIn}
                    icon={Utensils}
                    iconColor="bg-red-500"
                    trend="up"
                    trendValue="Today"
                />
                <StatCard
                    title="Take away"
                    value={takeaway}
                    icon={ShoppingBag}
                    iconColor="bg-yellow-400"
                    trend="up"
                    trendValue="Today"
                />
            </div>

            {/* Charts Section - Line chart wider than pie chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <SalesChart data={stats?.hourlySales} />
                </div>
                <div className="lg:col-span-1">
                    <IncomeChart
                        data={stats?.incomeByCategory}
                        totalIncome={stats?.allTime.totalIncome || 0}
                    />
                </div>
            </div>

            {/* Trending Dishes Section */}
            <div className="grid grid-cols-1 gap-6">
                <DishList title="Trending dishes" items={trendingDishes} />
            </div>

        </div>
    );
}
