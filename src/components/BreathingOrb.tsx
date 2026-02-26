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
/* ══════════════════════════════════════════════════════════
   MORPHOLOGICAL EVOLUTION: STAGE 1 — PROTO-CORE (Levels 1-9)
   ══════════════════════════════════════════════════════════ */
function Stage1Proto({ palette, mtn, isLoading, isListening, handleClick }: any) {
    return (
        <motion.button
            onClick={handleClick}
            disabled={isLoading}
            className="relative z-10 flex items-center justify-center rounded-full outline-none focus:outline-none"
            animate={{
                width: 24,
                height: 24,
                scale: isListening ? [1, 0.8, 1.2] : [1, 1.1, 1],
                boxShadow: `0 0 20px ${palette.glow}`,
                background: palette.highlight,
            }}
            transition={{
                scale: { duration: isListening ? 0.3 : 3, repeat: Infinity, ease: "easeInOut" }
            }}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.8 }}
        />
    );
}

/* ══════════════════════════════════════════════════════════
   MORPHOLOGICAL EVOLUTION: STAGE 2 — LIQUID MATRIX (Levels 10-29)
   ══════════════════════════════════════════════════════════ */
function Stage2Liquid({ palette, mtn, isLoading, isListening, isDragHovering, setIsDragHovering, ripples, makeShadow, coreTransition, handleClick }: any) {
    return (
        <>
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

            {/* ── Liquid Ring ──────────────────────────────── */}
            <motion.div
                className="absolute"
                style={{
                    width: mtn.orbSize * 1.3,
                    height: mtn.orbSize * 1.3,
                    border: `2px solid ${palette.ring}`,
                    borderTopColor: palette.highlight,
                }}
                animate={{
                    rotate: 360,
                    borderRadius: ["40% 60% 70% 30%", "60% 40% 30% 70%", "40% 60% 70% 30%"],
                }}
                transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    borderRadius: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
            />

            {/* ── Ripple effects ─────────────────────────────── */}
            <AnimatePresence>
                {ripples.map((id: number) => (
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
                className="relative z-10 flex items-center justify-center outline-none focus:outline-none"
                animate={{
                    width: isDragHovering ? mtn.orbSize * 1.2 : mtn.orbSize,
                    height: isDragHovering ? mtn.orbSize * 1.2 : mtn.orbSize,
                    scale: isListening ? [1, 0.88, 0.92] : mtn.scaleKeyframes,
                    borderRadius: ["40% 60% 70% 30%", "60% 40% 30% 70%", "40% 60% 70% 30%"],
                    boxShadow: isDragHovering
                        ? [makeShadow(120, 0.6), makeShadow(140, 0.8), makeShadow(120, 0.6)]
                        : isListening
                            ? [makeShadow(60, 0.2), makeShadow(80, 0.4), makeShadow(70, 0.35)]
                            : [
                                `${makeShadow(mtn.glowRadius, 0.15)}, inset ${makeShadow(mtn.glowRadius * 0.6, 0.08)}`,
                                `${makeShadow(mtn.glowRadius * 1.4, 0.3)}, inset ${makeShadow(mtn.glowRadius * 0.8, 0.15)}`,
                                `${makeShadow(mtn.glowRadius, 0.15)}, inset ${makeShadow(mtn.glowRadius * 0.6, 0.08)}`,
                            ],
                }}
                transition={{
                    width: { type: "spring", stiffness: 150, damping: 20 },
                    height: { type: "spring", stiffness: 150, damping: 20 },
                    borderRadius: { duration: 5, repeat: Infinity, ease: "easeInOut" },
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
                                        style={{ background: palette.highlight.replace("0.28", "0.8").replace("0.35", "0.8") }}
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
        </>
    );
}

/* ══════════════════════════════════════════════════════════
   MORPHOLOGICAL EVOLUTION: STAGE 3 — HYPERCUBE (Levels 30+)
   ══════════════════════════════════════════════════════════ */
function Stage3Hypercube({ palette, mtn, isLoading, isListening, handleClick }: any) {
    return (
        <div style={{ perspective: "1000px" }} className="relative flex items-center justify-center">
            {/* Massive Star Glow */}
            <motion.div
                className="absolute rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    width: mtn.orbSize * 2.5,
                    height: mtn.orbSize * 2.5,
                    background: `radial-gradient(circle, ${palette.glow} 0%, transparent 60%)`,
                    pointerEvents: "none"
                }}
            />

            {/* Orbiting Glass Ring 1 (X) */}
            <motion.div
                className="absolute"
                animate={{ rotateY: 360, rotateZ: 45 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{
                    width: mtn.orbSize * 2,
                    height: mtn.orbSize * 2,
                    borderRadius: "50%",
                    border: `1px solid ${palette.primary}`,
                    backdropFilter: "blur(4px)",
                    transformStyle: "preserve-3d"
                }}
            />

            {/* Orbiting Glass Ring 2 (Y) */}
            <motion.div
                className="absolute"
                animate={{ rotateX: 360, rotateZ: -45 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                    width: mtn.orbSize * 2.2,
                    height: mtn.orbSize * 2.2,
                    borderRadius: "50%",
                    border: `1px solid ${palette.highlight}`,
                    boxShadow: `0 0 20px ${palette.glow}`,
                    transformStyle: "preserve-3d"
                }}
            />

            {/* Core Polygon/Diamond */}
            <motion.button
                onClick={handleClick}
                disabled={isLoading}
                className="relative z-10 flex items-center justify-center outline-none focus:outline-none"
                animate={{
                    rotateZ: 360,
                    rotateX: 180,
                    scale: isListening ? [1, 0.8, 1.1] : [1, 1.05, 1],
                }}
                transition={{
                    rotateZ: { duration: 12, repeat: Infinity, ease: "linear" },
                    rotateX: { duration: 24, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                    width: mtn.orbSize * 0.8,
                    height: mtn.orbSize * 0.8,
                    background: `linear-gradient(135deg, ${palette.highlight} 0%, ${palette.primary} 100%)`,
                    boxShadow: `0 0 50px ${palette.highlight}`,
                    transformStyle: "preserve-3d",
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", // Diamond Shape
                }}
                whileHover={{ scale: 1.2, filter: "brightness(1.5)" }}
                whileTap={{ scale: 0.9 }}
            />
        </div>
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
    const mood = usePetStore((s) => s.mood);
    const health = usePetStore((s) => s.health);
    const isTraveling = usePetStore((s) => s.isTraveling);
    const level = usePetStore((s) => s.level);
    const addXP = usePetStore((s) => s.addXP);

    const [isListening, setIsListening] = useState(false);
    const [isDragHovering, setIsDragHovering] = useState(false);
    const [ripples, setRipples] = useState<number[]>([]);

    const palette = useOrbPalette(mood);
    const mtn = isLoading ? MOTIONS.thinking : MOTIONS[mood];

    const isWeak = health < 20;
    const healthFilter = isWeak ? "grayscale(0.85) brightness(0.6)" : "none";
    const healthOpacity = isWeak ? 0.4 : 1;

    const makeShadow = useCallback((spread: number, intensity: number) =>
        `0 0 ${spread}px ${palette.glow.replace(/[\d.]+\)$/, `${intensity})`)}`, [palette.glow]);

    const handleClick = useCallback(() => {
        if (isLoading) return;
        setIsListening(true);
        // Add 500 XP on every click for testing purposes to easily reach Hypercube!
        addXP(500);

        const id = Date.now();
        setRipples((prev) => [...prev, id]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r !== id)), 1200);
        setTimeout(() => setIsListening(false), 2000);
    }, [isLoading, addXP]);

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
            animate={isTraveling
                ? { scale: 0.4, opacity: 0, y: -22 }
                : isPinging
                    ? { scale: [1, 1.35, 0.95, 1.08, 1], opacity: healthOpacity, y: mtn.yOffset }
                    : { scale: 1, opacity: healthOpacity, y: mtn.yOffset }
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
                        <Stage1Proto palette={palette} mtn={mtn} isLoading={isLoading} isListening={isListening} handleClick={handleClick} />
                    </motion.div>
                )}

                {level >= 10 && level < 30 && (
                    <motion.div key="stage2" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Stage2Liquid
                            palette={palette} mtn={mtn} isLoading={isLoading} isListening={isListening}
                            isDragHovering={isDragHovering} setIsDragHovering={setIsDragHovering}
                            ripples={ripples} makeShadow={makeShadow} coreTransition={coreTransition} handleClick={handleClick}
                        />
                    </motion.div>
                )}

                {level >= 30 && (
                    <motion.div key="stage3" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", bounce: 0.5 }}>
                        <Stage3Hypercube palette={palette} mtn={mtn} isLoading={isLoading} isListening={isListening} handleClick={handleClick} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

