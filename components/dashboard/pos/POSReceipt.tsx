"use client";

import React from "react";

interface POSReceiptProps {
    orderId: string;
    date: string;
    customerName: string;
    type: "Dine In" | "Take Away";
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
    subtotal: number;
    tax: number;
    total: number;
    amountPaid: number;
    change: number;
    paymentMethod: string;
}

export const POSReceipt = React.forwardRef<HTMLDivElement, POSReceiptProps>((props, ref) => {
    return (
        <div
            ref={ref}
            className="bg-white p-2 text-black font-mono text-[12px] leading-tight print:w-full"
            style={{ width: "80mm", margin: "0 auto", fontFamily: "'Courier New', Courier, monospace" }}
        >
            {/* Logo / Header */}
            <div className="text-center mb-2 pb-2 border-b-2 border-dashed border-black">
                <div className="text-2xl font-bold uppercase tracking-widest mb-1">NCH</div>
                <h1 className="font-bold text-sm uppercase">Northern Capital Hotel</h1>
                <p className="text-[10px]">Savelugu, Northern Region</p>
                <p className="text-[10px]">Tel: +233 372 123 456</p>
            </div>

            {/* Transaction Info */}
            <div className="mb-2 pb-2 border-b-2 border-dashed border-black">
                <div className="flex justify-between">
                    <span>Date: {props.date.split(',')[0]}</span>
                    <span>Time: {props.date.split(',')[1]?.trim()}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Order #: </span>
                    <span className="font-bold">{props.orderId}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Server: Admin</span> {/* Placeholder */}
                </div>
                <div className="mt-1">
                    Customer: <span className="font-bold">{props.customerName}</span>
                </div>
                <div className="mt-1 font-bold uppercase">
                    Type: {props.type}
                </div>
            </div>

            {/* Items Header */}
            <div className="flex font-bold mb-1 border-b border-black pb-1">
                <span className="flex-1">Item</span>
                <span className="w-6 text-center">Qty</span>
                <span className="w-16 text-right">Price</span>
            </div>

            {/* Items List */}
            <div className="border-b-2 border-dashed border-black pb-2 mb-2">
                {props.items.map((item, i) => (
                    <div key={i} className="flex mb-1 items-start">
                        <span className="flex-1 pr-1">{item.name}</span>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <span className="w-16 text-right">{item.price.toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="flex justify-between mb-1">
                <span>Subtotal:</span>
                <span>{props.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1">
                <span>Tax (10%):</span>
                <span>{props.tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2 mt-1">
                <span>TOTAL:</span>
                <span>GH₵{props.total.toFixed(2)}</span>
            </div>

            {/* Payment Details */}
            <div className="mt-2 text-xs">
                <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-bold uppercase">{props.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tendered:</span>
                    <span>GH₵{props.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Change:</span>
                    <span>GH₵{props.change.toFixed(2)}</span>
                </div>
            </div>

            {/* Footer / Barcode Mock */}
            <div className="text-center mt-6 pt-2 border-t-2 border-dashed border-black">
                <p className="text-[10px] font-bold">THANK YOU FOR YOUR VISIT!</p>
                <p className="text-[10px] mt-1">Please retain receipt for your records.</p>

                {/* CSS Barcode Mock */}
                <div className="mt-4 h-12 w-3/4 mx-auto bg-[repeating-linear-gradient(90deg,black,black_2px,white_2px,white_4px)]" />
                <p className="text-[8px] mt-1 tracking-[0.3em]">{props.orderId.replace('#', '')}</p>

                <p className="mt-2 text-[8px] text-gray-500">Powered by NCH POS</p>
            </div>
        </div>
    );
});

POSReceipt.displayName = "POSReceipt";
