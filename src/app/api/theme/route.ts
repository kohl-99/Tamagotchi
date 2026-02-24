import { NextRequest, NextResponse } from "next/server";
import { PRESETS } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   THEME API — AI agent interface for visual mutation
   POST /api/theme — apply a preset or custom tokens
   GET  /api/theme — read current state + available presets
   ══════════════════════════════════════════════════════════ */

// In-memory server-side theme state (persisted per process)
let currentPreset: string | null = null;
let currentOverrides: Record<string, unknown> = {};

export async function GET() {
    return NextResponse.json({
        preset: currentPreset,
        overrides: currentOverrides,
        availablePresets: Object.keys(PRESETS),
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { preset, tokens } = body as {
            preset?: string;
            tokens?: Record<string, unknown>;
        };

        if (preset && preset in PRESETS) {
            currentPreset = preset;
            currentOverrides = {};
        }

        if (tokens && typeof tokens === "object") {
            currentOverrides = { ...currentOverrides, ...tokens };
        }

        return NextResponse.json({
            status: "applied",
            preset: currentPreset,
            overrides: currentOverrides,
            availablePresets: Object.keys(PRESETS),
        });
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
