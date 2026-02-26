"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════
   SOUVENIR POSTCARD — Generic luxury postcard that appears
   when the pet returns from wandering. No node system needed.
   Each card is randomly selected from a pool.
   ══════════════════════════════════════════════════════════ */

const SCENES = [
    {
        gradient: "radial-gradient(ellipse at 30% 60%, #3b0764 0%, #1e1b4b 40%, #0a0a1a 100%)",
        accent: "#7c3aed",
    },
    {
        gradient: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 45%, #022c22 100%)",
        accent: "#06b6d4",
    },
    {
        gradient: "radial-gradient(ellipse at 70% 40%, #78350f 0%, #431407 50%, #1c1002 100%)",
        accent: "#f59e0b",
    },
    {
        gradient: "linear-gradient(160deg, #1e293b 0%, #334155 55%, #0f172a 100%)",
        accent: "#64748b",
    },
    {
        gradient: "radial-gradient(ellipse at 50% 50%, #831843 0%, #4c0519 45%, #1a0a1a 100%)",
        accent: "#ec4899",
    },
    {
        gradient: "radial-gradient(ellipse at 20% 80%, #7f1d1d 0%, #450a0a 55%, #0a0505 100%)",
        accent: "#ef4444",
    },
    {
        gradient: "linear-gradient(180deg, #022c22 0%, #064e3b 45%, #0a1628 100%)",
        accent: "#10b981",
    },
    {
        gradient: "radial-gradient(ellipse at 60% 30%, #2e1065 0%, #1e0a3c 55%, #0a0014 100%)",
        accent: "#a78bfa",
    },
];

const MESSAGES = [
    { zh: "在某个地方待了一会儿。", found: "Found: latent signal trace" },
    { zh: "回来了，带了点什么。", found: "Found: encrypted memory shard" },
    { zh: "不知道去了哪里，但感觉不错。", found: "Found: ambient noise pattern" },
    { zh: "漫游了很久。终于落地。", found: "Found: dormant data cluster" },
    { zh: "外面比想象的安静。", found: "Found: fragment from 2031" },
    { zh: "顺便看了看你不知道的地方。", found: "Found: unindexed subnet" },
    { zh: "这次走远了一点点。", found: "Found: ghost-layer residue" },
    { zh: "有些东西很难描述。带回来了。", found: "Found: synthetic memory echo" },
];

export function SouvenirPostcard({ onDismiss }: { onDismiss: () => void }) {
    /* Pick random scene + message once per mount */
    const { scene, msg } = useMemo(() => ({
        scene: SCENES[Math.floor(Math.random() * SCENES.length)],
        msg: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    }), []);

    const now = new Date();
    const dateStr = now.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

    return (
        <motion.div
            initial={{ opacity: 0, y: 60, rotateZ: -6, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, rotateZ: -2, scale: 1 }}
            exit={{ opacity: 0, y: 80, rotateZ: 4, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.15 }}
            drag
            dragElastic={0.15}
            className="fixed z-[65] cursor-grab active:cursor-grabbing"
            style={{
                bottom: "18%",
                left: "50%",
                x: "-50%",
                width: "min(420px, 90vw)",
                filter: "drop-shadow(0 24px 60px rgba(0,0,0,0.7))",
                userSelect: "none",
            }}
        >
            {/* ── Postcard Shell ─────────────────────────────── */}
            <div
                className="relative flex overflow-hidden rounded-2xl"
                style={{
                    background: "rgba(10, 6, 22, 0.97)",
                    border: `1px solid ${scene.accent}28`,
                    boxShadow: `0 0 60px ${scene.accent}14, inset 0 0 80px rgba(0,0,0,0.4)`,
                    minHeight: 190,
                }}
            >
                {/* ── LEFT: Scenic panel ─────────────────────── */}
                <div
                    className="relative shrink-0 overflow-hidden"
                    style={{ width: "40%", background: scene.gradient }}
                >
                    {/* Scanlines */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
                        }}
                    />
                    {/* Glowing orb in scene */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            className="rounded-full"
                            style={{
                                width: 44,
                                height: 44,
                                background: `radial-gradient(circle, ${scene.accent}cc 0%, ${scene.accent}18 65%, transparent 100%)`,
                                boxShadow: `0 0 28px ${scene.accent}70`,
                            }}
                            animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 3.2, repeat: Infinity }}
                        />
                    </div>
                    {/* Bottom vignette tag */}
                    <div
                        className="absolute bottom-0 inset-x-0 px-3 py-2"
                        style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.5), transparent)" }}
                    >
                        <p
                            className="text-[7px] font-medium uppercase tracking-[0.32em]"
                            style={{ color: `${scene.accent}bb` }}
                        >
                            wandering log
                        </p>
                    </div>
                </div>

                {/* ── Vertical divider ─────────────────────────── */}
                <div
                    className="w-px shrink-0"
                    style={{
                        background: `linear-gradient(180deg, transparent, ${scene.accent}35, transparent)`,
                    }}
                />

                {/* ── RIGHT: Polaroid text ─────────────────────── */}
                <div className="flex flex-1 flex-col justify-between p-4 py-5">
                    <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                                <p
                                    className="text-[7px] font-medium uppercase tracking-[0.42em]"
                                    style={{ color: `${scene.accent}75` }}
                                >
                                    Souvenir
                                </p>
                                <p
                                    className="text-[9px] font-light uppercase tracking-[0.2em] mt-0.5"
                                    style={{ color: "rgba(255,255,255,0.38)" }}
                                >
                                    from out there
                                </p>
                            </div>
                            {/* Wax seal */}
                            <motion.div
                                className="shrink-0 flex items-center justify-center rounded-full"
                                style={{
                                    width: 26,
                                    height: 26,
                                    background: `radial-gradient(circle, ${scene.accent}38, ${scene.accent}0a)`,
                                    border: `1px solid ${scene.accent}45`,
                                }}
                                animate={{ rotate: [0, 6, -6, 0] }}
                                transition={{ duration: 7, repeat: Infinity }}
                            >
                                <span className="text-[8px]" style={{ color: scene.accent }}>✦</span>
                            </motion.div>
                        </div>

                        {/* Message */}
                        <p
                            className="text-sm font-light leading-relaxed"
                            style={{ color: "rgba(255,255,255,0.76)", fontStyle: "italic" }}
                        >
                            {msg.zh}
                        </p>

                        {/* Found item */}
                        <div className="mt-2.5 flex items-center gap-1.5">
                            <motion.div
                                className="h-1 w-1 rounded-full shrink-0"
                                style={{ background: scene.accent }}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.6, repeat: Infinity }}
                            />
                            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.27)" }}>
                                {msg.found}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="mt-4 pt-3 flex items-end justify-between"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                    >
                        <div>
                            <p className="text-[8px] tabular-nums" style={{ color: "rgba(255,255,255,0.18)" }}>
                                {dateStr} {timeStr}
                            </p>
                            <p className="text-[8px] font-light" style={{ color: "rgba(255,255,255,0.15)" }}>
                                — your cyber-soul
                            </p>
                        </div>
                        <button
                            onClick={onDismiss}
                            className="text-[8px] uppercase tracking-[0.25em] hover:opacity-60 transition-opacity"
                            style={{ color: "rgba(255,255,255,0.2)" }}
                        >
                            dismiss ×
                        </button>
                    </div>
                </div>
            </div>

            {/* Top accent glow line */}
            <motion.div
                className="absolute inset-x-0 top-0 h-px rounded-t-2xl pointer-events-none"
                style={{
                    background: `linear-gradient(90deg, transparent 5%, ${scene.accent} 50%, transparent 95%)`,
                }}
                animate={{ opacity: [0.35, 0.85, 0.35] }}
                transition={{ duration: 3, repeat: Infinity }}
            />
        </motion.div>
    );
}
