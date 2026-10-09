import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import type { Database } from "@/integrations/supabase/types";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/server/ai/run-id";

const INSTRUCTIONS = `You are the CivicFix assistant. CivicFix helps residents turn civic problems into clear complaints.
How it works: on "Report an Issue" the user (a) describes the problem, (b) optionally adds a photo, (c) enters the location, (d) picks a category, then taps Generate to get a formal complaint letter they can edit, copy or download as a PDF. Saved reports appear under "My Reports".
Categories: Road / Pothole, Streetlight, Garbage / Waste, Water / Drainage, Public Property, Other.
Help users file complaints step by step, suggest a good description and category, and answer questions about the app. Keep replies short and friendly. Use simple language.`;

const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return json(401, "Please sign in to chat.");
        const url = process.env["SUPABASE_URL"]!;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return json(500, "AI is not configured.");
        const supabase = createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${token}`, apikey: key } },
        });
        const { data: userData, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !userData.user) return json(401, "Please sign in to chat.");
        const userId = userData.user.id;

        const body = (await request.json()) as { messages?: UIMessage[] };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const last = messages[messages.length - 1];
        if (!last || last.role !== "user") return json(400, "No message to send.");

        const { error: saveErr } = await supabase.from("chat_messages").upsert(
          { user_id: userId, message_id: last.id, role: "user", message: last as never },
          { onConflict: "user_id,message_id" },
        );
        if (saveErr) console.error("Failed to save user message", saveErr);

        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          instructions: INSTRUCTIONS,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          onFinish: async ({ responseMessage }) => {
            if (!responseMessage || responseMessage.role !== "assistant") return;
            const { error } = await supabase.from("chat_messages").upsert(
              { user_id: userId, message_id: responseMessage.id, role: "assistant", message: responseMessage as never },
              { onConflict: "user_id,message_id" },
            );
            if (error) console.error("Failed to save assistant message", error);
          },
        });
        return withLovableAiGatewayRunIdHeader(response, runIdFetch);
      },
    },
  },
});
