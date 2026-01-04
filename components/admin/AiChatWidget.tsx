"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Sparkles, Send, X, Bot, User, ChevronDown, Loader2,
    Calendar, DollarSign, Users, Home, Search, BarChart3,
    Clock, CheckCircle2, AlertCircle, TrendingUp, Zap,
    CreditCard, UserCheck, Receipt, Crown,
    AlertTriangle
} from "lucide-react";

// Types for structured streaming events
type StreamEvent =
    | { type: "thinking"; content: string }
    | { type: "tool_start"; tool: string; args: Record<string, any> }
    | { type: "tool_result"; tool: string; data: any; success: boolean }
    | { type: "text"; content: string }
    | { type: "error"; message: string };

interface ToolCall {
    tool: string;
    args: Record<string, any>;
    status: "running" | "success" | "error";
    data?: any;
}

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
    thinking?: string;
    toolCalls?: ToolCall[];
}

// Tool display configuration with blue theme
const TOOL_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    getBookingStats: { icon: BarChart3, label: "Booking Statistics", color: "blue" },
    getExpiringBookings: { icon: Clock, label: "Expiring Bookings", color: "amber" },
    searchBookings: { icon: Search, label: "Searching Bookings", color: "blue" },
    getRevenueReport: { icon: DollarSign, label: "Revenue Report", color: "emerald" },
    getRoomTypePerformance: { icon: Home, label: "Room Performance", color: "blue" },
    getTodaySnapshot: { icon: Calendar, label: "Today's Snapshot", color: "sky" },
    getPaymentSummary: { icon: CreditCard, label: "Payment Summary", color: "emerald" },
    getPendingPayments: { icon: AlertCircle, label: "Pending Payments", color: "amber" },
    getGuestProfile: { icon: UserCheck, label: "Guest Profile", color: "blue" },
    getBookingDetails: { icon: Receipt, label: "Booking Details", color: "blue" },
    getTopGuests: { icon: Crown, label: "Top Guests", color: "amber" },
    getOccupancyTrends: { icon: BarChart3, label: "Occupancy Trends", color: "sky" },
    requestRevenueReport: { icon: Zap, label: "Generating PDF Report", color: "emerald" },
    updateBookingStatus: { icon: CheckCircle2, label: "Updating Booking", color: "blue" },
    updatePaymentStatus: { icon: CreditCard, label: "Updating Payment", color: "emerald" },
    updateStayStatus: { icon: Home, label: "Updating Stay", color: "purple" },
    getRevenueForecast: { icon: TrendingUp, label: "Revenue Forecast", color: "amber" },
    getOccupancyWarnings: { icon: AlertTriangle, label: "Occupancy Warning", color: "rose" },
};

// Suggested prompts for quick actions
const SUGGESTED_PROMPTS = [
    { text: "How's today looking?", icon: Calendar },
    { text: "Show this week's revenue", icon: DollarSign },
    { text: "Generate 2025 revenue report", icon: Zap },
    { text: "Who's checking out today?", icon: Users },
];

// Tool Call Card Component
function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
    const config = TOOL_CONFIG[toolCall.tool] || {
        icon: Zap,
        label: toolCall.tool,
        color: "blue"
    };
    const Icon = config.icon;

    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 border-blue-200 text-blue-700",
        amber: "bg-amber-50 border-amber-200 text-amber-700",
        emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
        sky: "bg-sky-50 border-sky-200 text-sky-700",
    };

    const iconColorClasses: Record<string, string> = {
        blue: "text-blue-500 bg-blue-100",
        amber: "text-amber-500 bg-amber-100",
        emerald: "text-emerald-500 bg-emerald-100",
        sky: "text-sky-500 bg-sky-100",
    };

    return (
        <div className={`rounded-lg border p-2.5 mb-2 ${colorClasses[config.color]} transition-all duration-300`}>
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${iconColorClasses[config.color]}`}>
                    <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium text-xs flex-1 truncate">{config.label}</span>
                {toolCall.status === "running" && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
                )}
                {toolCall.status === "success" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                )}
                {toolCall.status === "error" && (
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                )}
            </div>

            {/* Show result data for successful calls with useful metrics */}
            {toolCall.status === "success" && toolCall.data && (
                <DataPreview data={toolCall.data} tool={toolCall.tool} />
            )}
        </div>
    );
}

// Data Preview Component for tool results
function DataPreview({ data, tool }: { data: any; tool: string }) {
    const formatCurrency = (n: number) => `₵${n.toLocaleString()}`;

    if (tool === "getTodaySnapshot" || tool === "getBookingStats") {
        const stats = [
            data.arrivals !== undefined && { label: "Arrivals", value: data.arrivals },
            data.departures !== undefined && { label: "Departures", value: data.departures },
            data.currentlyCheckedIn !== undefined && { label: "In-house", value: data.currentlyCheckedIn },
            data.todayRevenue !== undefined && { label: "Revenue", value: formatCurrency(data.todayRevenue) },
            data.totalRevenue !== undefined && { label: "Revenue", value: formatCurrency(data.totalRevenue) },
        ].filter(Boolean);

        if (stats.length === 0) return null;

        return (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
                {stats.slice(0, 4).map((stat: any, i) => (
                    <div key={i} className="bg-white/60 rounded px-2 py-1">
                        <div className="text-[9px] uppercase opacity-60">{stat.label}</div>
                        <div className="font-semibold text-xs">{stat.value}</div>
                    </div>
                ))}
            </div>
        );
    }

    if (tool === "getPaymentSummary") {
        return (
            <div className="mt-2 bg-white/60 rounded px-2 py-1.5 space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="opacity-70">Collected</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(data.totalCollected || 0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="opacity-70">Outstanding</span>
                    <span className="font-semibold text-amber-600">{formatCurrency(data.totalOutstanding || 0)}</span>
                </div>
            </div>
        );
    }

    if (tool === "getRevenueReport") {
        return (
            <div className="mt-2 bg-white/60 rounded px-2 py-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs opacity-70">Total</span>
                    <span className="font-bold text-emerald-700 text-sm">
                        {formatCurrency(data.totalRevenue ?? 0)}
                    </span>
                </div>
            </div>
        );
    }

    if (tool === "searchBookings" && data.count !== undefined) {
        return (
            <div className="mt-1.5 text-xs opacity-80">
                Found <span className="font-bold">{data.count}</span> booking(s)
            </div>
        );
    }

    if (tool === "getExpiringBookings" && data.count !== undefined) {
        return (
            <div className="mt-1.5 text-xs opacity-80">
                <span className="font-bold">{data.count}</span> guest(s) checking out
            </div>
        );
    }

    if (tool === "getPendingPayments") {
        return (
            <div className="mt-1.5 text-xs opacity-80">
                <span className="font-bold">{data.count}</span> pending ({formatCurrency(data.totalOutstanding || 0)})
            </div>
        );
    }

    if (tool === "getGuestProfile" && data.guest) {
        return (
            <div className="mt-1.5 text-xs opacity-80">
                {data.guest.name} - {data.stats?.totalBookings || 0} stays
            </div>
        );
    }

    if (tool === "getTopGuests" && data.guests) {
        return (
            <div className="mt-1.5 text-xs opacity-80">
                Top {data.guests.length} guests by {data.sortedBy}
            </div>
        );
    }

    if (tool === "getOccupancyTrends") {
        return (
            <div className="mt-2 bg-white/60 rounded px-2 py-1.5 space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="opacity-70">Total Arrivals</span>
                    <span className="font-semibold text-blue-600">{data.totalCheckIns || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="opacity-70">Total Departures</span>
                    <span className="font-semibold text-amber-600">{data.totalCheckOuts || 0}</span>
                </div>
            </div>
        );
    }

    if (tool === "requestRevenueReport" && data.success) {
        return (
            <div className="mt-1.5 text-xs opacity-80 flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Report scheduled for delivery!
            </div>
        );
    }

    if ((tool === "updateBookingStatus" || tool === "updatePaymentStatus" || tool === "updateStayStatus") && data.success) {
        return (
            <div className="mt-1.5 text-xs opacity-80 flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                {data.message}
            </div>
        );
    }

    if (tool === "getRevenueForecast") {
        return (
            <div className="mt-1.5 text-xs space-y-1">
                <div className="flex justify-between font-medium">
                    <span>Forecast:</span>
                    <span className="text-amber-600">GHS {data.forecastedRevenue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between opacity-60">
                    <span>Current OTB:</span>
                    <span>GHS {data.currentOnTheBooks?.toLocaleString()}</span>
                </div>
            </div>
        );
    }

    if (tool === "getOccupancyWarnings" && data.warningsFound > 0) {
        return (
            <div className="mt-1.5 space-y-1.5">
                {data.warnings.map((w: any, i: number) => (
                    <div key={i} className={`p-1.5 rounded border text-[10px] ${w.severity === 'high' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'
                        }`}>
                        <div className="font-bold uppercase tracking-wider">Week {w.weekStarting}</div>
                        <div className="opacity-80">Only {w.currentBookings} bookings so far.</div>
                        <div className="mt-1 italic text-blue-600">💡 {w.recommendation}</div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

// Thinking Indicator Component
function ThinkingIndicator({ content }: { content: string }) {
    return (
        <div className="flex items-center gap-2 text-gray-500 text-xs py-2 animate-pulse">
            <div className="relative">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span className="absolute -inset-1 rounded-full bg-blue-400/20 animate-ping" />
            </div>
            <span className="italic">{content}</span>
        </div>
    );
}

export function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "ai",
            content: "Hello! 👋 I'm your hotel analytics assistant. Ask me about bookings, revenue, guests, payments, or anything else!",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentThinking, setCurrentThinking] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentThinking]);

    const handleSuggestedPrompt = (text: string) => {
        setInput(text);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        const aiMessageId = (Date.now() + 1).toString();

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setCurrentThinking(null);

        setMessages((prev) => [...prev, {
            id: aiMessageId,
            role: "ai",
            content: "",
            timestamp: new Date(),
            isStreaming: true,
            toolCalls: [],
        }]);

        try {
            abortControllerRef.current = new AbortController();

            const apiMessages = messages
                .filter(m => m.id !== "welcome")
                .concat(userMessage)
                .map(m => ({
                    role: m.role === "ai" ? "assistant" : "user",
                    content: m.content
                }));

            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ messages: apiMessages }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let buffer = "";
                let accumulatedText = "";
                let currentToolCalls: ToolCall[] = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });

                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const event: StreamEvent = JSON.parse(line.slice(6));

                                switch (event.type) {
                                    case "thinking":
                                        setCurrentThinking(event.content);
                                        break;

                                    case "tool_start":
                                        setCurrentThinking(null);
                                        currentToolCalls = [
                                            ...currentToolCalls,
                                            {
                                                tool: event.tool,
                                                args: event.args,
                                                status: "running",
                                            },
                                        ];
                                        setMessages((prev) =>
                                            prev.map((msg) =>
                                                msg.id === aiMessageId
                                                    ? { ...msg, toolCalls: [...currentToolCalls] }
                                                    : msg
                                            )
                                        );
                                        break;

                                    case "tool_result":
                                        currentToolCalls = currentToolCalls.map((tc) =>
                                            tc.tool === event.tool && tc.status === "running"
                                                ? {
                                                    ...tc,
                                                    status: event.success ? "success" : "error",
                                                    data: event.data,
                                                }
                                                : tc
                                        );
                                        setMessages((prev) =>
                                            prev.map((msg) =>
                                                msg.id === aiMessageId
                                                    ? { ...msg, toolCalls: [...currentToolCalls] }
                                                    : msg
                                            )
                                        );
                                        break;

                                    case "text":
                                        setCurrentThinking(null);
                                        accumulatedText += event.content;
                                        setMessages((prev) =>
                                            prev.map((msg) =>
                                                msg.id === aiMessageId
                                                    ? { ...msg, content: accumulatedText }
                                                    : msg
                                            )
                                        );
                                        break;

                                    case "error":
                                        setCurrentThinking(null);
                                        setMessages((prev) =>
                                            prev.map((msg) =>
                                                msg.id === aiMessageId
                                                    ? {
                                                        ...msg,
                                                        content: `❌ Error: ${event.message}`,
                                                        isStreaming: false,
                                                    }
                                                    : msg
                                            )
                                        );
                                        break;
                                }
                            } catch {
                                // Skip invalid JSON
                            }
                        }
                    }
                }

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === aiMessageId
                            ? { ...msg, isStreaming: false }
                            : msg
                    )
                );
            }
        } catch (error: any) {
            if (error.name !== "AbortError") {
                console.error("Chat error:", error);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === aiMessageId
                            ? {
                                ...msg,
                                content: "Sorry, I encountered an error. Please try again.",
                                isStreaming: false
                            }
                            : msg
                    )
                );
            }
        } finally {
            setIsLoading(false);
            setCurrentThinking(null);
        }
    };

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
            setCurrentThinking(null);
        }
    };

    // Enhanced markdown formatting with full support
    const formatMessage = (text: string) => {
        let formatted = text;

        // Handle tables - convert markdown tables to HTML
        const tableRegex = /\|(.+)\|[\r\n]+\|[-:| ]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
        formatted = formatted.replace(tableRegex, (match, header, body) => {
            const headers = header.split("|").filter((h: string) => h.trim());
            const rows = body.trim().split("\n").map((row: string) =>
                row.split("|").filter((c: string) => c.trim())
            );

            return `<div class="my-2 text-xs overflow-hidden rounded border border-gray-200"><table class="w-full">
                <thead><tr class="bg-gray-50">${headers.map((h: string) => `<th class="px-2 py-1.5 text-left font-medium text-gray-700 border-b">${h.trim()}</th>`).join("")}</tr></thead>
                <tbody>${rows.map((row: string[], idx: number) => `<tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}">${row.map((c: string) => `<td class="px-2 py-1.5 border-b border-gray-100">${c.trim()}</td>`).join("")}</tr>`).join("")}</tbody>
            </table></div>`;
        });

        // Process line by line
        return formatted
            .split("\n")
            .map((line) => {
                // Skip if already processed as table
                if (line.includes("<table") || line.includes("</table>")) return line;

                // Code blocks (inline) - process first to protect content
                line = line.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-blue-700 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>');

                // Bold - **text** (must be before italic to avoid conflicts)
                line = line.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');

                // Italic with asterisks - *text* (single asterisk, not inside bold)
                line = line.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic text-gray-600">$1</em>');

                // Italic with underscores - _text_
                line = line.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em class="italic text-gray-600">$1</em>');

                // Emoji status indicators
                line = line.replace(/✅/g, '<span class="text-emerald-500">✅</span>');
                line = line.replace(/❌/g, '<span class="text-red-500">❌</span>');
                line = line.replace(/⚠️/g, '<span class="text-amber-500">⚠️</span>');
                line = line.replace(/💡/g, '<span class="text-yellow-500">💡</span>');
                line = line.replace(/📊/g, '<span class="text-blue-500">📊</span>');
                line = line.replace(/📈/g, '<span class="text-emerald-500">📈</span>');
                line = line.replace(/💰/g, '<span class="text-amber-500">💰</span>');
                line = line.replace(/🎯/g, '<span class="text-blue-500">🎯</span>');
                line = line.replace(/⏳/g, '<span class="text-amber-500">⏳</span>');
                line = line.replace(/🏨/g, '<span class="text-blue-500">🏨</span>');

                // Headers
                if (line.startsWith("### ")) {
                    return `<h4 class="font-semibold text-xs mt-2 mb-1 text-gray-800">${line.slice(4)}</h4>`;
                }
                if (line.startsWith("## ")) {
                    return `<h3 class="font-semibold text-sm mt-2 mb-1 text-gray-900">${line.slice(3)}</h3>`;
                }
                // Lists
                if (line.startsWith("- ") || line.startsWith("* ")) {
                    return `<li class="ml-3 list-disc text-gray-700">${line.slice(2)}</li>`;
                }
                // Numbered lists
                const numberedMatch = line.match(/^(\d+)\.\s(.*)$/);
                if (numberedMatch) {
                    return `<li class="ml-3 list-decimal text-gray-700">${numberedMatch[2]}</li>`;
                }
                return line ? `<p class="text-gray-700">${line}</p>` : '';
            })
            .filter(Boolean)
            .join("");
    };

    const showSuggestions = messages.length === 1 || (!isLoading && messages[messages.length - 1]?.role === "ai" && !messages[messages.length - 1]?.isStreaming);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Custom scrollbar styles */}
            <style jsx global>{`
                .chat-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .chat-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chat-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .chat-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="mb-4 w-[380px] origin-bottom-right transform overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in zoom-in-95"
                    style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                >
                    {/* Header - Blue theme */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-white">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                                <Sparkles className="h-4.5 w-4.5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">AI Assistant</h3>
                                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                                    <span className={`h-1.5 w-1.5 rounded-full ${isLoading ? "bg-yellow-300" : "bg-green-300"} animate-pulse`} />
                                    {isLoading ? "Processing..." : "Online"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 transition-colors"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages Area - Fixed scrolling */}
                    <div className="h-[420px] overflow-y-auto overflow-x-hidden bg-gradient-to-b from-gray-50/80 to-white p-3 chat-scrollbar">
                        <div className="space-y-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`flex max-w-[95%] items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                        {/* Avatar */}
                                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-sm ${msg.role === "user"
                                            ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                            : "bg-white border border-gray-200"
                                            }`}>
                                            {msg.role === "user" ? (
                                                <User className="h-3 w-3 text-white" />
                                            ) : (
                                                <Sparkles className="h-3 w-3 text-blue-600" />
                                            )}
                                        </div>

                                        {/* Message Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Tool Calls */}
                                            {msg.toolCalls && msg.toolCalls.length > 0 && (
                                                <div className="mb-2">
                                                    {msg.toolCalls.map((tc, i) => (
                                                        <ToolCallCard key={`${tc.tool}-${i}`} toolCall={tc} />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Text Bubble */}
                                            {(msg.content || msg.isStreaming) && (
                                                <div
                                                    className={`relative rounded-2xl px-3 py-2 text-sm shadow-sm ${msg.role === "user"
                                                        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm"
                                                        : "bg-white text-gray-700 border border-gray-100 rounded-bl-sm"
                                                        }`}
                                                >
                                                    {msg.isStreaming && !msg.content && !msg.toolCalls?.length ? (
                                                        <div className="flex gap-1 py-1">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></span>
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></span>
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce"></span>
                                                        </div>
                                                    ) : msg.content ? (
                                                        <div
                                                            className="leading-relaxed text-[13px] break-words [&_table]:w-full [&_p]:mb-1 [&_p:last-child]:mb-0 [&_li]:mb-0.5 [&_h3]:text-gray-900 [&_h4]:text-gray-800"
                                                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                                        />
                                                    ) : null}

                                                    {/* Timestamp */}
                                                    {!msg.isStreaming && msg.content && (
                                                        <span className={`block mt-1 text-[9px] ${msg.role === "user" ? "text-blue-200" : "text-gray-400"
                                                            }`}>
                                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Thinking Indicator */}
                            {currentThinking && <ThinkingIndicator content={currentThinking} />}

                            {/* Suggested Prompts */}
                            {showSuggestions && !isLoading && (
                                <div className="pt-2">
                                    <p className="text-[10px] text-gray-400 mb-1.5 flex items-center gap-1">
                                        <Zap className="h-3 w-3" /> Quick actions
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SUGGESTED_PROMPTS.map((prompt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSuggestedPrompt(prompt.text)}
                                                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 text-[11px] transition-colors border border-transparent hover:border-blue-200"
                                            >
                                                <prompt.icon className="h-3 w-3" />
                                                <span className="truncate">{prompt.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-100 bg-white p-2.5">
                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                            <div className="flex-1 flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about bookings, payments..."
                                    disabled={isLoading}
                                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            {isLoading ? (
                                <button
                                    type="button"
                                    onClick={stopGeneration}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white shadow-sm transition-all hover:bg-red-600 active:scale-95"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            )}
                        </form>
                        <div className="mt-1.5 text-center text-[9px] text-gray-400">
                            Powered by Gemini ✨
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button - Blue theme */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen
                    ? "bg-gray-800 rotate-90"
                    : "bg-gradient-to-r from-blue-600 to-blue-500"
                    }`}
            >
                {!isOpen && (
                    <span className="absolute -inset-1 rounded-full bg-blue-400 opacity-30 animate-ping" />
                )}
                {isOpen ? (
                    <X className="h-6 w-6 transition-transform duration-300 -rotate-90" />
                ) : (
                    <Sparkles className="h-6 w-6" />
                )}
            </button>
        </div>
    );
}
