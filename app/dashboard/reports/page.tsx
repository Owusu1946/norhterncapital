"use client";

import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Package,
    CreditCard,
    Loader2,
    Calendar,
    Award,
    PieChart,
    BarChart3,
    Utensils,
    ShoppingBag,
    FileSpreadsheet,
    FileText,
    ChevronDown,
    X
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPie,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { enGB } from 'date-fns/locale';

interface ReportsData {
    financial: {
        allTime: { revenue: number; orders: number; avgOrderValue: number };
        thisMonth: { revenue: number; orders: number };
        lastMonth: { revenue: number; orders: number };
        thisWeek: { revenue: number; orders: number };
        today: { revenue: number; orders: number };
        selectedPeriod?: { revenue: number; orders: number };
        monthGrowth: number;
    };
    bestSellers: Array<{
        rank: number;
        name: string;
        quantity: number;
        revenue: number;
        orders: number;
    }>;
    paymentMethods: Array<{
        method: string;
        revenue: number;
        orders: number;
    }>;
    dailyRevenue: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
    orderTypes: Array<{
        type: string;
        count: number;
        revenue: number;
        orders: number;
    }>;
    inventory: {
        totalItems: number;
        totalCategories: number;
    };
}

const PAYMENT_COLORS: Record<string, string> = {
    cash: "#22C55E",
    card: "#3B82F6",
    momo: "#EAB308",
};

export default function ReportsPage() {
    const [data, setData] = useState<ReportsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const datePickerRef = useRef<HTMLDivElement>(null);

    // Close date picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchReports = async (start?: Date, end?: Date) => {
        setIsLoading(true);
        try {
            let url = "/api/pos/reports";
            if (start && end) {
                const params = new URLSearchParams({
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                });
                url += `?${params.toString()}`;
            }

            const res = await fetch(url);
            if (res.ok) {
                const result = await res.json();
                setData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchReports();
    }, []);

    const handleDateChange = (item: any) => {
        setDateRange([item.selection]);
    };

    const applyDateFilter = () => {
        setShowDatePicker(false);
        fetchReports(dateRange[0].startDate, dateRange[0].endDate);
    };

    const clearDateFilter = () => {
        const defaultStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const defaultEnd = new Date();
        setDateRange([{ startDate: defaultStart, endDate: defaultEnd, key: 'selection' }]);
        setShowDatePicker(false);
        fetchReports(); // Fetch default (no params = server defaults)
    };

    const formatDateDisplay = (date: Date) => {
        return date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
    };


    const handleExport = (type: "excel" | "csv") => {
        if (!data) return;

        const wb = XLSX.utils.book_new();
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "-");
        const timeStr = now.toLocaleTimeString();

        const filterStr = dateRange[0].startDate && dateRange[0].endDate ?
            `Period: ${formatDateDisplay(dateRange[0].startDate)} - ${formatDateDisplay(dateRange[0].endDate)}` : "Period: Current Month";

        // Helper to create header row with branding
        const createHeader = (title: string) => [
            ["Northern Capital Hotel Restaurant and Bar"],
            [`Report Generated: ${dateStr} ${timeStr}`],
            [filterStr],
            [title],
            [""] // Empty row
        ];

        // --- Data Preparation ---

        // 1. Financial Summary
        const summaryData = [
            ...createHeader("Financial Summary"),
            ["Metric", "Value", "Details"],
            ["Total Revenue (All Time)", data.financial.allTime.revenue, `${data.financial.allTime.orders} orders`],
            ["Average Order Value", data.financial.allTime.avgOrderValue, "Per order"],

            // Add Selected Period if exists
            ...(data.financial.selectedPeriod ? [
                ["Selected Period Revenue", data.financial.selectedPeriod.revenue, `${data.financial.selectedPeriod.orders} orders`]
            ] : []),

            ["Today's Revenue", data.financial.today.revenue, `${data.financial.today.orders} orders`],
            ["This Week's Revenue", data.financial.thisWeek.revenue, `${data.financial.thisWeek.orders} orders`],
            ["This Month's Revenue", data.financial.thisMonth.revenue, `${data.financial.thisMonth.orders} orders`],
            ["Month Growth", `${data.financial.monthGrowth}%`, "vs last month"],
            [""],
            ["Inventory Stats", "", ""],
            ["Total Menu Items", data.inventory.totalItems, ""],
            ["Total Categories", data.inventory.totalCategories, ""]
        ];

        // 2. Daily Revenue
        const dailyData = [
            ...createHeader("Daily Revenue History"),
            ["Date", "Revenue (GHS)", "Orders"],
            ...data.dailyRevenue.map(d => [
                new Date(d.date).toLocaleDateString(),
                d.revenue,
                d.orders
            ])
        ];

        // 3. Best Sellers
        const bestSellerData = [
            ...createHeader("Best Selling Items"),
            ["Rank", "Item Name", "Quantity Sold", "Revenue (GHS)", "Total Orders"],
            ...data.bestSellers.map(i => [i.rank, i.name, i.quantity, i.revenue, i.orders])
        ];

        // 4. Payment Methods
        const paymentData = [
            ...createHeader("Payment Methods Breakdown"),
            ["Method", "Revenue (GHS)", "Total Orders"],
            ...data.paymentMethods.map(p => [p.method, p.revenue, p.orders])
        ];

        // 5. Order Types
        const orderTypeData = [
            ...createHeader("Order Types Breakdown"),
            ["Type", "Revenue (GHS)", "Count"],
            ...data.orderTypes.map(o => [o.type, o.revenue, o.count])
        ];

        // --- Export Logic ---

        if (type === "excel") {
            // Add Sheets
            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
            const wsDaily = XLSX.utils.aoa_to_sheet(dailyData);
            const wsBestSellers = XLSX.utils.aoa_to_sheet(bestSellerData);
            const wsPayment = XLSX.utils.aoa_to_sheet(paymentData);
            const wsOrderType = XLSX.utils.aoa_to_sheet(orderTypeData);

            XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
            XLSX.utils.book_append_sheet(wb, wsDaily, "Daily Revenue");
            XLSX.utils.book_append_sheet(wb, wsBestSellers, "Best Sellers");
            XLSX.utils.book_append_sheet(wb, wsPayment, "Payment Methods");
            XLSX.utils.book_append_sheet(wb, wsOrderType, "Order Types");

            XLSX.writeFile(wb, `NCH_Report_${dateStr}.xlsx`);
        } else {
            // CSV: Combine all into one master sheet
            const masterData = [
                ...summaryData,
                ["", "", ""], ["", "", ""], // Spacers
                ...dailyData,
                ["", "", ""], ["", "", ""],
                ...bestSellerData,
                ["", "", ""], ["", "", ""],
                ...paymentData,
                ["", "", ""], ["", "", ""],
                ...orderTypeData
            ];

            const wsMaster = XLSX.utils.aoa_to_sheet(masterData);
            const csv = XLSX.utils.sheet_to_csv(wsMaster);

            // Manual download
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `NCH_Full_Report_${dateStr}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (isLoading && !data) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-orange-500" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                <p>Failed to load reports</p>
            </div>
        );
    }

    const formatCurrency = (value: number) =>
        `GH₵${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Format daily revenue for chart
    const chartData = data.dailyRevenue.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short", day: 'numeric' }),
    }));

    // Payment method pie data
    const paymentPieData = data.paymentMethods.map((p) => ({
        name: p.method.charAt(0).toUpperCase() + p.method.slice(1),
        value: p.revenue,
        color: PAYMENT_COLORS[p.method] || "#9CA3AF",
    }));

    // Order type data
    const dineIn = data.orderTypes.find((o) => o.type === "dine-in");
    const takeaway = data.orderTypes.find((o) => o.type === "takeaway");

    return (
        <div className="p-8 pb-20 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Financial overview and performance metrics</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Filter */}
                    <div className="relative" ref={datePickerRef}>
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-bold shadow-sm"
                        >
                            <Calendar size={16} className="text-gray-500" />
                            {formatDateDisplay(dateRange[0].startDate)} - {formatDateDisplay(dateRange[0].endDate)}
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>

                        {showDatePicker && (
                            <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
                                <DateRangePicker
                                    onChange={handleDateChange}
                                    months={1}
                                    ranges={dateRange}
                                    direction="horizontal"
                                    rangeColors={['#F97316']} // Orange
                                    locale={enGB}
                                />
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={clearDateFilter}
                                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={applyDateFilter}
                                        className="px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 shadow-md shadow-orange-200"
                                    >
                                        Apply Filter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>


                    <button
                        onClick={() => handleExport("csv")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-bold shadow-sm"
                    >
                        <FileText size={16} />
                        Export CSV
                    </button>
                    <button
                        onClick={() => handleExport("excel")}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-bold shadow-sm shadow-green-200"
                    >
                        <FileSpreadsheet size={16} />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* All Time Revenue (or Selected if filtered) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="text-orange-500" size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase">
                            {data.financial.selectedPeriod ? "Selected Period" : "All Time"}
                        </span>
                    </div>
                    <p className="text-2xl font-black text-gray-800">
                        {formatCurrency(data.financial.selectedPeriod ? data.financial.selectedPeriod.revenue : data.financial.allTime.revenue)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
                </div>

                {/* Growth / Trend (Relative to previous period of selection) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-green-500" size={24} />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${data.financial.monthGrowth >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}>
                            {data.financial.monthGrowth >= 0 ? "+" : ""}{data.financial.monthGrowth}%
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">Growth</p>
                    <p className="text-sm text-gray-500 mt-1">vs Previous Period</p>
                </div>

                {/* Total Orders (in selection) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="text-blue-500" size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase">
                            {data.financial.selectedPeriod ? "Selected Period" : "All Time"}
                        </span>
                    </div>
                    <p className="text-2xl font-black text-gray-800">
                        {(data.financial.selectedPeriod ? data.financial.selectedPeriod.orders : data.financial.allTime.orders).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Total Orders</p>
                </div>

                {/* Avg Order Value (All time for stability, or calculate for period) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <BarChart3 className="text-purple-500" size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Avg (All Time)</span>
                    </div>
                    <p className="text-2xl font-black text-gray-800">{formatCurrency(data.financial.allTime.avgOrderValue)}</p>
                    <p className="text-sm text-gray-500 mt-1">Per Order</p>
                </div>
            </div>

            {/* Quick Stats Row - Fixed Contexts (Today, Week) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="text-orange-500" size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                            <p className="text-2xl font-black text-gray-800">{formatCurrency(data.financial.today.revenue)}</p>
                            <p className="text-xs text-gray-400 mt-1">{data.financial.today.orders} orders</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Calendar className="text-blue-500" size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">This Week</p>
                            <p className="text-2xl font-black text-gray-800">{formatCurrency(data.financial.thisWeek.revenue)}</p>
                            <p className="text-xs text-gray-400 mt-1">{data.financial.thisWeek.orders} orders</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                            <Package className="text-green-500" size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Menu Items</p>
                            <p className="text-2xl font-black text-gray-800">{data.inventory.totalItems}</p>
                            <p className="text-xs text-gray-400 mt-1">{data.inventory.totalCategories} categories</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Revenue Trend (Selected Period)</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={(v) => `₵${v}`} />
                                <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                                <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Methods Pie */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Payment Methods</h3>
                    <div className="h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie
                                    data={paymentPieData}
                                    innerRadius={50}
                                    outerRadius={80}
                                    dataKey="value"
                                    paddingAngle={5}
                                    cornerRadius={10}
                                >
                                    {paymentPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Order Types & Best Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Types */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Order Types</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                                    <Utensils className="text-white" size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">Dine In</p>
                                    <p className="text-sm text-gray-500">{dineIn?.count || 0} orders</p>
                                </div>
                            </div>
                            <p className="font-bold text-gray-800">{formatCurrency(dineIn?.revenue || 0)}</p>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="text-white" size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">Take Away</p>
                                    <p className="text-sm text-gray-500">{takeaway?.count || 0} orders</p>
                                </div>
                            </div>
                            <p className="font-bold text-gray-800">{formatCurrency(takeaway?.revenue || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Best Sellers */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-gray-800">Best Selling Items</h3>
                        <Award className="text-orange-500" size={24} />
                    </div>
                    {data.bestSellers.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No sales data for this period</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-gray-100">
                                        <th className="pb-3 text-sm font-bold text-gray-500">#</th>
                                        <th className="pb-3 text-sm font-bold text-gray-500">Item</th>
                                        <th className="pb-3 text-sm font-bold text-gray-500 text-right">Qty Sold</th>
                                        <th className="pb-3 text-sm font-bold text-gray-500 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.bestSellers.slice(0, 5).map((item) => (
                                        <tr key={item.rank} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${item.rank === 1 ? "bg-yellow-100 text-yellow-600" :
                                                    item.rank === 2 ? "bg-gray-100 text-gray-600" :
                                                        item.rank === 3 ? "bg-orange-100 text-orange-600" :
                                                            "bg-gray-50 text-gray-400"
                                                    }`}>
                                                    {item.rank}
                                                </span>
                                            </td>
                                            <td className="py-3 font-medium text-gray-800">{item.name}</td>
                                            <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                                            <td className="py-3 text-right font-bold text-orange-500">{formatCurrency(item.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
