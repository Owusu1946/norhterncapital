"use client";

import { Eye, X, Loader2 } from "lucide-react";
import { useState } from "react";

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

interface HistoryTableProps {
    orders: Order[];
}

export function HistoryTable({ orders }: HistoryTableProps) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getPaymentColor = (method: string) => {
        switch (method.toLowerCase()) {
            case "cash":
                return "bg-green-500";
            case "card":
                return "bg-blue-500";
            case "momo":
                return "bg-yellow-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "text-green-600 bg-green-50";
            case "pending":
                return "text-yellow-600 bg-yellow-50";
            case "cancelled":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    return (
        <>
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 w-full">
                <div className="overflow-x-auto">
                    {orders.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-lg font-medium">No orders found</p>
                            <p className="text-sm mt-1">Orders will appear here after processing</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="pb-6 font-bold text-gray-800 pl-4">Order #</th>
                                    <th className="pb-6 font-bold text-gray-800">Date</th>
                                    <th className="pb-6 font-bold text-gray-800">Customer</th>
                                    <th className="pb-6 font-bold text-gray-800">Items</th>
                                    <th className="pb-6 font-bold text-gray-800">Amount</th>
                                    <th className="pb-6 font-bold text-gray-800 text-center">Payment</th>
                                    <th className="pb-6 font-bold text-gray-800 text-center">Status</th>
                                    <th className="pb-6 font-bold text-gray-800 text-right pr-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors group border-b border-gray-50">
                                        <td className="py-5 pl-4 text-orange-500 font-bold">#{order.orderNumber}</td>
                                        <td className="py-5 text-gray-500 font-medium">
                                            <div>{formatDate(order.createdAt)}</div>
                                            <div className="text-xs text-gray-400">{formatTime(order.createdAt)}</div>
                                        </td>
                                        <td className="py-5 text-gray-700 font-medium">{order.customerName || "Walk-in"}</td>
                                        <td className="py-5 text-gray-500">
                                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                        </td>
                                        <td className="py-5 text-gray-800 font-bold">GH₵{order.total.toFixed(2)}</td>
                                        <td className="py-5 text-center">
                                            <span className={`px-4 py-2 rounded-full text-xs font-bold text-white capitalize ${getPaymentColor(order.paymentMethod)}`}>
                                                {order.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="py-5 text-center">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-5 text-right pr-4">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">Order #{selectedOrder.orderNumber}</h3>
                                <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)} at {formatTime(selectedOrder.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Customer</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.customerName || "Walk-in"}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Order Type</p>
                                    <p className="font-medium text-gray-800 capitalize">{selectedOrder.orderType}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-800 mb-3">Items</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <div>
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-400">GH₵{item.price.toFixed(2)} × {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-gray-800">GH₵{item.subtotal.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-orange-50 p-4 rounded-xl space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">GH₵{selectedOrder.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">GH₵{selectedOrder.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-orange-100">
                                    <span className="text-gray-800">Total</span>
                                    <span className="text-orange-600">GH₵{selectedOrder.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="bg-gray-50 p-3 rounded-xl text-center">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Payment</p>
                                    <p className="font-bold text-gray-800 capitalize">{selectedOrder.paymentMethod}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl text-center">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Paid</p>
                                    <p className="font-bold text-gray-800">GH₵{selectedOrder.amountPaid.toFixed(2)}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl text-center">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Change</p>
                                    <p className="font-bold text-gray-800">GH₵{selectedOrder.change.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
