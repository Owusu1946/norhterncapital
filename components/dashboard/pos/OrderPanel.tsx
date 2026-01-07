"use client";

import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { PaymentModal } from "./PaymentModal";

interface OrderItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    notes?: string;
}

export function OrderPanel({ cartItems, setCartItems }: { cartItems: OrderItem[], setCartItems: any }) {
    const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [orderNumber, setOrderNumber] = useState<number | null>(null);
    const [isLoadingOrderNumber, setIsLoadingOrderNumber] = useState(true);

    // Fetch next order number on mount
    const fetchNextOrderNumber = async () => {
        try {
            const res = await fetch("/api/pos/orders/next-number");
            if (res.ok) {
                const data = await res.json();
                setOrderNumber(data.data.orderNumber);
            }
        } catch (error) {
            console.error("Failed to fetch order number:", error);
        } finally {
            setIsLoadingOrderNumber(false);
        }
    };

    useEffect(() => {
        fetchNextOrderNumber();
    }, []);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    const updateQty = (id: string, delta: number) => {
        setCartItems((prev: OrderItem[]) => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setCartItems((prev: OrderItem[]) => prev.filter(item => item.id !== id));
    };

    const clearAll = () => {
        setCartItems([]);
    };

    const handleOrderComplete = () => {
        clearAll();
        // Fetch next order number for the next order
        fetchNextOrderNumber();
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {isLoadingOrderNumber ? (
                                <span className="flex items-center gap-2">
                                    Order <Loader2 size={16} className="animate-spin" />
                                </span>
                            ) : (
                                `Order #${orderNumber}`
                            )}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <button
                        onClick={clearAll}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Clear All"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                {/* Order Type Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                    <button
                        onClick={() => setOrderType("dine-in")}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${orderType === "dine-in" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Dine In
                    </button>
                    <button
                        onClick={() => setOrderType("takeaway")}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${orderType === "takeaway" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Take Away
                    </button>
                </div>
            </div>

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 space-y-4">
                {cartItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl">
                        <p>No items added</p>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center group">
                            {/* Image */}
                            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-orange-50 flex items-center justify-center">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-orange-300 font-bold">{item.name.charAt(0)}</span>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                                <p className="text-orange-500 font-bold text-xs mt-0.5">GH₵{item.price.toFixed(2)}</p>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                                    <button
                                        onClick={() => updateQty(item.id, -1)}
                                        className="w-6 h-6 flex items-center justify-center bg-white text-gray-600 rounded text-xs hover:bg-orange-100 hover:text-orange-600 transition-colors shadow-sm"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="font-bold text-sm min-w-[10px] text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQty(item.id, 1)}
                                        className="w-6 h-6 flex items-center justify-center bg-white text-gray-600 rounded text-xs hover:bg-orange-100 hover:text-orange-600 transition-colors shadow-sm"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer / Totals */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Items ({cartItems.reduce((a, b) => a + b.quantity, 0)})</span>
                        <span className="font-medium text-gray-800">GH₵{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Tax (10%)</span>
                        <span className="font-medium text-gray-800">GH₵{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t border-gray-200">
                        <span>Total</span>
                        <span>GH₵{total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={cartItems.length === 0}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    Place Order
                </button>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                orderNumber={orderNumber || 0}
                totalAmount={total}
                subtotal={subtotal}
                tax={tax}
                items={cartItems}
                orderType={orderType}
                onCompleteOrder={handleOrderComplete}
            />
        </div>
    );
}
