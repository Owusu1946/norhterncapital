"use client";

import React, { useState, useMemo } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Calendar,
  Download,
  Coffee,
  Award,
  AlertCircle,
} from "lucide-react";

// Mock data
const dailyRevenue = [
  { day: "Mon", revenue: 1250, orders: 28 },
  { day: "Tue", revenue: 1480, orders: 32 },
  { day: "Wed", revenue: 1320, orders: 30 },
  { day: "Thu", revenue: 1680, orders: 38 },
  { day: "Fri", revenue: 2250, orders: 48 },
  { day: "Sat", revenue: 2680, orders: 56 },
  { day: "Sun", revenue: 2120, orders: 45 },
];

const categoryPerformance = [
  { category: "Breakfast", revenue: 3200, orders: 85, color: "#3B82F6" },
  { category: "Lunch", revenue: 4500, orders: 92, color: "#10B981" },
  { category: "Dinner", revenue: 5800, orders: 78, color: "#F59E0B" },
  { category: "Drinks", revenue: 2100, orders: 120, color: "#EF4444" },
  { category: "Desserts", revenue: 1600, orders: 65, color: "#8B5CF6" },
];

const topItems = [
  { name: "Grilled Chicken", sales: 145, revenue: 9425 },
  { name: "English Breakfast", sales: 132, revenue: 5940 },
  { name: "Caesar Salad", sales: 98, revenue: 3920 },
  { name: "Beef Steak", sales: 76, revenue: 9120 },
  { name: "Cappuccino", sales: 210, revenue: 5250 },
];

const hourlyOrders = [
  { hour: "6AM", orders: 5 },
  { hour: "7AM", orders: 12 },
  { hour: "8AM", orders: 28 },
  { hour: "9AM", orders: 35 },
  { hour: "10AM", orders: 22 },
  { hour: "11AM", orders: 18 },
  { hour: "12PM", orders: 42 },
  { hour: "1PM", orders: 48 },
  { hour: "2PM", orders: 38 },
  { hour: "3PM", orders: 25 },
  { hour: "4PM", orders: 20 },
  { hour: "5PM", orders: 28 },
  { hour: "6PM", orders: 45 },
  { hour: "7PM", orders: 52 },
  { hour: "8PM", orders: 38 },
  { hour: "9PM", orders: 22 },
  { hour: "10PM", orders: 8 },
];

export default function RestaurantAnalyticsPage() {
  const [dateRange, setDateRange] = useState("week");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const totalRevenue = useMemo(() => {
    return dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
  }, []);

  const totalOrders = useMemo(() => {
    return dailyRevenue.reduce((sum, day) => sum + day.orders, 0);
  }, []);

  const averageOrderValue = useMemo(() => {
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  }, [totalRevenue, totalOrders]);

  const revenueGrowth = 12.5; // Mock percentage

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Track your restaurant's performance and insights
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm transition-colors">
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₵{totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  {revenueGrowth > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">+{revenueGrowth}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500">{revenueGrowth}%</span>
                    </>
                  )}
                  <span className="text-gray-500 ml-2">vs last week</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Avg {Math.round(totalOrders / 7)} orders/day
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₵{averageOrderValue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-2">Per transaction</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Peak Hours</p>
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">12-2 PM</p>
                <p className="text-sm text-gray-500 mt-2">Lunch rush</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Daily Revenue Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Revenue Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category Performance */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sales by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hourly Orders */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Orders by Hour
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={hourlyOrders}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Selling Items */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-orange-500" />
                  Top Selling Items
                </h3>
                <div className="space-y-3">
                  {topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {index + 1}. {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.sales} sold</p>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        ₵{item.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Stats Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Category Performance Details
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Order Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryPerformance.map((cat) => {
                      const totalCatRevenue = categoryPerformance.reduce((sum, c) => sum + c.revenue, 0);
                      const percentage = ((cat.revenue / totalCatRevenue) * 100).toFixed(1);
                      const avgValue = cat.revenue / cat.orders;
                      
                      return (
                        <tr key={cat.category} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="h-3 w-3 rounded-full mr-2"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {cat.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cat.orders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₵{cat.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₵{avgValue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: cat.color,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-500">{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
