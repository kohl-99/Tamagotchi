"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   VIBE TRANSITION OVERLAY
   
   When the theme changes, a light-wave circle erupts from
   the screen center (the orb position) and expands to fill
   the entire viewport, then fades. This creates the "AI just
   rewrote the rules of physics" feeling.
   ══════════════════════════════════════════════════════════ */

export function VibeTransitionOverlay() {
    const previousPrimary = useThemeStore((s) => s.previousThemePrimary);
    const currentPrimary = useThemeStore((s) => s.currentTheme?.colors?.primary || "#7c3aed");
    const [wave, setWave] = useState<{ color: string; id: number } | null>(null);
    const lastPrimary = useRef(currentPrimary);
    const mountedRef = useRef(false);

    useEffect(() => {
        /* Skip the initial mount — no wave on first render */
        if (!mountedRef.current) {
            mountedRef.current = true;
            lastPrimary.current = currentPrimary;
            return;
        }

        /* Only fire if primary actually changed */
        if (currentPrimary !== lastPrimary.current) {
            const waveColor = previousPrimary ?? currentPrimary;
            setWave({ color: waveColor, id: Date.now() });
            lastPrimary.current = currentPrimary;
        }
    }, [currentPrimary, previousPrimary]);

    return (
        <AnimatePresence>
            {wave && (
                <motion.div
                    key={wave.id}
                    className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    onAnimationComplete={() => setWave(null)}
                >
                    <motion.div
                        className="rounded-full"
                        style={{
                            width: 40,
                            height: 40,
                            background: `radial-gradient(circle, ${wave.color}50 0%, ${wave.color}20 40%, transparent 70%)`,
                            boxShadow: `0 0 80px ${wave.color}40, 0 0 160px ${wave.color}20`,
                        }}
                        initial={{ scale: 0, opacity: 0.9 }}
                        animate={{ scale: 60, opacity: 0 }}
                        transition={{
                            scale: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                            opacity: { duration: 0.7, ease: "easeOut" },
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
