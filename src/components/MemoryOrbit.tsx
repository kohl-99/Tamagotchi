"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePetStore, type Memory } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   MEMORY ORBIT — Context fragments orbiting the cyber-soul
   Uses Math.sin/cos to position glowing dots on elliptical
   orbits. Hover a dot → glass card with memory text.
   ══════════════════════════════════════════════════════════ */

/* ── Single memory dot ─────────────────────────────────── */
function MemoryDot({
    memory,
    index,
    total,
    tick,
}: {
    memory: Memory;
    index: number;
    total: number;
    tick: number;
}) {
    const [hovered, setHovered] = useState(false);
    const dotColor = useThemeStore((s) => s.currentTheme.memory.dotColor);
    const dotGlow = useThemeStore((s) => s.currentTheme.memory.dotGlow);
    const cardBg = useThemeStore((s) => s.currentTheme.memory.cardBg);

    /* Distribute dots evenly around the orbit, each with unique speed */
    const config = useMemo(() => {
        const baseAngle = (index / total) * Math.PI * 2;
        const speed = 0.00006 + (index * 0.000015);    // very slow drift
        const radiusX = 150 + (index % 3) * 28;         // 150–206px ellipse X
        const radiusY = 120 + (index % 3) * 22;         // 120–164px ellipse Y
        const tilt = ((index * 17) % 20) - 10;           // ±10° orbit tilt
        return { baseAngle, speed, radiusX, radiusY, tilt };
    }, [index, total]);

    /*
     * timeOffsetRef: accumulated "virtual time" correction.
     * When the user hovers, we freeze the angle. When they leave,
     * we solve for an offset such that the continuous formula
     *   angle = baseAngle + (now + offset) * speed
     * equals the frozen angle at the moment of release.
     * This makes the dot resume from exactly where it stopped.
     */
    const frozenAngleRef = useRef<number | null>(null);
    const timeOffsetRef = useRef<number>(0);

    const liveAngle = config.baseAngle + (tick + timeOffsetRef.current) * config.speed;
    const angle = frozenAngleRef.current ?? liveAngle;
    const x = Math.cos(angle) * config.radiusX;
    const y = Math.sin(angle) * config.radiusY;

    /* Dot brightness based on position (front = brighter) */
    const depth = Math.sin(angle);
    const opacity = 0.45 + depth * 0.4;   // 0.45–0.85
    const scale = 0.8 + depth * 0.2;      // 0.8–1.0

    return (
        <div
            className="absolute"
            style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) rotate(${config.tilt}deg) scale(${scale})`,
                zIndex: depth > 0 ? 15 : 5,
            }}
            onMouseEnter={() => {
                setHovered(true);
                // Freeze at the current live angle
                frozenAngleRef.current = config.baseAngle + (tick + timeOffsetRef.current) * config.speed;
            }}
            onMouseLeave={() => {
                setHovered(false);
                if (frozenAngleRef.current !== null) {
                    // Solve: frozenAngle = baseAngle + (Date.now() + offset) * speed
                    // => offset = (frozenAngle - baseAngle) / speed - Date.now()
                    timeOffsetRef.current = (frozenAngleRef.current - config.baseAngle) / config.speed - Date.now();
                }
                frozenAngleRef.current = null;
            }}
        >
            {/* Glowing dot — pulse uses fixed opacity range to avoid framer restart blink */}
            <motion.div
                className="h-3.5 w-3.5 rounded-full cursor-pointer"
                style={{
                    background: `radial-gradient(circle, ${dotColor.replace('1)', `${opacity})`)} 0%, ${dotGlow.replace('1)', `${opacity * 0.5})`)} 50%, transparent 100%)`,
                    boxShadow: `0 0 ${10 + depth * 8}px ${dotColor.replace('1)', `${opacity * 0.6})`)}, 0 0 ${20 + depth * 12}px ${dotGlow.replace('1)', `${opacity * 0.2})`)}`,
                    opacity,
                }}
                animate={{
                    // Fixed range — independent of depth so framer never restarts on position change
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 2 + index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "mirror",
                }}
            />

            {/* Hover card — glassmorphic micro-card */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 5 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-4 pointer-events-none whitespace-nowrap z-50"
                    >
                        <div
                            className="rounded-xl px-3 py-2 max-w-[200px]"
                            style={{
                                background: cardBg,
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                boxShadow:
                                    `0 0 0 0.5px ${dotColor.replace('1)', '0.12)')}, 0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${dotGlow.replace('1)', '0.06)')}`,
                            }}
                        >
                            <p className="text-[10px] font-light whitespace-normal leading-snug" style={{ color: "var(--vibe-text)" }}>
                                {memory.text}
                            </p>
                            <p className="text-[8px] mt-1 tabular-nums" style={{ color: "var(--vibe-text-muted)" }}>
                                {new Date(memory.timestamp).toLocaleDateString()}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── Exported orbit container ──────────────────────────── */
export function MemoryOrbit() {
    const memories = usePetStore((s) => s.memories);
    const [tick, setTick] = useState(0);
    const rafRef = useRef<number>(0);

    /* Animation loop — ~60fps tick for smooth orbit */
    useEffect(() => {
        let running = true;
        const loop = () => {
            if (!running) return;
            setTick(Date.now());
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            running = false;
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    if (memories.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full pointer-events-auto">
                {memories.map((mem, i) => (
                    <MemoryDot
                        key={mem.id}
                        memory={mem}
                        index={i}
                        total={memories.length}
                        tick={tick}
                    />
                ))}
            </div>
        </div>
    );
}
