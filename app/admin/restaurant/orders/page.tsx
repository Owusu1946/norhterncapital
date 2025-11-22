"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChefHat,
  Eye,
  Printer,
  RefreshCw,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber?: string;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "served" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: "cash" | "card";
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  preparedBy?: string;
  servedBy?: string;
  notes?: string;
}

// Mock data - will be replaced with API calls
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customerName: "John Doe",
    tableNumber: "12",
    items: [
      { name: "Grilled Chicken", quantity: 2, price: 65 },
      { name: "Caesar Salad", quantity: 1, price: 40 },
      { name: "Orange Juice", quantity: 3, price: 20 },
    ],
    status: "preparing",
    paymentStatus: "paid",
    paymentMethod: "card",
    subtotal: 230,
    tax: 28.75,
    total: 258.75,
    createdAt: new Date("2024-11-22T10:30:00"),
    updatedAt: new Date("2024-11-22T10:35:00"),
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customerName: "Jane Smith",
    items: [
      { name: "English Breakfast", quantity: 1, price: 45 },
      { name: "Cappuccino", quantity: 2, price: 25 },
    ],
    status: "ready",
    paymentStatus: "pending",
    subtotal: 95,
    tax: 11.88,
    total: 106.88,
    createdAt: new Date("2024-11-22T11:00:00"),
    updatedAt: new Date("2024-11-22T11:20:00"),
  },
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  preparing: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  served: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const paymentStatusColors = {
  pending: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  refunded: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    
    const matchesDate = !selectedDate || 
      new Date(order.createdAt).toDateString() === new Date(selectedDate).toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus, updatedAt: new Date() }
        : order
    ));
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const getTimeAgo = (date: Date) => {
    const diff = new Date().getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Orders</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and track all restaurant orders</p>
              </div>
              <button
                onClick={() => setOrders([...orders])} // Refresh orders
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                      {orders.filter(o => o.status === "pending").length}
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Preparing</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {orders.filter(o => o.status === "preparing").length}
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Ready</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {orders.filter(o => o.status === "ready").length}
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by order number, customer, or table..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="served">Served</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            {order.tableNumber && (
                              <div className="text-xs text-gray-500">
                                Table {order.tableNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customerName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.items.slice(0, 2).map(item => item.name).join(", ")}
                            {order.items.length > 2 && ` +${order.items.length - 2} more`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ₵{order.total.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentStatusColors[order.paymentStatus]}`}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getTimeAgo(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewOrderDetails(order)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {order.status === "pending" && (
                              <button
                                onClick={() => updateOrderStatus(order.id, "preparing")}
                                className="text-yellow-600 hover:text-yellow-700"
                                title="Start preparing"
                              >
                                <ChefHat className="h-4 w-4" />
                              </button>
                            )}
                            
                            {order.status === "preparing" && (
                              <button
                                onClick={() => updateOrderStatus(order.id, "ready")}
                                className="text-green-600 hover:text-green-700"
                                title="Mark as ready"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            
                            {order.status === "ready" && (
                              <button
                                onClick={() => updateOrderStatus(order.id, "served")}
                                className="text-blue-600 hover:text-blue-700"
                                title="Mark as served"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            
                            <button
                              className="text-gray-600 hover:text-gray-700"
                              title="Print order"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Order Details - {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                {selectedOrder.tableNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Table</p>
                    <p className="font-medium">{selectedOrder.tableNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Order Time</p>
                  <p className="font-medium">
                    {selectedOrder.createdAt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <div>
                        <span className="text-sm">{item.quantity}x {item.name}</span>
                        {item.notes && (
                          <p className="text-xs text-gray-500">{item.notes}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        ₵{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₵{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (12.5%)</span>
                  <span>₵{selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">₵{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Payment Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentStatusColors[selectedOrder.paymentStatus]}`}>
                    {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                  </span>
                  {selectedOrder.paymentMethod && (
                    <span className="text-sm text-gray-600">
                      via {selectedOrder.paymentMethod}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
