"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePetStore, type PetMood } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";

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
    glowRadius: number;        // px for outer glow spread
    orbSize: number;            // px core orb diameter
    yOffset: number;            // vertical shift (emo sinks)
    rotate: number;             // deg per loop (excited spins)
}

const MOTIONS: Record<PetMood, MoodMotion> = {
    calm: {
        scaleKeyframes: [1, 1.05, 1],
        duration: 4,
        glowRadius: 70,
        orbSize: 140,
        yOffset: 0,
        rotate: 0,
    },
    excited: {
        scaleKeyframes: [1, 1.1, 0.96, 1.08, 1],
        duration: 0.8,
        glowRadius: 110,
        orbSize: 150,
        yOffset: 0,
        rotate: 360,
    },
    emo: {
        scaleKeyframes: [1, 0.97, 1],
        duration: 6,
        glowRadius: 25,
        orbSize: 110,
        yOffset: 40,
        rotate: 0,
    },
    thinking: {
        scaleKeyframes: [1, 1.06, 0.98, 1.04, 1],
        duration: 1.8,
        glowRadius: 90,
        orbSize: 140,
        yOffset: 0,
        rotate: 0,
    },
}; // Closing the MOTIONS object here

/* ══════════════════════════════════════════════════════════
   MORPHOLOGICAL EVOLUTION: STAGE 1 — PROTO-CORE (Levels 1-9)
   A sleek, elegant glowing dot that breathes with pure light.
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
                    boxShadow: `
                        0 0 10px white,
                        0 0 30px var(--vibe-primary),
                        0 0 80px var(--vibe-primary-soft)
                    `,
                }}
            />
            {/* Soft ambient ring */}
            <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute w-12 h-12 rounded-full border border-[var(--vibe-primary-soft)]"
            />
        </button>
    );
}

/* ══════════════════════════════════════════════════════════
   MORPHOLOGICAL EVOLUTION: STAGE 2 — LIQUID MATRIX (Levels 10-29)
   A deep, refracting liquid orb with internal highlights.
   ══════════════════════════════════════════════════════════ */
export function Stage2Liquid({ handleClick, isLoading }: any) {
    return (
        <button onClick={handleClick} disabled={isLoading} className="relative flex items-center justify-center w-64 h-64 outline-none focus:outline-none group">
            {/* Outer Ambient Glow */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-48 h-48 rounded-full blur-2xl pointer-events-none"
                style={{ background: "radial-gradient(circle, var(--vibe-glow) 0%, transparent 70%)" }}
            />

            {/* The Liquid Core */}
            <motion.div
                animate={{
                    borderRadius: [
                        "40% 60% 70% 30% / 40% 50% 60% 50%",
                        "60% 40% 30% 70% / 60% 30% 70% 40%",
                        "50% 50% 60% 40% / 40% 60% 50% 60%",
                        "40% 60% 70% 30% / 40% 50% 60% 50%"
                    ],
                    rotate: 360
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 relative flex items-center justify-center overflow-hidden border border-white/20"
                style={{
                    background: "linear-gradient(135deg, var(--vibe-primary-soft) 0%, rgba(0,0,0,0.4) 100%)",
                    backdropFilter: "blur(12px)",
                    boxShadow: `
                        inset 0 0 30px rgba(255, 255, 255, 0.3),
                        inset 20px 0 40px var(--vibe-primary),
                        0 0 40px var(--vibe-glow)
                    `
                }}
            >
                {/* Inner Caustics / Highlight */}
                <motion.div
                    animate={{ x: [-10, 10, -10], y: [-15, 15, -15], scale: [1, 1.2, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-2 left-2 w-16 h-16 rounded-full blur-md"
                    style={{ background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 60%)" }}
                />
            </motion.div>

            {/* Orbiting fragments */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute w-40 h-40 rounded-full border border-dashed border-white/10"
            />
        </button>
    );
}

/* ══════════════════════════════════════════════════════════
   MORPHOLOGICAL EVOLUTION: STAGE 3 — HYPERCUBE (Levels 30+)
   The 'Celestial Astrolabe' - God-Tier multi-axis 3D geometry.
   ══════════════════════════════════════════════════════════ */
export function Stage3Hypercube({ handleClick, isLoading }: any) {
    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="relative flex items-center justify-center w-80 h-80 outline-none focus:outline-none group hover:scale-110 transition-transform duration-700"
            style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
        >
            {/* Deep Nebula Glow */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, var(--vibe-primary-soft) 0%, var(--vibe-glow) 40%, transparent 80%)" }}
            />

            {/* --- Astrolabe Ring 1 (Z-Axis Flat Orbit) --- */}
            <motion.div
                animate={{ rotateZ: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute w-56 h-56 rounded-full border-[1px]"
                style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    borderTopColor: "var(--vibe-primary)",
                    borderBottomColor: "white",
                    boxShadow: "0 0 15px var(--vibe-glow), inset 0 0 15px var(--vibe-glow)",
                    transformStyle: "preserve-3d"
                }}
            >
                {/* Orbital Node */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
            </motion.div>

            {/* --- Astrolabe Ring 2 (Y-Axis Vertical Spin) --- */}
            <motion.div
                animate={{ rotateY: 360, rotateZ: 45 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-44 h-44 rounded-full border-[2px]"
                style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    borderLeftColor: "var(--vibe-primary-soft)",
                    backdropFilter: "blur(4px)",
                    transformStyle: "preserve-3d"
                }}
            />

            {/* --- Astrolabe Ring 3 (X-Axis Horizontal Spin) --- */}
            <motion.div
                animate={{ rotateX: 360, rotateZ: -45 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-32 h-32 rounded-full border-[1px] border-dashed"
                style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    transformStyle: "preserve-3d"
                }}
            />

            {/* --- The Divine Core (Diamond/Octahedron illusion) --- */}
            <motion.div
                animate={{
                    rotateY: [-180, 180],
                    rotateX: [0, 360],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    rotateY: { duration: 10, repeat: Infinity, ease: "linear" },
                    rotateX: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute z-10 w-16 h-16 flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Solid geometric center */}
                <div
                    className="absolute w-full h-full"
                    style={{
                        background: "linear-gradient(135deg, white 0%, var(--vibe-primary) 100%)",
                        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", // Diamond Shape
                        boxShadow: `0 0 40px var(--vibe-primary), 0 0 80px white`,
                        mixBlendMode: "screen"
                    }}
                />
                <div
                    className="absolute w-full h-full rotate-90"
                    style={{
                        background: "linear-gradient(135deg, var(--vibe-primary-soft) 0%, transparent 100%)",
                        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", // Crossed Diamond
                        mixBlendMode: "color-dodge"
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
}: {
    isLoading?: boolean;
    isPinging?: boolean;
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
        addXP(500); // Level testing
    }, [isLoading, addXP]);

    return (
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
                {level < 10 && (
                    <motion.div key="stage1" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Stage1Proto handleClick={handleClick} isLoading={isLoading} />
                    </motion.div>
                )}

                {level >= 10 && level < 30 && (
                    <motion.div key="stage2" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Stage2Liquid handleClick={handleClick} isLoading={isLoading} />
                    </motion.div>
                )}

                {level >= 30 && (
                    <motion.div key="stage3" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", bounce: 0.5 }}>
                        <Stage3Hypercube handleClick={handleClick} isLoading={isLoading} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
