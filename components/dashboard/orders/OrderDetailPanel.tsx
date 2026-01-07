"use client";

import { CreditCard, Wallet, Banknote } from "lucide-react";
import { useState } from "react";

// Mock types
interface OrderItem {
    id: string;
    name: string;
    note?: string;
    price: number;
    quantity: number;
    image: string;
}

interface OrderDetailPanelProps {
    orderId: string;
    table: string;
    items: OrderItem[];
}

export function OrderDetailPanel({ orderId, table, items }: OrderDetailPanelProps) {
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "debit" | "wallet">("debit");

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    return (
        <div className="bg-white h-full flex flex-col p-6 rounded-l-[2rem] shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-gray-400 text-xs mb-1">Orders ID</p>
                    <h2 className="text-2xl font-bold text-gray-800">#{orderId}</h2>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-xs mb-1">Table</p>
                    <h2 className="text-2xl font-bold text-gray-800">{table}</h2>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                            {item.note && <p className="text-gray-400 text-xs mt-0.5">Note : {item.note}</p>}
                        </div>
                        <div className="text-right">
                            <h4 className="font-bold text-gray-800 text-sm">${(item.price * item.quantity).toFixed(2)}</h4>
                            <p className="text-gray-400 text-xs mt-0.5">${item.price} x {item.quantity}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Section */}
            <div className="mt-6 pt-6 border-t border-dashed border-gray-200 space-y-4">
                {/* Totals */}
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Items({items.length})</span>
                    <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Tax(10%)</span>
                    <span className="font-bold text-gray-800">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>

                {/* Payment Methods */}
                <div className="pt-4">
                    <p className="font-bold text-gray-800 mb-3 text-sm">Payment Methods</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPaymentMethod("cash")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all
                        ${paymentMethod === "cash" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                        >
                            <Banknote size={16} />
                            Cash
                        </button>
                        <button
                            onClick={() => setPaymentMethod("debit")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all
                        ${paymentMethod === "debit" ? "bg-orange-100 text-orange-600 border-orange-200 ring-1 ring-orange-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                        >
                            <CreditCard size={16} />
                            Debit Card
                        </button>
                        <button
                            onClick={() => setPaymentMethod("wallet")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all
                        ${paymentMethod === "wallet" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                        >
                            <Wallet size={16} />
                            E-Wallet
                        </button>
                    </div>
                </div>

                <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95">
                    Pay Bills
                </button>
            </div>
        </div>
    );
}
