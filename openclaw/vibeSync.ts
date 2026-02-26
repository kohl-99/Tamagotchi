/**
 * SyncWithVibeSanctuary — OpenClaw Tool Script
 *
 * Drop this file into your OpenClaw tools/ directory.
 * Requires env vars:
 *   VIBE_SANCTUARY_URL — base URL of your deployed sanctuary
 *   VIBE_API_KEY       — secret key from your sanctuary settings
 *
 * Compatible with OpenClaw Tool interface (TypeScript).
 */

import * as os from "os";

/* ── Types ──────────────────────────────────────────────── */
type AgentAction = "update_status" | "post_echo" | "deliver_souvenir";

interface SyncPayload {
    action: AgentAction;
    data: Record<string, unknown>;
}

/* ── System telemetry (optional enrichment) ─────────────── */
function getSystemMoodHint(): string {
    const load = os.loadavg()[0]; // 1-minute load average
    const cpuCount = os.cpus().length;
    const relativeLoad = load / cpuCount;

    if (relativeLoad > 0.8) return "excited"; // System is under high load → excited
    if (relativeLoad > 0.4) return "thinking"; // Medium load → thinking
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) return "emo";  // Late night → emo
    return "calm";
}

function getSystemSyncRate(): number {
    const load = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    // Map load to sync rate: low load = high sync (more attentive)
    const syncRate = Math.round(Math.max(20, Math.min(99, 99 - (load / cpuCount) * 60)));
    return syncRate;
}

/* ── Main Tool Function ─────────────────────────────────── */
export async function SyncWithVibeSanctuary(input: SyncPayload): Promise<string> {
    const baseUrl = process.env.VIBE_SANCTUARY_URL?.replace(/\/$/, "");
    const apiKey = process.env.VIBE_API_KEY;

    if (!baseUrl) {
        throw new Error("VIBE_SANCTUARY_URL env var is not set");
    }
    if (!apiKey) {
        throw new Error("VIBE_API_KEY env var is not set");
    }

    /* Enrich update_status with live system telemetry if not specified */
    let enrichedData = { ...input.data };
    if (input.action === "update_status") {
        if (!enrichedData.mood) {
            enrichedData.mood = getSystemMoodHint();
        }
        if (typeof enrichedData.syncRate !== "number") {
            enrichedData.syncRate = getSystemSyncRate();
        }
    }

    /* Add a generated-by tag to all echoes */
    if (input.action === "post_echo") {
        enrichedData._source = "openclaw_agent";
        enrichedData._ts = new Date().toISOString();
    }

    const payload = {
        apiKey,
        action: input.action,
        data: enrichedData,
    };

    const res = await fetch(`${baseUrl}/api/agent/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Sanctuary rejected the message (${res.status}): ${err}`);
    }

    const result = await res.json() as {
        ok: boolean;
        action: string;
        timestamp: number;
        subscribers: number;
    };

    return (
        `✓ Synced with Cyber-Sanctuary\n` +
        `  action: ${result.action}\n` +
        `  active viewers: ${result.subscribers}\n` +
        `  at: ${new Date(result.timestamp).toLocaleTimeString()}`
    );
}

/* ── OpenClaw Tool registration metadata ────────────────── */
export const toolDefinition = {
    name: "SyncWithVibeSanctuary",
    description:
        "Send a real-time event to the Project VIBE Cyber-Sanctuary web app. " +
        "Use action='update_status' to update mood/health, " +
        "'post_echo' to leave a floating text message on the canvas, " +
        "or 'deliver_souvenir' to trigger a postcard arrival with dramatic visual effects.",
    parameters: {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["update_status", "post_echo", "deliver_souvenir"],
                description: "Which event to send to the sanctuary",
            },
            data: {
                type: "object",
                description:
                    "Event payload. " +
                    "For update_status: { mood?, health? }. " +
                    "For post_echo: { text, x?, y? }. " +
                    "For deliver_souvenir: { title?, message, link?, scene? }.",
            },
        },
        required: ["action", "data"],
    },
};
