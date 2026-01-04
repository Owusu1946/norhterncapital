import { FunctionDeclaration, SchemaType, Tool } from "@google/generative-ai";

/**
 * Tool definitions for Gemini function calling
 * These allow the AI to query the database dynamically
 */
export const hotelTools: FunctionDeclaration[] = [
    {
        name: "getBookingStats",
        description: "Get booking statistics for the hotel including counts and revenue",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                period: {
                    type: SchemaType.STRING,
                    description: "Time period for statistics: today, week, month, or year",
                }
            },
            required: ["period"]
        }
    },
    {
        name: "getExpiringBookings",
        description: "Get list of bookings checking out today (expiring soon)",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                limit: {
                    type: SchemaType.NUMBER,
                    description: "Maximum number of bookings to return"
                }
            }
        }
    },
    {
        name: "searchBookings",
        description: "Search for bookings by guest name, email, phone, or booking reference",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                query: {
                    type: SchemaType.STRING,
                    description: "Search term (name, email, phone, or reference)"
                },
                status: {
                    type: SchemaType.STRING,
                    description: "Filter by booking status: all, confirmed, pending, cancelled, checked_in, or checked_out"
                }
            },
            required: ["query"]
        }
    },
    {
        name: "getRevenueReport",
        description: "Get revenue breakdown for a specific date range",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                startDate: {
                    type: SchemaType.STRING,
                    description: "Start date in ISO format (YYYY-MM-DD)"
                },
                endDate: {
                    type: SchemaType.STRING,
                    description: "End date in ISO format (YYYY-MM-DD)"
                }
            },
            required: ["startDate", "endDate"]
        }
    },
    {
        name: "getRoomTypePerformance",
        description: "Get performance metrics for room types (bookings, revenue, popularity)",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                period: {
                    type: SchemaType.STRING,
                    description: "Time period for analysis: week, month, or year"
                }
            },
            required: ["period"]
        }
    },
    {
        name: "getTodaySnapshot",
        description: "Get a complete snapshot of today's hotel operations: arrivals, departures, occupancy",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {}
        }
    },
    {
        name: "getPaymentSummary",
        description: "Get payment status summary including pending payments, total collected, refunds, and outstanding amounts",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                period: {
                    type: SchemaType.STRING,
                    description: "Time period for payment summary: today, week, month, or year"
                }
            },
            required: ["period"]
        }
    },
    {
        name: "getPendingPayments",
        description: "Get list of bookings with pending or failed payments that need attention",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                limit: {
                    type: SchemaType.NUMBER,
                    description: "Maximum number of bookings to return"
                }
            }
        }
    },
    {
        name: "getGuestProfile",
        description: "Get detailed profile of a guest including their booking history, total spent, and preferences",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                email: {
                    type: SchemaType.STRING,
                    description: "Guest email address to look up"
                }
            },
            required: ["email"]
        }
    },
    {
        name: "getBookingDetails",
        description: "Get complete details of a specific booking including payment info, room details, and special requests",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                bookingId: {
                    type: SchemaType.STRING,
                    description: "The booking ID or reference to look up"
                }
            },
            required: ["bookingId"]
        }
    },
    {
        name: "getTopGuests",
        description: "Get list of top guests by number of bookings or total spent",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                sortBy: {
                    type: SchemaType.STRING,
                    description: "Sort by: bookings (number of stays) or revenue (total spent)"
                },
                limit: {
                    type: SchemaType.NUMBER,
                    description: "Maximum number of guests to return"
                }
            }
        }
    },
    {
        name: "getOccupancyTrends",
        description: "Get check-in and check-out trends for a period (useful for occupancy patterns and arrival analysis)",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                startDate: {
                    type: SchemaType.STRING,
                    description: "Start date in ISO format (YYYY-MM-DD)"
                },
                endDate: {
                    type: SchemaType.STRING,
                    description: "End date in ISO format (YYYY-MM-DD)"
                },
                email: {
                    type: SchemaType.STRING,
                    description: "Recipient email address for the report"
                }
            },
            required: ["startDate", "endDate", "email"]
        }
    },
    {
        name: "requestRevenueReport",
        description: "Trigger a background job to generate a professional PDF revenue report and email it to a recipient",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                startDate: {
                    type: SchemaType.STRING,
                    description: "Start date for the report (YYYY-MM-DD)"
                },
                endDate: {
                    type: SchemaType.STRING,
                    description: "End date for the report (YYYY-MM-DD)"
                },
                email: {
                    type: SchemaType.STRING,
                    description: "Email address to send the PDF report to"
                },
                reportType: {
                    type: SchemaType.STRING,
                    description: "Type of report: revenue, occupancy, or comprehensive"
                }
            },
            required: ["startDate", "endDate", "email"]
        }
    },
    {
        name: "updateBookingStatus",
        description: "Confirm or cancel a booking by ID",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                bookingId: {
                    type: SchemaType.STRING,
                    description: "The ID of the booking to update"
                },
                status: {
                    type: SchemaType.STRING,
                    description: "New status: confirmed, cancelled, or pending"
                },
                note: {
                    type: SchemaType.STRING,
                    description: "Reason or note for the status change"
                }
            },
            required: ["bookingId", "status"]
        }
    },
    {
        name: "updatePaymentStatus",
        description: "Mark a booking as paid or failed",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                bookingId: {
                    type: SchemaType.STRING,
                    description: "The ID of the booking"
                },
                status: {
                    type: SchemaType.STRING,
                    description: "New payment status: paid, failed, or pending"
                },
                amountPaid: {
                    type: SchemaType.NUMBER,
                    description: "Optional amount paid if marking as partial or full"
                }
            },
            required: ["bookingId", "status"]
        }
    },
    {
        name: "updateStayStatus",
        description: "Check a guest in or out of their room",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                bookingId: {
                    type: SchemaType.STRING,
                    description: "The ID of the booking"
                },
                status: {
                    type: SchemaType.STRING,
                    description: "New stay status: checked-in, checked-out, or not-checked-in"
                }
            },
            required: ["bookingId", "status"]
        }
    },
    {
        name: "getRevenueForecast",
        description: "Predict future revenue based on historical trends and current bookings",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                targetMonth: {
                    type: SchemaType.STRING,
                    description: "The month to forecast (e.g., 'January 2026')"
                }
            },
            required: ["targetMonth"]
        }
    },
    {
        name: "getOccupancyWarnings",
        description: "Identify upcoming weeks with low occupancy to suggest promotions",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                weeksAhead: {
                    type: SchemaType.NUMBER,
                    description: "Number of weeks to look ahead (default: 4)"
                }
            }
        }
    },
    {
        name: "saveInsight",
        description: "Save a new piece of knowledge, user preference, or report summary to the long-term memory",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                category: {
                    type: SchemaType.STRING,
                    description: "Category: hotel_data, user_preference, report_summary, or operational_strategy"
                },
                content: {
                    type: SchemaType.STRING,
                    description: "The actual knowledge or preference to remember"
                },
                tags: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: "Keywords for retrieval (e.g., 'revenue', 'Kenneth', 'formatting')"
                },
                importance: {
                    type: SchemaType.NUMBER,
                    description: "Relevance score from 1 to 10"
                }
            },
            required: ["category", "content", "tags"]
        }
    },
    {
        name: "searchKnowledgeBase",
        description: "Search the long-term memory for past insights, summaries, or user preferences",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                query: {
                    type: SchemaType.STRING,
                    description: "Search term or keyword"
                },
                category: {
                    type: SchemaType.STRING,
                    description: "Optional category to filter by"
                }
            },
            required: ["query"]
        }
    }
];

/**
 * Convert our tool definitions to Gemini's expected format
 */
export function getGeminiTools(): Tool {
    return {
        functionDeclarations: hotelTools
    };
}
