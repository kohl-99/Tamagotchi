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
};

/* ══════════════════════════════════════════════════════════
   BREATHING ORB
   ══════════════════════════════════════════════════════════ */
export function BreathingOrb({
    isLoading = false,
}: {
    isLoading?: boolean;
}) {
    const mood = usePetStore((s) => s.mood);
    const health = usePetStore((s) => s.health);

    const [isListening, setIsListening] = useState(false);
    const [isDragHovering, setIsDragHovering] = useState(false);
    const [ripples, setRipples] = useState<number[]>([]);

    const palette = useOrbPalette(mood);
    const mtn = isLoading ? MOTIONS.thinking : MOTIONS[mood];

    /* Health degradation: low token → desaturated, faded */
    const isWeak = health < 20;
    const healthFilter = isWeak ? "grayscale(0.85) brightness(0.6)" : "none";
    const healthOpacity = isWeak ? 0.4 : 1;

    /* Derive glow shadows */
    const makeShadow = (spread: number, intensity: number) =>
        `0 0 ${spread}px ${palette.glow.replace(/[\d.]+\)$/, `${intensity})`)}`;

    const handleClick = useCallback(() => {
        if (isLoading) return;
        setIsListening(true);
        const id = Date.now();
        setRipples((prev) => [...prev, id]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r !== id)), 1200);
        setTimeout(() => setIsListening(false), 2000);
    }, [isLoading]);

    /* Stable transition config */
    const coreTransition = useMemo(
        () =>
            isLoading
                ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const }
                : isListening
                    ? { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }
                    : { duration: mtn.duration, repeat: Infinity, ease: "easeInOut" as const },
        [isLoading, isListening, mtn.duration]
    );

    return (
        <motion.div
            className="relative flex items-center justify-center"
            /* Smooth vertical offset for emo mood */
            animate={{ y: mtn.yOffset, opacity: healthOpacity }}
            transition={{ type: "spring", stiffness: 120, damping: 18, mass: 1 }}
            style={{ filter: healthFilter, transition: "filter 1.2s ease" }}
        >
            {/* ── Ambient outer glow ─────────────────────────── */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: mtn.orbSize * 1.8,
                    height: mtn.orbSize * 1.8,
                    background: `radial-gradient(circle, ${palette.glow} 0%, ${palette.glow.replace(/[\d.]+\)$/, "0.03)")} 45%, transparent 70%)`,
                }}
                animate={
                    isLoading
                        ? { scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }
                        : isDragHovering
                            ? { scale: 1.4, opacity: 1 }
                            : { scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }
                }
                transition={{
                    duration: isLoading ? 1.5 : isDragHovering ? 0.3 : mtn.duration,
                    repeat: isDragHovering ? 0 : Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* ── Spinning ring ──────────────────────────────── */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: mtn.orbSize * 1.3,
                    height: mtn.orbSize * 1.3,
                    border: `1px solid ${palette.ring}`,
                    borderTopColor: isLoading || mood === "excited" ? palette.highlight : palette.ring,
                }}
                animate={
                    isLoading
                        ? { rotate: 360, scale: [1, 1.06, 1], opacity: [0.5, 1, 0.5] }
                        : mood === "excited"
                            ? { rotate: mtn.rotate, scale: [1, 1.08, 0.97, 1.05, 1], opacity: [0.6, 1, 0.6] }
                            : { scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }
                }
                transition={
                    isLoading
                        ? {
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                        }
                        : mood === "excited"
                            ? {
                                rotate: { duration: 1.2, repeat: Infinity, ease: "linear" },
                                scale: { duration: mtn.duration, repeat: Infinity, ease: "easeInOut" },
                            }
                            : { duration: mtn.duration * 0.9, repeat: Infinity, ease: "easeInOut" }
                }
            />

            {/* ── Second ring (loading / excited) ────────────── */}
            {(isLoading || mood === "excited") && (
                <motion.div
                    className="absolute rounded-full"
                    style={{
                        width: mtn.orbSize * 1.5,
                        height: mtn.orbSize * 1.5,
                        border: `1px solid ${palette.ring}`,
                        borderBottomColor: palette.highlight,
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
            )}

            {/* ── Ripple effects ─────────────────────────────── */}
            <AnimatePresence>
                {ripples.map((id) => (
                    <motion.div
                        key={id}
                        className="absolute rounded-full"
                        style={{ border: `1px solid ${palette.highlight}` }}
                        initial={{ width: mtn.orbSize * 0.85, height: mtn.orbSize * 0.85, opacity: 0.8 }}
                        animate={{ width: mtn.orbSize * 2.2, height: mtn.orbSize * 2.2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                ))}
            </AnimatePresence>

            {/* ── Core orb ───────────────────────────────────── */}
            <motion.button
                onClick={handleClick}
                onHoverStart={() => setIsDragHovering(true)}
                onHoverEnd={() => setIsDragHovering(false)}
                disabled={isLoading}
                className="relative z-10 flex items-center justify-center rounded-full
           outline-none focus:outline-none disabled:cursor-default"
                animate={{
                    width: isDragHovering ? mtn.orbSize * 1.2 : mtn.orbSize,
                    height: isDragHovering ? mtn.orbSize * 1.2 : mtn.orbSize,
                    scale: isListening
                        ? [1, 0.88, 0.92]
                        : mtn.scaleKeyframes,
                    boxShadow: isDragHovering
                        ? [
                            makeShadow(120, 0.6),
                            makeShadow(140, 0.8),
                            makeShadow(120, 0.6),
                        ]
                        : isListening
                            ? [
                                makeShadow(60, 0.2),
                                makeShadow(80, 0.4),
                                makeShadow(70, 0.35),
                            ]
                            : [
                                `${makeShadow(mtn.glowRadius, 0.15)}, inset ${makeShadow(mtn.glowRadius * 0.6, 0.08)}`,
                                `${makeShadow(mtn.glowRadius * 1.4, 0.3)}, inset ${makeShadow(mtn.glowRadius * 0.8, 0.15)}`,
                                `${makeShadow(mtn.glowRadius, 0.15)}, inset ${makeShadow(mtn.glowRadius * 0.6, 0.08)}`,
                            ],
                }}
                transition={{
                    width: { type: "spring", stiffness: 150, damping: 20 },
                    height: { type: "spring", stiffness: 150, damping: 20 },
                    ...coreTransition,
                }}
                style={{
                    background: `radial-gradient(circle at 35% 35%, ${palette.highlight} 0%, ${palette.primary} 40%, rgba(30,20,60,0.6) 100%)`,
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: `1px solid ${palette.ring}`,
                }}
                whileHover={isLoading ? {} : { scale: 1.06 }}
                whileTap={isLoading ? {} : { scale: 0.9 }}
            >
                {/* Inner highlight */}
                <div
                    className="absolute h-16 w-16 rounded-full"
                    style={{
                        background: `radial-gradient(circle at 40% 40%, ${palette.highlight} 0%, transparent 70%)`,
                        filter: "blur(8px)",
                    }}
                />

                {/* Listening / loading bars */}
                <AnimatePresence>
                    {(isListening || isLoading) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.3 }}
                            className="absolute"
                        >
                            <div className="flex items-center gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-[3px] rounded-full"
                                        style={{ background: palette.highlight.replace("0.28", "0.8").replace("0.35", "0.8").replace("0.12", "0.5").replace("0.30", "0.8") }}
                                        animate={{ height: [8, isLoading ? 24 : 20, 8] }}
                                        transition={{
                                            duration: isLoading ? 0.4 : 0.6,
                                            repeat: Infinity,
                                            delay: i * 0.1,
                                            ease: "easeInOut",
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </motion.div>
    );
}
