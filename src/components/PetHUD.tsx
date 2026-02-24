"use client";

import { motion } from "framer-motion";
import { usePetStore } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   VIBE HUD — Floating life-sign indicators
   All colors read from the centralized Vibe Engine.
   ══════════════════════════════════════════════════════════ */

/* ── LOCATION BEACON (top-left) ────────────────────────── */
function LocationBeacon() {
    const location = usePetStore((s) => s.location);
    const beaconColor = useThemeStore((s) => s.currentTheme.hud.location);

    return (
        <div className="fixed top-5 left-5 z-50 flex items-center gap-2.5">
            <div className="relative">
                <motion.div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: beaconColor }}
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: beaconColor }}
                    animate={{ opacity: [0.2, 0, 0.2], scale: [1, 3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            <span
                className="text-[9px] font-light uppercase tracking-[0.25em] vibe-transition"
                style={{ color: "var(--vibe-text-muted)", fontFeatureSettings: "'tnum'" }}
            >
                {location}
            </span>
        </div>
    );
}

/* ── HEALTH PULSE (bottom-left) ────────────────────────── */
function HealthPulse() {
    const health = usePetStore((s) => s.health);
    const hud = useThemeStore((s) => s.currentTheme.hud);

    const color =
        health > 70 ? hud.healthOk : health > 40 ? hud.healthWarn : hud.healthCrit;

    return (
        <div className="fixed bottom-24 left-5 z-50 flex items-end gap-2">
            <div className="relative mb-0.5">
                <motion.div
                    className="h-1 w-1 rounded-full"
                    style={{ background: color, opacity: 0.6 }}
                    animate={{
                        opacity: [0.5, 1, 0.5],
                        boxShadow: [
                            `0 0 4px ${color}33`,
                            `0 0 12px ${color}`,
                            `0 0 4px ${color}33`,
                        ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            <span
                className="text-xl font-extralight tabular-nums leading-none vibe-transition"
                style={{ color, letterSpacing: "-0.02em", opacity: 0.6 }}
            >
                {health}
            </span>
            <span
                className="text-[8px] font-light uppercase tracking-[0.2em] mb-0.5"
                style={{ color: "var(--vibe-text-muted)" }}
            >
                %hp
            </span>
        </div>
    );
}

/* ── SYNC RINGS (top-right) ────────────────────────────── */
function SyncRings() {
    const syncRate = usePetStore((s) => s.syncRate);
    const syncColor = useThemeStore((s) => s.currentTheme.hud.sync);

    const overlap = (syncRate / 100) * 14;
    const brightness = 0.1 + (syncRate / 100) * 0.5;

    return (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3">
            <span
                className="text-[9px] font-light uppercase tracking-[0.2em] vibe-transition"
                style={{ color: "var(--vibe-text-muted)", fontFeatureSettings: "'tnum'" }}
            >
                {syncRate}% sync
            </span>
            <div className="relative h-5 w-9">
                <motion.div
                    className="absolute top-0 h-5 w-5 rounded-full"
                    style={{
                        border: `1px solid var(--vibe-text-muted)`,
                        opacity: 0.3,
                        left: 0,
                    }}
                />
                <motion.div
                    className="absolute top-0 h-5 w-5 rounded-full"
                    style={{
                        border: `1px solid ${syncColor}`,
                        opacity: brightness,
                        right: 0,
                    }}
                    animate={{ x: -overlap }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
                {syncRate > 30 && (
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 rounded-full"
                        style={{
                            width: Math.max(2, overlap * 0.6),
                            height: Math.max(2, overlap * 0.6),
                            left: `calc(50% - ${overlap * 0.3}px)`,
                            background: syncColor,
                            opacity: brightness * 0.6,
                            boxShadow: `0 0 ${overlap}px ${syncColor}`,
                        }}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                )}
            </div>
        </div>
    );
}

/* ── MOOD SIGIL (bottom-right) ─────────────────────────── */
function MoodSigil() {
    const mood = usePetStore((s) => s.mood);
    const hud = useThemeStore((s) => s.currentTheme.hud);

    const moodConfig: Record<
        string,
        { symbol: string; color: string; label: string }
    > = {
        calm: { symbol: "◯", color: hud.moodCalm, label: "calm" },
        excited: { symbol: "◈", color: hud.moodExcited, label: "excited" },
        emo: { symbol: "◇", color: hud.moodEmo, label: "emo" },
        thinking: { symbol: "⟡", color: hud.moodThinking, label: "thinking" },
    };

    const cfg = moodConfig[mood] || moodConfig.calm;

    return (
        <div className="fixed bottom-24 right-5 z-50 flex items-center gap-2">
            <span
                className="text-[9px] font-light uppercase tracking-[0.2em] vibe-transition"
                style={{ color: "var(--vibe-text-muted)" }}
            >
                {cfg.label}
            </span>
            <motion.span
                className="text-lg leading-none"
                style={{ color: cfg.color }}
                animate={{
                    opacity: [0.5, 1, 0.5],
                    rotate: mood === "thinking" ? [0, 360] : [0, 0],
                }}
                transition={{
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    rotate: {
                        duration: mood === "thinking" ? 8 : 0,
                        repeat: Infinity,
                        ease: "linear",
                    },
                }}
            >
                {cfg.symbol}
            </motion.span>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   EXPORTED COMPOSITE HUD
   ══════════════════════════════════════════════════════════ */
export function PetHUD() {
    return (
        <>
            <LocationBeacon />
            <SyncRings />
            <HealthPulse />
            <MoodSigil />
        </>
    );
}
