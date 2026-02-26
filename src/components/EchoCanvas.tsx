"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePetStore, type Echo } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   ECHO ITEM — A frameless floating text shard.
   User echoes glow in the theme primary accent.
   AI echoes drift with faint fluorescent cyan.
   Double-click to dissolve.
   ══════════════════════════════════════════════════════════ */

function EchoItem({ echo }: { echo: Echo }) {
    const theme = useThemeStore((s) => s.currentTheme);
    const removeEcho = usePetStore((s) => s.removeEcho);

    /* Stable per-echo float rhythm derived from its ID chars */
    const { floatY, floatDuration, floatDelay } = useMemo(() => {
        const c0 = echo.id.charCodeAt(0) || 65;
        const cN = echo.id.charCodeAt(echo.id.length - 1) || 90;
        return {
            floatY: 5 + (cN % 6),         // 5–10px
            floatDuration: 7 + (c0 % 8),  // 7–14s
            floatDelay: (c0 * cN) % 5,    // 0–4s unique phase
        };
    }, [echo.id]);

    const isAI = echo.author === "ai";
    const textColor = isAI ? "rgba(34, 211, 238, 0.55)" : theme.colors.primary;
    const glowShadow = isAI
        ? "0 0 18px rgba(34,211,238,0.22), 0 0 40px rgba(34,211,238,0.08)"
        : `0 0 14px ${theme.colors.primary}55, 0 0 32px ${theme.colors.primary}18`;

    return (
        <motion.div
            className="absolute pointer-events-auto select-none cursor-default"
            style={{
                left: echo.x,
                top: echo.y,
                /* Use CSS transform for centering — don't mix with FM's numeric y */
                transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1, y: [0, -floatY, 0] }}
            exit={{ opacity: 0, scale: 0.7, filter: "blur(8px)" }}
            transition={{
                opacity: { duration: 0.8, ease: "easeOut" },
                scale: { duration: 0.6, ease: "easeOut" },
                y: {
                    duration: floatDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: floatDelay,
                    repeatType: "mirror",
                },
            }}
            onDoubleClick={(e) => { e.stopPropagation(); removeEcho(echo.id); }}
            title="double-click to dissolve"
        >
            {/* Author tag */}
            <p
                className="text-[7px] uppercase tracking-[0.35em] mb-0.5 font-light"
                style={{ color: isAI ? "rgba(34,211,238,0.28)" : `${theme.colors.primary}40` }}
            >
                {isAI ? "← lux" : "you ↑"}
            </p>

            {/* The echo text itself */}
            <p
                className="font-light leading-relaxed max-w-[200px] whitespace-pre-wrap"
                style={{
                    fontSize: "13px",
                    color: textColor,
                    textShadow: glowShadow,
                    letterSpacing: "0.02em",
                }}
            >
                {echo.text}
            </p>

            {/* Timestamp — guard against missing value from SSE */}
            {echo.timestamp > 0 && (
                <p
                    className="text-[7px] tabular-nums mt-1 font-light"
                    style={{ color: "rgba(255,255,255,0.12)" }}
                >
                    {new Date(echo.timestamp).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            )}
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════
   ECHO CANVAS — Full-screen transparent layer.
   Double-click anywhere to open an inline input.
   Enter to commit, Escape or blur to cancel.
   Sits at z-5 so it's above background but below the orb.
   ══════════════════════════════════════════════════════════ */

interface PendingEcho {
    x: number;
    y: number;
    value: string;
}

export function EchoCanvas() {
    const echoes = usePetStore((s) => s.echoes);
    const addEcho = usePetStore((s) => s.addEcho);
    const theme = useThemeStore((s) => s.currentTheme);

    const [pending, setPending] = useState<PendingEcho | null>(null);

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        /* Ignore clicks on interactive elements */
        const t = e.target as HTMLElement;
        if (t.closest("button, input, textarea, a, [role='button'], [data-no-echo]")) return;
        e.stopPropagation();
        setPending({ x: e.clientX, y: e.clientY, value: "" });
    };

    const commitPending = () => {
        if (pending?.value.trim()) {
            addEcho({ x: pending.x, y: pending.y, text: pending.value.trim(), author: "user" });
        }
        setPending(null);
    };

    return (
        /* pointer-events-none on wrapper so it doesn't block orb/buttons by default;
           individual child elements opt back in with pointer-events-auto */
        <div className="fixed inset-0 z-[5] pointer-events-none">
            {/* Full-screen hit area for double-click */}
            <div
                className="absolute inset-0 pointer-events-auto"
                onDoubleClick={handleDoubleClick}
            />

            {/* Echoes */}
            <AnimatePresence>
                {echoes.map((echo) => (
                    <EchoItem key={echo.id} echo={echo} />
                ))}
            </AnimatePresence>

            {/* Inline input at cursor position */}
            <AnimatePresence>
                {pending && (
                    <motion.div
                        key="pending"
                        className="fixed pointer-events-auto z-[6]"
                        style={{ left: pending.x, top: pending.y, x: "-50%", y: "-50%" }}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                    >
                        <p
                            className="text-[7px] uppercase tracking-[0.35em] mb-1 font-light"
                            style={{ color: `${theme.colors.primary}50` }}
                        >
                            you ↑
                        </p>
                        <input
                            autoFocus
                            value={pending.value}
                            onChange={(e) =>
                                setPending((p) => p ? { ...p, value: e.target.value } : null)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); commitPending(); }
                                if (e.key === "Escape") setPending(null);
                            }}
                            onBlur={commitPending}
                            placeholder="leave a trace…"
                            className="bg-transparent outline-none border-none font-light"
                            style={{
                                fontSize: "13px",
                                color: theme.colors.primary,
                                textShadow: `0 0 12px ${theme.colors.primary}55`,
                                caretColor: theme.colors.primary,
                                minWidth: "90px",
                                maxWidth: "220px",
                                width: `${Math.max(90, pending.value.length * 8)}px`,
                            }}
                        />
                        {/* Blinking underline cursor guide */}
                        <motion.div
                            className="h-px"
                            style={{ background: `${theme.colors.primary}35` }}
                            animate={{ opacity: [0.2, 0.7, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
