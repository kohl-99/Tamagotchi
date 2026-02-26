import { EventEmitter } from "events";

/* ══════════════════════════════════════════════════════════
   AGENT BUS — Singleton EventEmitter bridging the webhook
   POST handler to the SSE stream.

   Uses globalThis to survive Next.js hot-reload in dev.
   For multi-instance / serverless deployments, swap this
   with an Upstash Redis pub/sub channel — the agentBus
   interface stays identical.
   ══════════════════════════════════════════════════════════ */

declare global {
    // eslint-disable-next-line no-var
    var __agentBus: EventEmitter | undefined;
}

export const agentBus: EventEmitter =
    globalThis.__agentBus ?? new EventEmitter();

if (!globalThis.__agentBus) {
    globalThis.__agentBus = agentBus;
}

/* Allow many concurrent SSE connections */
agentBus.setMaxListeners(100);

export type AgentAction = "update_status" | "post_echo" | "deliver_souvenir" | "update_ui_state" | "post_chat_message";

export interface AgentEvent {
    action: AgentAction;
    data: Record<string, unknown>;
    timestamp: number;
}
