"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePetStore } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   CLONE ORB — The small keeper that stays home while
   the main AI is out wandering. Dim, quiet, patient.
   Inspired by 旅行青蛙's home porch guardian concept.
   ══════════════════════════════════════════════════════════ */

export function CloneOrb() {
    const isTraveling = usePetStore((s) => s.isTraveling);
    const theme = useThemeStore((s) => s.currentTheme);

    /* Muted version of the primary accent */
    const dimColor = theme.colors.primary;

    /* Pick a gentle random pulse offset per mount */
    const phaseDelay = useMemo(() => Math.random() * 1.5, []);

    return (
        <AnimatePresence>
            {isTraveling && (
                <motion.div
                    key="clone-orb"
                    initial={{ opacity: 0, scale: 0.6, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 8 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
                    className="flex flex-col items-center gap-3"
                >
                    {/* ── Orb assembly ─────────────────────────────── */}
                    <div className="relative flex items-center justify-center">
                        {/* Soft ambient glow */}
                        <motion.div
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: 90,
                                height: 90,
                                background: `radial-gradient(circle, ${dimColor}18 0%, transparent 70%)`,
                            }}
                            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: phaseDelay }}
                        />

                        {/* Thin ring */}
                        <motion.div
                            className="absolute rounded-full"
                            style={{
                                width: 62,
                                height: 62,
                                border: `1px solid ${dimColor}22`,
                            }}
                            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.04, 1] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: phaseDelay }}
                        />

                        {/* Core — small, dim */}
                        <motion.div
                            className="relative rounded-full flex items-center justify-center"
                            style={{
                                width: 48,
                                height: 48,
                                background: `radial-gradient(circle at 38% 35%, ${dimColor}30 0%, rgba(12,8,28,0.7) 70%)`,
                                border: `1px solid ${dimColor}20`,
                                boxShadow: `0 0 18px ${dimColor}18, inset 0 0 12px rgba(0,0,0,0.4)`,
                            }}
                            animate={{
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    `0 0 14px ${dimColor}12`,
                                    `0 0 22px ${dimColor}22`,
                                    `0 0 14px ${dimColor}12`,
                                ],
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: phaseDelay }}
                        >
                            {/* Inner highlight */}
                            <div
                                className="absolute rounded-full"
                                style={{
                                    width: 18,
                                    height: 18,
                                    top: 8,
                                    left: 10,
                                    background: `radial-gradient(circle, ${dimColor}25 0%, transparent 70%)`,
                                    filter: "blur(4px)",
                                }}
                            />
                        </motion.div>
                    </div>

                    {/* ── Label ─────────────────────────────────────── */}
                    <div className="flex flex-col items-center gap-1">
                        <motion.p
                            className="text-[9px] font-light tracking-[0.3em]"
                            style={{ color: `${dimColor}60` }}
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            「留守」
                        </motion.p>
                        <p
                            className="text-[7px] uppercase tracking-[0.35em] font-light"
                            style={{ color: "rgba(255,255,255,0.18)" }}
                        >
                            home clone
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
