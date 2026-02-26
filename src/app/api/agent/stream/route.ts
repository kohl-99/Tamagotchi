import { agentBus, type AgentEvent } from "@/lib/agentBus";

/* ══════════════════════════════════════════════════════════
   GET /api/agent/stream
   Server-Sent Events stream — subscribe from the browser to
   receive real-time events pushed by OpenClaw via the webhook.

   The frontend keeps this connection open; events arrive
   instantly when the agent calls /api/agent/webhook.
   ══════════════════════════════════════════════════════════ */

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // EventEmitter isn't available in Edge

export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            /* Send initial connection confirmation */
            controller.enqueue(
                encoder.encode(
                    `data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`
                )
            );

            /* Forward agent events to this SSE client */
            const onEvent = (event: AgentEvent) => {
                try {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
                    );
                } catch {
                    /* Client already disconnected */
                }
            };

            agentBus.on("agent_event", onEvent);

            /* ── Heartbeat every 25s to prevent proxy timeouts ── */
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": ping\n\n"));
                } catch {
                    clearInterval(heartbeat);
                }
            }, 25_000);

            /* Cleanup when the browser tab closes */
            return () => {
                agentBus.off("agent_event", onEvent);
                clearInterval(heartbeat);
            };
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no", // Disable nginx buffering
        },
    });
}
