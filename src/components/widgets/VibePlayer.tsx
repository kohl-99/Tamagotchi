"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   情绪胶片机 — VIBE PLAYER
   Abstract spinning disc + minimal play/pause.
   Generates meditative ambient drone via Web Audio API —
   no external files, no CDN dependency.
   ══════════════════════════════════════════════════════════ */

function createAmbientDrone(ctx: AudioContext): () => void {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 1.5);
    masterGain.connect(ctx.destination);

    const oscs: OscillatorNode[] = [];

    /* Harmonic series: root + fifth + octave (slightly detuned for warmth) */
    const partials = [
        { freq: 55, gain: 1.0, type: "sine" as OscillatorType },
        { freq: 82.4, gain: 0.5, type: "sine" as OscillatorType },
        { freq: 110.1, gain: 0.3, type: "sine" as OscillatorType },
        { freq: 165, gain: 0.12, type: "sine" as OscillatorType },
    ];

    partials.forEach(({ freq, gain, type }) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq + (Math.random() - 0.5) * 0.4; // micro-detune
        const g = ctx.createGain();
        g.gain.value = gain;
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        oscs.push(osc);
    });

    /* Slow filter sweep for movement */
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 8);
    filter.frequency.linearRampToValueAtTime(400, ctx.currentTime + 16);

    return () => {
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
        setTimeout(() => oscs.forEach((o) => { try { o.stop(); } catch { /* ok */ } }), 900);
    };
}

export function VibePlayer() {
    const theme = useThemeStore((s) => s.currentTheme);
    const [isPlaying, setIsPlaying] = useState(false);
    const [visualLevel, setVisulaLevel] = useState(0); // 0–1 for visualization

    const audioCtxRef = useRef<AudioContext | null>(null);
    const stopFnRef = useRef<(() => void) | null>(null);
    const vizIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            stopFnRef.current?.();
            stopFnRef.current = null;
            audioCtxRef.current = null;
            clearInterval(vizIntervalRef.current ?? undefined);
            setIsPlaying(false);
            setVisulaLevel(0);
        } else {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            audioCtxRef.current = ctx;
            stopFnRef.current = createAmbientDrone(ctx);
            setIsPlaying(true);
            /* Animate a random "level" for visual interest */
            vizIntervalRef.current = setInterval(
                () => setVisulaLevel(0.3 + Math.random() * 0.7),
                400
            );
        }
    }, [isPlaying]);

    /* Cleanup on unmount */
    useEffect(() => {
        return () => {
            stopFnRef.current?.();
            clearInterval(vizIntervalRef.current ?? undefined);
        };
    }, []);

    const primary = theme.colors.primary;
    const radius = theme.geometry.radius;

    return (
        <div
            className="vibe-transition"
            style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: `1px solid ${primary}18`,
                borderRadius: radius,
                padding: "14px 16px",
                width: "148px",
            }}
        >
            {/* Label row */}
            <div className="flex items-center justify-between mb-3">
                <span
                    className="text-[8px] uppercase tracking-[0.35em] font-light"
                    style={{ color: `${primary}50` }}
                >
                    vibe
                </span>
                <AnimatePresence>
                    {isPlaying && (
                        <motion.div
                            key="playing-pip"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: primary }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Abstract vinyl disc */}
            <div className="flex justify-center mb-3">
                <motion.div
                    className="relative flex items-center justify-center"
                    style={{ width: 72, height: 72 }}
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={
                        isPlaying
                            ? { duration: 8, repeat: Infinity, ease: "linear" }
                            : { duration: 0.5, ease: "easeOut" }
                    }
                >
                    {/* Outer ring */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            border: `1px solid ${primary}30`,
                            boxShadow: isPlaying ? `0 0 20px ${primary}25, 0 0 40px ${primary}10` : "none",
                            transition: "box-shadow 1s ease",
                        }}
                    />
                    {/* Mid ring */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: 50, height: 50,
                            border: `1px solid ${primary}20`,
                        }}
                    />
                    {/* Inner ring */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: 30, height: 30,
                            border: `1px solid ${primary}15`,
                        }}
                    />
                    {/* Groove lines (decorative arcs) */}
                    {[30, 60, 120, 210, 270, 330].map((deg) => (
                        <div
                            key={deg}
                            className="absolute"
                            style={{
                                width: 2,
                                height: 18,
                                background: `${primary}12`,
                                transformOrigin: "50% 100%",
                                borderRadius: "1px",
                                bottom: "50%",
                                left: "calc(50% - 1px)",
                                transform: `rotate(${deg}deg) translateY(-14px)`,
                            }}
                        />
                    ))}
                    {/* Center spindle */}
                    <div
                        className="absolute w-2.5 h-2.5 rounded-full"
                        style={{
                            background: `radial-gradient(circle, ${primary}80 0%, ${primary}30 100%)`,
                            boxShadow: isPlaying ? `0 0 8px ${primary}60` : "none",
                        }}
                    />
                </motion.div>
            </div>

            {/* Frequency bars */}
            <div className="flex items-end justify-center gap-0.5 h-5 mb-3">
                {Array.from({ length: 11 }).map((_, i) => {
                    const active = isPlaying;
                    const barH = active
                        ? Math.max(2, Math.min(20, (Math.sin(i * 0.9 + visualLevel * 5) + 1) * 9))
                        : 2;
                    return (
                        <motion.div
                            key={i}
                            className="rounded-sm"
                            style={{ width: 3, background: `${primary}60` }}
                            animate={{ height: barH }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                        />
                    );
                })}
            </div>

            {/* Divider */}
            <div className="h-px mb-3" style={{ background: `${primary}12` }} />

            {/* Play / Pause button */}
            <div className="flex items-center justify-between">
                <span
                    className="text-[8px] font-light"
                    style={{ color: `${primary}35` }}
                >
                    {isPlaying ? "ambient · playing" : "ambient · paused"}
                </span>
                <motion.button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    data-no-echo
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{
                        background: `${primary}18`,
                        border: `1px solid ${primary}30`,
                        boxShadow: isPlaying ? `0 0 12px ${primary}30` : "none",
                    }}
                >
                    {isPlaying ? (
                        /* Pause icon */
                        <div className="flex gap-0.5">
                            <div className="h-2.5 w-0.5 rounded-sm" style={{ background: primary }} />
                            <div className="h-2.5 w-0.5 rounded-sm" style={{ background: primary }} />
                        </div>
                    ) : (
                        /* Play icon */
                        <div
                            style={{
                                width: 0, height: 0,
                                borderTop: "4px solid transparent",
                                borderBottom: "4px solid transparent",
                                borderLeft: `7px solid ${primary}`,
                                marginLeft: "2px",
                            }}
                        />
                    )}
                </motion.button>
            </div>
        </div>
    );
}
