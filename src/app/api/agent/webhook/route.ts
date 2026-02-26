import { NextRequest, NextResponse } from "next/server";
import { agentBus, type AgentAction, type AgentEvent } from "@/lib/agentBus";

/* ══════════════════════════════════════════════════════════
   POST /api/agent/webhook
   Secure inbound endpoint for OpenClaw (or any external agent).

   Payload:
   {
     apiKey: string,
     action: "update_status" | "post_echo" | "deliver_souvenir",
     data: { ... }
   }

   Set AGENT_API_KEY in .env.local to authenticate callers.
   ══════════════════════════════════════════════════════════ */

const VALID_ACTIONS: AgentAction[] = [
    "update_status",
    "post_echo",
    "deliver_souvenir",
    "update_ui_state",
    "post_chat_message"
];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { apiKey, action, data } = body as {
            apiKey: string;
            action: AgentAction;
            data: Record<string, unknown>;
        };

        /* ── Auth ──────────────────────────────────────────── */
        const validKey = process.env.AGENT_API_KEY;
        if (!validKey) {
            return NextResponse.json(
                { error: "Server not configured: AGENT_API_KEY env var is missing" },
                { status: 503 }
            );
        }
        if (apiKey !== validKey) {
            return NextResponse.json(
                { error: "Unauthorized — invalid AGENT_API_KEY" },
                { status: 401 }
            );
        }

        /* ── Validate action ───────────────────────────────── */
        if (!VALID_ACTIONS.includes(action)) {
            return NextResponse.json(
                { error: `Unknown action: "${action}". Valid: ${VALID_ACTIONS.join(", ")}` },
                { status: 400 }
            );
        }

        /* ── Dispatch to SSE subscribers ───────────────────── */
        const event: AgentEvent = {
            action,
            data: data ?? {},
            timestamp: Date.now(),
        };
        agentBus.emit("agent_event", event);

        return NextResponse.json({
            ok: true,
            action,
            timestamp: event.timestamp,
            subscribers: agentBus.listenerCount("agent_event"),
        });
    } catch (err) {
        console.error("[agent/webhook] error:", err);
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
}
