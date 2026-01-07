"use client";

import { X, Printer, Download, RefreshCcw, CreditCard, Banknote, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { POSReceipt } from "./POSReceipt";

interface OrderItem {
    id: string;
    productId?: string;
    name: string;
    price: number;
    quantity: number;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderNumber: number;
    totalAmount: number;
    subtotal: number;
    tax: number;
    items: OrderItem[];
    orderType: "dine-in" | "takeaway";
    onCompleteOrder: () => void;
}

export function PaymentModal({ isOpen, onClose, orderNumber, totalAmount, subtotal, tax, items, orderType, onCompleteOrder }: PaymentModalProps) {
    const [step, setStep] = useState<"payment" | "processing" | "complete" | "receipt">("payment");
    const [amountPaid, setAmountPaid] = useState("");
    const [customerName, setCustomerName] = useState("Walk-in Customer");
    const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "Momo">("Cash");
    const [isSaving, setIsSaving] = useState(false);
    const [savedOrderNumber, setSavedOrderNumber] = useState<number | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Auto-fill amount for non-cash methods
    useEffect(() => {
        if (paymentMethod !== "Cash") {
            setAmountPaid(totalAmount.toFixed(2));
        } else {
            setAmountPaid("");
        }
    }, [paymentMethod, totalAmount]);

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Receipt_${savedOrderNumber || orderNumber}`,
    });

    const handleSave = async () => {
        if (!receiptRef.current) return;
        setIsSaving(true);
        try {
            const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: "#ffffff" });
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [80, 200]
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Receipt_${savedOrderNumber || orderNumber}.pdf`);
        } catch (err) {
            console.error("Failed to save receipt", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const paidValue = parseFloat(amountPaid) || 0;
    const change = paidValue - totalAmount;
    const isSufficient = Math.round(paidValue * 100) >= Math.round(totalAmount * 100);

    const handleConfirmPayment = async () => {
        if (!isSufficient) return;

        setStep("processing");

        try {
            // Save order to database
            const res = await fetch("/api/pos/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map(item => ({
                        productId: item.productId || item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                    subtotal,
                    tax,
                    total: totalAmount,
                    paymentMethod,
                    amountPaid: paidValue,
                    change: Math.max(0, change),
                    customerName,
                    orderType,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setSavedOrderNumber(data.data.orderNumber);

                // Show success state
                setStep("complete");

                // After 1.5 seconds, show receipt
                setTimeout(() => {
                    setStep("receipt");
                }, 1500);
            } else {
                // Handle error - go back to payment
                setStep("payment");
                alert("Failed to process order. Please try again.");
            }
        } catch (error) {
            console.error("Failed to create order:", error);
            setStep("payment");
            alert("Failed to process order. Please try again.");
        }
    };

    const handleClose = () => {
        setStep("payment");
        setAmountPaid("");
        setCustomerName("Walk-in Customer");
        setPaymentMethod("Cash");
        setSavedOrderNumber(null);
        onClose();
    };

    const handleNewOrder = () => {
        onCompleteOrder();
        handleClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-xl text-gray-800">
                        {step === "payment" && "Complete Payment"}
                        {step === "processing" && "Processing..."}
                        {step === "complete" && "Order Complete!"}
                        {step === "receipt" && "Receipt"}
                    </h3>
                    {step !== "processing" && step !== "complete" && (
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Payment Step */}
                    {step === "payment" && (
                        <div className="space-y-6">
                            {/* Total Display */}
                            <div className="text-center py-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <p className="text-sm text-orange-600 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                                <p className="text-4xl font-extrabold text-orange-600">GH₵{totalAmount.toFixed(2)}</p>
                            </div>

                            {/* Payment Method Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: "Cash", icon: Banknote, label: "Cash" },
                                        { id: "Card", icon: CreditCard, label: "Card" },
                                        { id: "Momo", icon: Smartphone, label: "Momo" },
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id as any)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === method.id
                                                ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm"
                                                : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                                                }`}
                                        >
                                            <method.icon size={24} className="mb-1" />
                                            <span className="text-xs font-bold">{method.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Customer Details</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter Customer Name"
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-gray-800"
                                />
                                <div className="mt-2 text-xs text-gray-400 flex justify-end">
                                    <button
                                        onClick={() => setCustomerName("Walk-in Customer")}
                                        className="hover:text-orange-500 underline"
                                    >
                                        Set to Walk-in
                                    </button>
                                </div>
                            </div>

                            {/* Payment Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Amount Tendered (GH₵)</label>
                                <input
                                    type="number"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-green-500 focus:bg-white focus:outline-none transition-all font-bold text-xl text-gray-800"
                                    autoFocus
                                    disabled={paymentMethod !== "Cash"}
                                />
                            </div>

                            {/* Change Display (Only for Cash) */}
                            {paymentMethod === "Cash" && (
                                <div className={`flex justify-between items-center p-4 rounded-xl ${isSufficient ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                    <span className="font-bold">Change Due:</span>
                                    <span className="font-bold text-xl">
                                        {isSufficient ? `GH₵${change.toFixed(2)}` : "Insufficient"}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleConfirmPayment}
                                disabled={!isSufficient}
                                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 text-lg"
                            >
                                Process Payment
                            </button>
                        </div>
                    )}

                    {/* Processing Step */}
                    {step === "processing" && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 size={64} className="animate-spin text-orange-500 mb-4" />
                            <p className="text-lg font-bold text-gray-700">Processing Order...</p>
                            <p className="text-sm text-gray-400 mt-1">Please wait</p>
                        </div>
                    )}

                    {/* Complete Step */}
                    {step === "complete" && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <CheckCircle size={48} className="text-green-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-800 mb-2">Order Complete!</p>
                            <p className="text-lg text-orange-500 font-bold">Order #{savedOrderNumber}</p>
                            <p className="text-sm text-gray-400 mt-2">Generating receipt...</p>
                        </div>
                    )}

                    {/* Receipt Step */}
                    {step === "receipt" && (
                        <div className="flex flex-col items-center">
                            {/* Receipt Preview Wrapper */}
                            <div className="bg-gray-100 p-8 rounded-xl mb-6 w-full flex justify-center shadow-inner overflow-hidden border border-gray-200">
                                <div className="origin-top scale-100">
                                    <POSReceipt
                                        ref={receiptRef}
                                        orderId={`#${savedOrderNumber || orderNumber}`}
                                        date={new Date().toLocaleString()}
                                        customerName={customerName}
                                        type={orderType === "dine-in" ? "Dine In" : "Take Away"}
                                        items={items}
                                        subtotal={subtotal}
                                        tax={tax}
                                        total={totalAmount}
                                        amountPaid={paidValue}
                                        change={change}
                                        paymentMethod={paymentMethod}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button
                                    onClick={() => handlePrint && handlePrint()}
                                    className="flex items-center justify-center gap-2 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
                                >
                                    <Printer size={18} />
                                    Print
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Download size={18} />
                                    )}
                                    Save PDF
                                </button>
                            </div>

                            <button
                                onClick={handleNewOrder}
                                className="w-full mt-4 py-3 border-2 border-orange-500 text-orange-500 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={18} />
                                New Order
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
