import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest/functions";

/**
 * Inngest API route handler
 * This endpoint handles all Inngest webhook events
 */
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions,
});
