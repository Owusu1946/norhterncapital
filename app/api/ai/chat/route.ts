import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticateAdmin } from "@/lib/adminMiddleware";
import { getGeminiTools } from "@/lib/ai/tools";
import { executeToolCall } from "@/lib/ai/toolExecutors";
import { HOTEL_SYSTEM_PROMPT, buildContextString } from "@/lib/ai/prompts";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface ChatMessage {
    role: "user" | "model";
    parts: { text: string }[];
}

// Structured event types for beautiful UI rendering
type StreamEvent =
    | { type: "thinking"; content: string }
    | { type: "tool_start"; tool: string; args: Record<string, any> }
    | { type: "tool_result"; tool: string; data: any; success: boolean }
    | { type: "text"; content: string }
    | { type: "error"; message: string };

function encodeEvent(event: StreamEvent): string {
    return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * POST /api/ai/chat
 * Main chat endpoint with structured streaming and tool calling
 */
export async function POST(request: NextRequest) {
    try {
        // Authenticate admin
        const { error } = await authenticateAdmin(request);
        if (error) return error;

        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "Messages array required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: HOTEL_SYSTEM_PROMPT,
        });

        // Get quick context for RAG
        const context = await getQuickContext();
        const contextString = buildContextString(context);

        // Convert messages to Gemini format
        const chatHistory: ChatMessage[] = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        }));

        // Get last user message
        const lastMessage = messages[messages.length - 1];
        const userPrompt = `${contextString}\n\nUser Question: ${lastMessage.content}`;

        // Start chat with tools
        const chat = model.startChat({
            history: chatHistory,
            tools: [getGeminiTools()],
        });

        // Create streaming response with Server-Sent Events
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Send initial thinking indicator
                    controller.enqueue(encoder.encode(encodeEvent({
                        type: "thinking",
                        content: "Analyzing your question..."
                    })));

                    let response = await chat.sendMessage(userPrompt);
                    let result = response.response;

                    // Handle tool calls in a loop
                    let functionCalls = result.functionCalls?.();
                    let toolCallCount = 0;

                    while (functionCalls && functionCalls.length > 0) {
                        const toolResults = [];

                        for (const call of functionCalls) {
                            toolCallCount++;

                            // Send tool start event with beautiful formatting
                            controller.enqueue(encoder.encode(encodeEvent({
                                type: "tool_start",
                                tool: call.name,
                                args: call.args as Record<string, any>
                            })));

                            try {
                                // Execute the tool
                                const toolResult = await executeToolCall(call.name, call.args as Record<string, any>);

                                // Send tool result event
                                controller.enqueue(encoder.encode(encodeEvent({
                                    type: "tool_result",
                                    tool: call.name,
                                    data: toolResult,
                                    success: true
                                })));

                                toolResults.push({
                                    name: call.name,
                                    response: { output: JSON.stringify(toolResult) }
                                });
                            } catch (toolError: any) {
                                // Send error event for this tool
                                controller.enqueue(encoder.encode(encodeEvent({
                                    type: "tool_result",
                                    tool: call.name,
                                    data: { error: toolError.message },
                                    success: false
                                })));

                                toolResults.push({
                                    name: call.name,
                                    response: { output: JSON.stringify({ error: toolError.message }) }
                                });
                            }
                        }

                        // Send thinking indicator before next model response
                        if (toolCallCount > 0) {
                            controller.enqueue(encoder.encode(encodeEvent({
                                type: "thinking",
                                content: "Processing results..."
                            })));
                        }

                        // Send tool results back to model
                        response = await chat.sendMessage(toolResults.map(tr => ({
                            functionResponse: tr
                        })));
                        result = response.response;
                        functionCalls = result.functionCalls?.();
                    }

                    // Stream the final text response word by word
                    const text = result.text();
                    if (text) {
                        const words = text.split(" ");
                        let buffer = "";

                        for (let i = 0; i < words.length; i++) {
                            buffer += words[i] + " ";

                            // Send in small chunks for smooth streaming
                            if (buffer.length > 20 || i === words.length - 1) {
                                controller.enqueue(encoder.encode(encodeEvent({
                                    type: "text",
                                    content: buffer
                                })));
                                buffer = "";
                                // Small delay for streaming effect
                                await new Promise(resolve => setTimeout(resolve, 30));
                            }
                        }
                    }

                    controller.close();
                } catch (error: any) {
                    console.error("Streaming error:", error);
                    controller.enqueue(encoder.encode(encodeEvent({
                        type: "error",
                        message: error.message || "Something went wrong"
                    })));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });

    } catch (error: any) {
        console.error("Chat API error:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

/**
 * Get quick context for RAG injection
 */
async function getQuickContext() {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [arrivals, departures, checkedIn, pending, weeklyStats] = await Promise.all([
        Booking.countDocuments({
            checkIn: { $gte: today, $lt: tomorrow },
            bookingStatus: { $in: ["confirmed", "checked_in"] }
        }),
        Booking.countDocuments({
            checkOut: { $gte: today, $lt: tomorrow },
            bookingStatus: { $in: ["confirmed", "checked_in"] }
        }),
        Booking.countDocuments({ bookingStatus: "checked_in" }),
        Booking.countDocuments({ bookingStatus: "pending" }),
        Booking.aggregate([
            { $match: { createdAt: { $gte: weekAgo }, paymentStatus: "paid" } },
            { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } }
        ])
    ]);

    const weekly = weeklyStats[0] || { count: 0, revenue: 0 };

    return {
        date: today.toISOString().split("T")[0],
        arrivals,
        departures,
        checkedIn,
        pending,
        weeklyBookings: weekly.count,
        weeklyRevenue: weekly.revenue
    };
}
