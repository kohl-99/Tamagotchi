"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePetStore, type PetMood } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";
import { GenerativeOrbRenderer, OrbGenerating } from "@/components/GenerativeOrbRenderer";

/* ══════════════════════════════════════════════════════════
   MOOD → VISUAL PALETTE (from theme store)
   ══════════════════════════════════════════════════════════ */
function useOrbPalette(mood: PetMood) {
    const orb = useThemeStore((s) => s.currentTheme.orb);
    return useMemo(() => {
        switch (mood) {
            case "calm": return orb.calm;
            case "excited": return orb.excited;
            case "emo": return orb.emo;
            case "thinking": return orb.thinking;
            default: return orb.calm;
        }
    }, [mood, orb]);
}

/* ══════════════════════════════════════════════════════════
   MOOD → ANIMATION CONFIG
   ══════════════════════════════════════════════════════════ */
interface MoodMotion {
    scaleKeyframes: number[];
    duration: number;
    glowRadius: number;
    orbSize: number;
    yOffset: number;
    rotate: number;
}

const MOTIONS: Record<PetMood, MoodMotion> = {
    calm: { scaleKeyframes: [1, 1.05, 1], duration: 4, glowRadius: 70, orbSize: 140, yOffset: 0, rotate: 0 },
    excited: { scaleKeyframes: [1, 1.1, 0.96, 1.08, 1], duration: 0.8, glowRadius: 110, orbSize: 150, yOffset: 0, rotate: 360 },
    emo: { scaleKeyframes: [1, 0.97, 1], duration: 6, glowRadius: 25, orbSize: 110, yOffset: 40, rotate: 0 },
    thinking: { scaleKeyframes: [1, 1.06, 0.98, 1.04, 1], duration: 1.8, glowRadius: 90, orbSize: 140, yOffset: 0, rotate: 0 },
};

/* ══════════════════════════════════════════════════════════
   FALLBACK STAGES (when no generative orb code is set)
   ══════════════════════════════════════════════════════════ */
export function Stage1Proto({ handleClick, isLoading }: any) {
    return (
        <button onClick={handleClick} disabled={isLoading} className="relative flex items-center justify-center w-64 h-64 outline-none focus:outline-none group">
            <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-5 h-5 rounded-full"
                style={{
                    backgroundColor: "white",
                    boxShadow: `0 0 10px white, 0 0 30px var(--vibe-primary), 0 0 80px var(--vibe-primary-soft)`,
                }}
            />
            <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute w-12 h-12 rounded-full border border-[var(--vibe-primary-soft)]"
            />
        </button>
    );
}

export function Stage2Liquid({ handleClick, isLoading }: any) {
    return (
        <button onClick={handleClick} disabled={isLoading} className="relative flex items-center justify-center w-64 h-64 outline-none focus:outline-none">
            <motion.div
                animate={{ scale: [1, 1.08, 0.96, 1.04, 1], opacity: [0.9, 1, 0.85, 1, 0.9] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-32 h-32 rounded-full"
                style={{
                    background: "radial-gradient(ellipse at 35% 35%, white 0%, var(--vibe-primary) 50%, var(--vibe-primary-soft) 100%)",
                    boxShadow: `0 0 40px var(--vibe-primary), 0 0 100px var(--vibe-primary-soft)`,
                    filter: "blur(1px)",
                }}
            />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-40 h-40 rounded-full border border-[var(--vibe-primary-soft)]"
                style={{ opacity: 0.3 }}
            />
        </button>
    );
}

export function Stage3Hypercube({ handleClick, isLoading }: any) {
    return (
        <button onClick={handleClick} disabled={isLoading} className="relative flex items-center justify-center w-64 h-64 outline-none focus:outline-none">
            <motion.div
                animate={{ rotateY: 360, rotateX: 360, scale: [1, 1.05, 1] }}
                transition={{
                    rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
                    rotateX: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute z-10 w-16 h-16 flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
            >
                <div
                    className="absolute w-full h-full"
                    style={{
                        background: "linear-gradient(135deg, white 0%, var(--vibe-primary) 100%)",
                        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                        boxShadow: `0 0 40px var(--vibe-primary), 0 0 80px white`,
                        mixBlendMode: "screen"
                    }}
                />
            </motion.div>
        </button>
    );
}

/* ══════════════════════════════════════════════════════════
   BREATHING ORB (MAIN COMPONENT)
   ══════════════════════════════════════════════════════════ */
export function BreathingOrb({
    isLoading = false,
    isPinging = false,
    generativeOrbCode,
}: {
    isLoading?: boolean;
    isPinging?: boolean;
    /** If set, renders the AI-generated orb instead of stage-based orbs */
    generativeOrbCode?: string | null;
}) {
    const health = usePetStore((s) => s.health);
    const isTraveling = usePetStore((s) => s.isTraveling);
    const level = usePetStore((s) => s.level);
    const addXP = usePetStore((s) => s.addXP);

    const isWeak = health < 20;
    const healthFilter = isWeak ? "grayscale(0.85) brightness(0.6)" : "none";
    const healthOpacity = isWeak ? 0.4 : 1;

    const handleClick = useCallback(() => {
        if (isLoading) return;
        addXP(500);
    }, [isLoading, addXP]);

    return (
        <div className="flex flex-col items-center">
            <motion.div
                className="relative flex items-center justify-center min-h-[300px]"
                animate={isTraveling
                    ? { scale: 0.4, opacity: 0, y: -22 }
                    : isPinging
                        ? { scale: [1, 1.35, 0.95, 1.08, 1], opacity: healthOpacity }
                        : { scale: 1, opacity: healthOpacity }
                }
                transition={isTraveling
                    ? { duration: 2.5, ease: "easeInOut" }
                    : isPinging
                        ? { duration: 1.2, ease: "easeOut", times: [0, 0.3, 0.55, 0.8, 1] }
                        : { type: "spring", stiffness: 120, damping: 18, mass: 1 }
                }
                style={!isTraveling ? { filter: healthFilter, transition: "filter 1.2s ease" } : {}}
            >
                {/* LEVEL EVOLUTION FLASHBANG */}
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={level}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{ opacity: 0, scale: 50 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute z-50 rounded-full pointer-events-none"
                        style={{ background: "white", width: 10, height: 10, boxShadow: "0 0 100px 50px white" }}
                    />
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {/* ── GENERATIVE ORB MODE ─────────────────────── */}
                    {generativeOrbCode && (
                        <motion.div
                            key="generative"
                            initial={{ scale: 0, filter: "blur(20px)" }}
                            animate={{ scale: 1, filter: "blur(0px)" }}
                            exit={{ scale: 0, filter: "blur(20px)" }}
                            transition={{ type: "spring", bounce: 0.3 }}
                            onClick={handleClick}
                            className="cursor-pointer"
                        >
                            <GenerativeOrbRenderer orbCode={generativeOrbCode} />
                        </motion.div>
                    )}


                    {/* ── FALLBACK: STAGE-BASED ORBS ──────────────── */}
                    {!generativeOrbCode && level < 10 && (
                        <motion.div key="stage1" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Stage1Proto handleClick={handleClick} isLoading={isLoading} />
                        </motion.div>
                    )}

                    {!generativeOrbCode && level >= 10 && level < 30 && (
                        <motion.div key="stage2" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Stage2Liquid handleClick={handleClick} isLoading={isLoading} />
                        </motion.div>
                    )}

                    {!generativeOrbCode && level >= 30 && (
                        <motion.div key="stage3" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", bounce: 0.5 }}>
                            <Stage3Hypercube handleClick={handleClick} isLoading={isLoading} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
