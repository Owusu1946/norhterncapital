"use client";

import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface AlertItem {
    id: string;
    image?: string;
    name: string;
    note?: string;
    price: number;
    quantity: number;
}

interface AlertCardProps {
    id: string;
    orderId: string;
    status: "success" | "canceled";
    message: string;
    time: string;
    amount?: number;
    paymentMethod?: string;
    items?: AlertItem[];
}

export function AlertCard({ id, orderId, status, message, time, amount, paymentMethod, items }: AlertCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getPaymentBadgeClass = (method: string) => {
        switch (method?.toLowerCase()) {
            case "cash":
                return "bg-green-100 text-green-600";
            case "card":
                return "bg-blue-100 text-blue-600";
            case "momo":
                return "bg-yellow-100 text-yellow-600";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 mb-4 transition-all hover:shadow-md">
            {/* Header / Summary */}
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {status === 'success' ? <Check className="text-white" /> : <X className="text-white" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">Order #{orderId}</h3>
                            <p className="text-gray-400 text-sm mt-1">{message}</p>

                            {items && items.length > 0 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="flex items-center gap-1 text-sm font-bold text-gray-700 mt-2 hover:text-orange-500 transition-colors"
                                >
                                    {items.length} item{items.length !== 1 ? "s" : ""} • See Detail
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            )}
                        </div>

                        {/* Right Side: Meta */}
                        <div className="text-right">
                            <span className="text-xs text-gray-400 font-medium block mb-2">{time}</span>
                            {amount !== undefined && (
                                <div className="flex items-center justify-end gap-3">
                                    <span className="font-bold text-gray-800 text-lg">GH₵{amount.toFixed(2)}</span>
                                    {paymentMethod && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getPaymentBadgeClass(paymentMethod)}`}>
                                            {paymentMethod}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && items && (
                <div className="mt-6 pt-6 border-t border-dashed border-gray-100 pl-16">
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-orange-50 flex items-center justify-center">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-orange-400 font-bold text-sm">{item.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                                    {item.note && <p className="text-gray-400 text-xs mt-0.5">Note: {item.note}</p>}
                                    <p className="text-orange-500 text-xs font-bold mt-1">GH₵{item.price.toFixed(2)} x {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-gray-800 text-sm">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
