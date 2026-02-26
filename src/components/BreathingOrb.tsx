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
   极简、克制、像一颗在深海中呼吸的发光卵
   ══════════════════════════════════════════════════════════ */
function Stage1Proto({ handleClick, isLoading }: any) {
    return (
        <button onClick={handleClick} disabled={isLoading} className="flex items-center justify-center w-64 h-64 outline-none focus:outline-none">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-4 h-4 rounded-full"
                style={{
                    backgroundColor: "var(--vibe-primary)",
                    boxShadow: `
              0 0 10px var(--vibe-primary),
              0 0 40px var(--vibe-primary-soft),
              0 0 80px var(--vibe-primary-soft)
            `
                }}
            />
        </button>
    );
}

/* ══════════════════════════════════════════════════════════
   MORPHOLOGICAL EVOLUTION: STAGE 2 — LIQUID MATRIX (Levels 10-29)
   真正的无规则流体动画，使用 8 点 border-radius 变换
   ══════════════════════════════════════════════════════════ */
function Stage2Liquid({ handleClick, isLoading }: any) {
    return (
        <button onClick={handleClick} disabled={isLoading} className="flex items-center justify-center w-64 h-64 outline-none focus:outline-none">
            <motion.div
                animate={{
                    borderRadius: [
                        "60% 40% 30% 70% / 60% 30% 70% 40%",
                        "30% 70% 70% 30% / 30% 30% 70% 70%",
                        "60% 40% 30% 70% / 60% 30% 70% 40%"
                    ],
                    rotate: [0, 360]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="w-32 h-32 relative flex items-center justify-center border border-white/20"
                style={{
                    background: "linear-gradient(135deg, var(--vibe-primary-soft) 0%, transparent 100%)",
                    backdropFilter: "blur(var(--vibe-blur))",
                    boxShadow: `
              inset 0 0 20px rgba(255, 255, 255, 0.2),
              0 0 30px var(--vibe-primary-soft)
            `
                }}
            >
                {/* 内部的高亮核心 */}
                <motion.div
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-full blur-md"
                    style={{ backgroundColor: "var(--vibe-primary)" }}
                />
            </motion.div>
        </button>
    );
}

/* ══════════════════════════════════════════════════════════
   MORPHOLOGICAL EVOLUTION: STAGE 3 — HYPERCUBE (Levels 30+)
   终极炫耀形态！包含 3D 旋转的玻璃星环和极致发光的奇点
   ══════════════════════════════════════════════════════════ */
function Stage3Hypercube({ handleClick, isLoading }: any) {
    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="relative flex items-center justify-center w-64 h-64 outline-none focus:outline-none"
            style={{ perspective: "1000px" }} // 必须开启 3D 空间透视
        >
            {/* 中心燃烧的奇点 */}
            <motion.div
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute z-10 w-12 h-12 rounded-full"
                style={{
                    backgroundColor: "var(--vibe-primary)",
                    boxShadow: `0 0 60px var(--vibe-primary), 0 0 120px var(--vibe-primary)`
                }}
            />

            {/* 外层主星环 (3D 翻转) */}
            <motion.div
                animate={{
                    rotateX: [0, 360],
                    rotateY: [0, 180],
                    rotateZ: [0, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-48 h-48 rounded-full border-[1px]"
                style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    borderLeftColor: "var(--vibe-primary)", // 流星拖尾效果
                    backdropFilter: "blur(2px)",
                    boxShadow: "inset 0 0 20px var(--vibe-primary-soft)"
                }}
            />

            {/* 内层副星环 (逆向 3D 翻转) */}
            <motion.div
                animate={{
                    rotateX: [180, 0],
                    rotateY: [360, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-32 h-32 rounded-full border-[1px]"
                style={{
                    borderColor: "rgba(255,255,255,0.05)",
                    borderRightColor: "var(--vibe-primary)",
                }}
            />
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
