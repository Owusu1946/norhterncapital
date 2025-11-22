"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  ChefHat,
  Timer,
  XCircle,
  Bell,
  RefreshCw,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
  isReady?: boolean;
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready";
  priority: "normal" | "high" | "urgent";
  orderTime: Date;
  startTime?: Date;
  estimatedTime: number; // in minutes
  specialInstructions?: string;
}

// Mock data
const mockKitchenOrders: KitchenOrder[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    tableNumber: "12",
    items: [
      { name: "Grilled Chicken", quantity: 2, notes: "Extra spicy" },
      { name: "Caesar Salad", quantity: 1 },
    ],
    status: "preparing",
    priority: "high",
    orderTime: new Date(Date.now() - 15 * 60000),
    startTime: new Date(Date.now() - 10 * 60000),
    estimatedTime: 25,
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    items: [
      { name: "English Breakfast", quantity: 1 },
      { name: "Pancakes", quantity: 2, notes: "No syrup" },
    ],
    status: "pending",
    priority: "normal",
    orderTime: new Date(Date.now() - 5 * 60000),
    estimatedTime: 20,
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    tableNumber: "5",
    items: [
      { name: "Beef Steak", quantity: 1, notes: "Medium rare" },
      { name: "Grilled Salmon", quantity: 1 },
    ],
    status: "pending",
    priority: "urgent",
    orderTime: new Date(Date.now() - 3 * 60000),
    estimatedTime: 30,
    specialInstructions: "VIP customer - Priority service",
  },
];

const priorityColors = {
  normal: "border-gray-200",
  high: "border-orange-300 bg-orange-50",
  urgent: "border-red-300 bg-red-50 animate-pulse",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  preparing: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
};

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>(mockKitchenOrders);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedView, setSelectedView] = useState<"all" | "pending" | "preparing">("all");

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (selectedView === "all") return order.status !== "ready";
    return order.status === selectedView;
  });

  const getElapsedTime = (orderTime: Date) => {
    const diff = currentTime.getTime() - orderTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const startPreparing = (orderId: string) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: "preparing" as const, startTime: new Date() }
        : order
    ));
  };

  const markAsReady = (orderId: string) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: "ready" as const }
        : order
    ));
    // Play a notification sound
    // new Audio("/notification.mp3").play();
  };

  const toggleItemReady = (orderId: string, itemIndex: number) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = [...order.items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          isReady: !updatedItems[itemIndex].isReady,
        };
        return { ...order, items: updatedItems };
      }
      return order;
    }));
  };

  const cancelOrder = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      setOrders(orders.filter(order => order.id !== orderId));
    }
  };

  // Sort orders by priority and time
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.orderTime.getTime() - b.orderTime.getTime();
  });

  return (
    <div className="flex h-screen bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Kitchen Display</h1>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5" />
                  <span className="text-xl font-mono">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Filters */}
                <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedView("all")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedView === "all"
                        ? "bg-gray-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    All Active
                  </button>
                  <button
                    onClick={() => setSelectedView("pending")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedView === "pending"
                        ? "bg-gray-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setSelectedView("preparing")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedView === "preparing"
                        ? "bg-gray-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Preparing
                  </button>
                </div>

                <button
                  onClick={() => setOrders([...orders])}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-lg border-2 overflow-hidden ${
                  priorityColors[order.priority]
                }`}
              >
                {/* Order Header */}
                <div className="p-3 bg-gray-50 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {order.orderNumber}
                      </span>
                      {order.tableNumber && (
                        <span className="text-sm text-gray-600">
                          Table {order.tableNumber}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      statusColors[order.status]
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono">{getElapsedTime(order.orderTime)}</span>
                    </div>
                    
                    {order.priority !== "normal" && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className={`h-4 w-4 ${
                          order.priority === "urgent" ? "text-red-500" : "text-orange-500"
                        }`} />
                        <span className={`text-xs font-medium ${
                          order.priority === "urgent" ? "text-red-500" : "text-orange-500"
                        }`}>
                          {order.priority.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 ${
                        item.isReady ? "opacity-50" : ""
                      }`}
                    >
                      <button
                        onClick={() => toggleItemReady(order.id, index)}
                        className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded border-2 ${
                          item.isReady
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {item.isReady && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          item.isReady ? "line-through text-gray-400" : "text-gray-900"
                        }`}>
                          {item.quantity}x {item.name}
                        </div>
                        {item.notes && (
                          <div className="text-xs text-orange-600 font-medium">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {order.specialInstructions && (
                    <div className="pt-2 mt-2 border-t">
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ {order.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-gray-50 border-t">
                  {order.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startPreparing(order.id)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                      >
                        Start Preparing
                      </button>
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : order.status === "preparing" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Est. time: {order.estimatedTime} min</span>
                        {order.startTime && (
                          <span>Started: {getElapsedTime(order.startTime)} ago</span>
                        )}
                      </div>
                      <button
                        onClick={() => markAsReady(order.id)}
                        disabled={!order.items.every(item => item.isReady)}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Mark as Ready
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Ready for Service</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
              <ChefHat className="h-16 w-16 mb-4" />
              <p className="text-xl font-medium">No orders in the kitchen</p>
              <p className="text-sm mt-2">New orders will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
