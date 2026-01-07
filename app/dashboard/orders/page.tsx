"use client";

import { useState } from "react";
import { OrderCard } from "@/components/dashboard/orders/OrderCard";
import { OrderDetailPanel } from "@/components/dashboard/orders/OrderDetailPanel";

// Mock Data
const MOCK_ORDERS = [
    { id: "907653", table: "T1", time: "20:30pm", itemsCount: 7, total: 40.49, status: "active" as const },
    { id: "907654", table: "T2", time: "20:35pm", itemsCount: 4, total: 45.08, status: "active" as const },
    { id: "907655", table: "T3", time: "20:40pm", itemsCount: 2, total: 35.08, status: "active" as const },
    { id: "907656", table: "T4", time: "20:45pm", itemsCount: 6, total: 55.08, status: "active" as const },
];

const MOCK_ORDER_ITEMS = [
    { id: "1", name: "Orange Juice", note: "Less Ice", price: 2.87, quantity: 4, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { id: "2", name: "American Favorite", note: "Stuffed Crust Sosis", price: 4.87, quantity: 1, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" },
    { id: "3", name: "Super Supreme", note: "Stuffed Crust Cheese", price: 5.75, quantity: 1, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400" },
    { id: "4", name: "Favorite Cheese", note: "Stuffed Crust Sosis", price: 6.57, quantity: 1, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400" },
];

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState<"on-process" | "completed">("on-process");
    const [selectedOrderId, setSelectedOrderId] = useState(MOCK_ORDERS[0].id);

    const selectedOrder = MOCK_ORDERS.find(o => o.id === selectedOrderId);

    // In a real app we would fetch items for the specific order.
    // Here we just use the same items list for demo purposes.
    const currentItems = MOCK_ORDER_ITEMS;

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8F9FD]">

            {/* LEFT: Order List */}
            <div className="flex-1 flex flex-col p-8 pr-4 h-full overflow-hidden">

                {/* Header Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab("on-process")}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'on-process' ? 'bg-orange-100 text-orange-500' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        On - process
                    </button>
                    <button
                        onClick={() => setActiveTab("completed")}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'completed' ? 'bg-orange-100 text-orange-500' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Completed
                    </button>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide pb-20">
                    {MOCK_ORDERS.map((order) => (
                        <OrderCard
                            key={order.id}
                            {...order}
                            isActive={selectedOrderId === order.id}
                            onClick={() => setSelectedOrderId(order.id)}
                        />
                    ))}
                </div>
            </div>

            {/* RIGHT: Detail Panel */}
            <div className="w-[450px] h-full z-20">
                {selectedOrder && (
                    <OrderDetailPanel
                        orderId={selectedOrder.id}
                        table={selectedOrder.table}
                        items={currentItems}
                    />
                )}
            </div>

        </div>
    );
}
