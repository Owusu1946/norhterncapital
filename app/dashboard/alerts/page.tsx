"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCard } from "@/components/dashboard/alerts/AlertCard";
import { Loader2 } from "lucide-react";

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

interface Order {
    _id: string;
    orderNumber: number;
    items: OrderItem[];
    total: number;
    paymentMethod: string;
    customerName?: string;
    status: string;
    createdAt: string;
}

// Helper to calculate relative time
function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function AlertsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastFetch, setLastFetch] = useState<Date>(new Date());
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/pos/orders?limit=50");
            if (res.ok) {
                const data = await res.json();
                setOrders(data.data.orders);
                setLastFetch(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchOrders();

        // Poll every 5 seconds for real-time updates
        pollingRef.current = setInterval(fetchOrders, 5000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    // Transform orders to alert format
    const alerts = orders.map((order) => ({
        id: order._id,
        orderId: order.orderNumber.toString(),
        status: order.status === "completed" ? "success" as const : "canceled" as const,
        message: order.status === "completed"
            ? "has been paid successfully"
            : "was cancelled",
        time: getRelativeTime(order.createdAt),
        amount: order.total,
        paymentMethod: order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1),
        items: order.items.map((item, index) => ({
            id: index.toString(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: "", // Will show placeholder
        })),
    }));

    return (
        <div className="p-8 pb-20 max-w-4xl mx-auto h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live • Updated {getRelativeTime(lastFetch.toISOString())}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-orange-500" />
                </div>
            ) : alerts.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-[2rem] p-8">
                    <p className="text-lg font-medium">No notifications yet</p>
                    <p className="text-sm mt-1">Order notifications will appear here in real-time</p>
                </div>
            ) : (
                alerts.map((alert) => (
                    <AlertCard key={alert.id} {...alert} />
                ))
            )}
        </div>
    );
}
