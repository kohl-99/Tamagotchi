"use client";

import { useState, useRef, useCallback } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    type PanInfo,
} from "framer-motion";
import { Check } from "lucide-react";

const TRACK_WIDTH = 320;
const THUMB_SIZE = 48;
const UNLOCK_THRESHOLD = TRACK_WIDTH - THUMB_SIZE - 8;

export function SlideToApprove({
    label = "Slide to Approve",
    onApprove,
}: {
    label?: string;
    onApprove?: () => void;
}) {
    const [approved, setApproved] = useState(false);
    const x = useMotionValue(0);
    const trackRef = useRef<HTMLDivElement>(null);

    // Label fades as thumb slides
    const labelOpacity = useTransform(x, [0, UNLOCK_THRESHOLD * 0.5], [1, 0]);

    // Green tint grows as thumb approaches end
    const successBg = useTransform(
        x,
        [0, UNLOCK_THRESHOLD],
        ["rgba(124,58,237,0)", "rgba(34,197,94,0.15)"],
    );

    const handleDragEnd = useCallback(
        (_: unknown, info: PanInfo) => {
            if (info.point.x === 0 && info.offset.x === 0) return;
            const currentX = x.get();
            if (currentX >= UNLOCK_THRESHOLD) {
                setApproved(true);
                onApprove?.();
            }
        },
        [onApprove, x],
    );

    return (
        <motion.div
            ref={trackRef}
            className="relative flex h-14 items-center overflow-hidden rounded-2xl"
            style={{
                width: TRACK_WIDTH,
                background: approved
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(255,255,255,0.04)",
                border: approved
                    ? "1px solid rgba(34,197,94,0.3)"
                    : "1px solid rgba(255,255,255,0.08)",
            }}
        >
            {/* Shimmer / flowing light effect */}
            {!approved && (
                <div
                    className="absolute inset-0 overflow-hidden rounded-2xl"
                    style={{
                        maskImage: "linear-gradient(90deg, transparent, white, transparent)",
                        WebkitMaskImage:
                            "linear-gradient(90deg, transparent, white, transparent)",
                    }}
                >
                    <motion.div
                        className="absolute inset-y-0 w-32"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(167,139,250,0.12), transparent)",
                        }}
                        animate={{ x: [-128, TRACK_WIDTH + 128] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                </div>
            )}

            {/* Label text */}
            <motion.span
                className="absolute inset-0 flex items-center justify-center text-xs font-medium uppercase tracking-[0.2em]"
                style={{
                    opacity: approved ? 0 : labelOpacity,
                    color: "rgba(255,255,255,0.35)",
                }}
            >
                {label}
            </motion.span>

            {/* Approved text */}
            {approved && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-green-400"
                >
                    <Check size={14} /> Approved
                </motion.span>
            )}

            {/* Draggable thumb */}
            {!approved && (
                <motion.div
                    className="relative z-10 ml-1 flex cursor-grab items-center justify-center rounded-xl active:cursor-grabbing"
                    style={{
                        x,
                        width: THUMB_SIZE,
                        height: THUMB_SIZE - 8,
                        background:
                            "linear-gradient(135deg, rgba(124,58,237,0.6), rgba(167,139,250,0.4))",
                        boxShadow:
                            "0 0 20px rgba(124,58,237,0.3), 0 2px 8px rgba(0,0,0,0.3)",
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: UNLOCK_THRESHOLD }}
                    dragElastic={0}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 18l6-6-6-6" />
                    </motion.svg>
                </motion.div>
            )}

            {/* Success background tint */}
            {!approved && (
                <motion.div
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{ background: successBg }}
                />
            )}
        </motion.div>
    );
}
