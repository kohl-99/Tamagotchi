"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Mood color map ────────────────────────────────────── */
const MOOD_COLORS = {
    calm: {
        primary: "rgba(124,58,237,0.25)",
        glow: "rgba(124,58,237,0.2)",
        ring: "rgba(167,139,250,0.12)",
        highlight: "rgba(196,181,253,0.3)",
    },
    thinking: {
        primary: "rgba(6,182,212,0.25)",
        glow: "rgba(6,182,212,0.2)",
        ring: "rgba(103,232,249,0.12)",
        highlight: "rgba(165,243,252,0.3)",
    },
    excited: {
        primary: "rgba(245,158,11,0.25)",
        glow: "rgba(245,158,11,0.2)",
        ring: "rgba(252,211,77,0.12)",
        highlight: "rgba(253,224,71,0.3)",
    },
};

type Mood = "calm" | "thinking" | "excited";

export function BreathingOrb({
    isLoading = false,
    mood = "calm",
}: {
    isLoading?: boolean;
    mood?: Mood;
}) {
    const [isListening, setIsListening] = useState(false);
    const [ripples, setRipples] = useState<number[]>([]);

    const colors = MOOD_COLORS[mood] || MOOD_COLORS.calm;

    const handleClick = useCallback(() => {
        if (isLoading) return;
        setIsListening(true);
        const id = Date.now();
        setRipples((prev) => [...prev, id]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r !== id)), 1200);
        setTimeout(() => setIsListening(false), 2000);
    }, [isLoading]);

    return (
        <div className="relative flex items-center justify-center">
            {/* ── Ambient outer glow ─────────────────────────── */}
            <motion.div
                className="absolute h-64 w-64 rounded-full sm:h-72 sm:w-72"
                style={{
                    background: `radial-gradient(circle, ${colors.glow} 0%, ${colors.glow.replace("0.2", "0.05")} 40%, transparent 70%)`,
                }}
                animate={
                    isLoading
                        ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }
                        : { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }
                }
                transition={{
                    duration: isLoading ? 1.5 : 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* ── Spinning ring (loading state) ──────────────── */}
            <motion.div
                className="absolute h-48 w-48 rounded-full sm:h-52 sm:w-52"
                style={{
                    border: `1px solid ${colors.ring}`,
                    borderTopColor: isLoading ? colors.highlight : colors.ring,
                }}
                animate={
                    isLoading
                        ? { rotate: 360, scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }
                        : { scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }
                }
                transition={
                    isLoading
                        ? { rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }
                        : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }
            />

            {/* ── Second spinning ring (loading only) ────────── */}
            {isLoading && (
                <motion.div
                    className="absolute h-56 w-56 rounded-full sm:h-60 sm:w-60"
                    style={{
                        border: `1px solid ${colors.ring}`,
                        borderBottomColor: colors.highlight,
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
                        style={{ border: `1px solid ${colors.highlight}` }}
                        initial={{ width: 120, height: 120, opacity: 0.8 }}
                        animate={{ width: 320, height: 320, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                ))}
            </AnimatePresence>

            {/* ── Core orb ───────────────────────────────────── */}
            <motion.button
                onClick={handleClick}
                disabled={isLoading}
                className="relative z-10 flex items-center justify-center rounded-full
                   outline-none focus:outline-none disabled:cursor-default"
                style={{
                    width: 140,
                    height: 140,
                    background: `radial-gradient(circle at 35% 35%, ${colors.highlight} 0%, ${colors.primary} 40%, rgba(30,20,60,0.6) 100%)`,
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: `1px solid ${colors.ring}`,
                }}
                animate={
                    isLoading
                        ? {
                            scale: [1, 1.06, 0.98, 1.04, 1],
                            boxShadow: [
                                `0 0 60px ${colors.glow}, inset 0 0 40px ${colors.glow.replace("0.2", "0.1")}`,
                                `0 0 100px ${colors.glow.replace("0.2", "0.5")}, inset 0 0 60px ${colors.glow.replace("0.2", "0.25")}`,
                                `0 0 60px ${colors.glow}, inset 0 0 40px ${colors.glow.replace("0.2", "0.1")}`,
                                `0 0 90px ${colors.glow.replace("0.2", "0.4")}, inset 0 0 55px ${colors.glow.replace("0.2", "0.2")}`,
                                `0 0 60px ${colors.glow}, inset 0 0 40px ${colors.glow.replace("0.2", "0.1")}`,
                            ],
                        }
                        : isListening
                            ? {
                                scale: [1, 0.88, 0.92],
                                boxShadow: [
                                    `0 0 60px ${colors.glow}`,
                                    `0 0 80px ${colors.glow.replace("0.2", "0.4")}`,
                                    `0 0 70px ${colors.glow.replace("0.2", "0.35")}`,
                                ],
                            }
                            : {
                                scale: [1, 1.04, 1],
                                boxShadow: [
                                    `0 0 60px ${colors.glow}, inset 0 0 40px ${colors.glow.replace("0.2", "0.1")}`,
                                    `0 0 80px ${colors.glow.replace("0.2", "0.3")}, inset 0 0 50px ${colors.glow.replace("0.2", "0.15")}`,
                                    `0 0 60px ${colors.glow}, inset 0 0 40px ${colors.glow.replace("0.2", "0.1")}`,
                                ],
                            }
                }
                transition={
                    isLoading
                        ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                        : isListening
                            ? { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }
                whileHover={isLoading ? {} : { scale: 1.06 }}
                whileTap={isLoading ? {} : { scale: 0.9 }}
            >
                {/* Inner highlight */}
                <div
                    className="absolute h-16 w-16 rounded-full"
                    style={{
                        background: `radial-gradient(circle at 40% 40%, ${colors.highlight} 0%, transparent 70%)`,
                        filter: "blur(8px)",
                    }}
                />

                {/* Listening bars */}
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
                                        style={{ background: `${colors.highlight.replace("0.3", "0.8")}` }}
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
        </div>
    );
}
