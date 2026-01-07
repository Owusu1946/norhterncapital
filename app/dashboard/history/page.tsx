"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { HistoryTable } from "@/components/dashboard/history/HistoryTable";

interface Order {
    _id: string;
    orderNumber: number;
    items: any[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    amountPaid: number;
    change: number;
    customerName?: string;
    orderType: string;
    status: string;
    createdAt: string;
}

export default function HistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/pos/orders?limit=100");
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data.data.orders);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Filter orders by search query
    const filteredOrders = orders.filter((order) => {
        const searchTerm = searchQuery.toLowerCase();
        return (
            order.orderNumber.toString().includes(searchTerm) ||
            order.customerName?.toLowerCase().includes(searchTerm) ||
            order.paymentMethod.toLowerCase().includes(searchTerm)
        );
    });

    return (
        <div className="p-8 pb-20 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 gap-4">
                <div className="relative flex-1 max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Order #, Customer, or Payment Method..."
                        className="w-full pl-16 pr-4 py-4 rounded-2xl bg-white border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm font-medium"
                    />
                </div>

                <div className="text-sm text-gray-500 bg-white px-4 py-3 rounded-xl shadow-sm">
                    {filteredOrders.length} orders
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-orange-500" />
                </div>
            ) : (
                <HistoryTable orders={filteredOrders} />
            )}
        </div>
    );
}
