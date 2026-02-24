"use client";

import { useState, useCallback } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    AnimatePresence,
    type PanInfo,
} from "framer-motion";
import Image from "next/image";

/* ── Card data ─────────────────────────────────────────── */
const cards = [
    { id: 1, src: "/moodboard/card-1.png", label: "Brutalist Concrete" },
    { id: 2, src: "/moodboard/card-2.png", label: "Neon Cityscape" },
    { id: 3, src: "/moodboard/card-3.png", label: "Crystal Geometry" },
    { id: 4, src: "/moodboard/card-4.png", label: "Twilight Garden" },
    { id: 5, src: "/moodboard/card-5.png", label: "Futuristic Interior" },
];

/* ── Thresholds ────────────────────────────────────────── */
const SWIPE_THRESHOLD = 120;

/* ── Single draggable card ─────────────────────────────── */
function SwipeCard({
    card,
    onSwipe,
    isFront,
}: {
    card: (typeof cards)[number];
    onSwipe: (dir: "left" | "right") => void;
    isFront: boolean;
}) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
    const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 0.7]);
    const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [0.7, 0]);

    const handleDragEnd = useCallback(
        (_: unknown, info: PanInfo) => {
            const { x: ox } = info.offset;
            const { x: vx } = info.velocity;
            if (ox > SWIPE_THRESHOLD || vx > 600) onSwipe("right");
            else if (ox < -SWIPE_THRESHOLD || vx < -600) onSwipe("left");
        },
        [onSwipe],
    );

    return (
        <motion.div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ x, rotate, zIndex: isFront ? 10 : 0 }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            exit={{
                opacity: 0,
                transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            }}
            whileTap={{ scale: isFront ? 1.02 : 1 }}
        >
            <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <Image
                    src={card.src}
                    alt={card.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 400px"
                    priority={isFront}
                    draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                {/* Label */}
                <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                        {card.label}
                    </p>
                </div>

                {/* LIKE glow */}
                {isFront && (
                    <motion.div
                        className="pointer-events-none absolute inset-0 rounded-3xl"
                        style={{
                            opacity: likeOpacity,
                            background:
                                "radial-gradient(ellipse at 70% 50%, rgba(147,197,253,0.35) 0%, transparent 70%)",
                            boxShadow: "inset 0 0 80px rgba(147,197,253,0.15)",
                        }}
                    />
                )}

                {/* NOPE glow */}
                {isFront && (
                    <motion.div
                        className="pointer-events-none absolute inset-0 rounded-3xl"
                        style={{
                            opacity: nopeOpacity,
                            background:
                                "radial-gradient(ellipse at 30% 50%, rgba(239,68,68,0.3) 0%, transparent 70%)",
                            boxShadow: "inset 0 0 80px rgba(239,68,68,0.12)",
                        }}
                    />
                )}

                {/* Badges */}
                {isFront && (
                    <>
                        <motion.div
                            className="pointer-events-none absolute left-5 top-5 rounded-lg border-2 border-blue-400/80 px-3 py-0.5"
                            style={{ opacity: likeOpacity }}
                        >
                            <span className="text-base font-bold uppercase tracking-wider text-blue-400">
                                Like
                            </span>
                        </motion.div>
                        <motion.div
                            className="pointer-events-none absolute right-5 top-5 rounded-lg border-2 border-red-400/80 px-3 py-0.5"
                            style={{ opacity: nopeOpacity }}
                        >
                            <span className="text-base font-bold uppercase tracking-wider text-red-400">
                                Nope
                            </span>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.div>
    );
}

/* ── Main exported component ───────────────────────────── */
export function MoodboardSwipe() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipedIds, setSwipedIds] = useState<Set<number>>(new Set());

    const visibleCards = cards.filter((c) => !swipedIds.has(c.id));
    const isFinished = visibleCards.length === 0;

    const handleSwipe = useCallback(
        (dir: "left" | "right") => {
            const card = visibleCards[0];
            if (!card) return;
            setSwipedIds((prev) => new Set(prev).add(card.id));
            setCurrentIndex((prev) => prev + 1);
        },
        [visibleCards],
    );

    return (
        <div className="relative flex h-full flex-col items-center">
            {/* ── Card stack — grows to fill parent ──────────── */}
            <div className="relative w-full flex-1">
                <AnimatePresence mode="popLayout">
                    {visibleCards
                        .slice(0, 3)
                        .reverse()
                        .map((card, i, arr) => {
                            const isFront = i === arr.length - 1;
                            const stackIndex = arr.length - 1 - i;
                            return (
                                <motion.div
                                    key={card.id}
                                    className="absolute inset-0"
                                    initial={{ scale: 0.92, opacity: 0.5, y: 24 }}
                                    animate={{
                                        scale: 1 - stackIndex * 0.04,
                                        opacity: 1 - stackIndex * 0.2,
                                        y: stackIndex * 10,
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 28,
                                    }}
                                >
                                    <SwipeCard
                                        card={card}
                                        onSwipe={handleSwipe}
                                        isFront={isFront}
                                    />
                                </motion.div>
                            );
                        })}
                </AnimatePresence>

                {/* Finished state */}
                {isFinished && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex h-full flex-col items-center justify-center gap-3"
                    >
                        <div
                            className="glow-pulse h-20 w-20 rounded-full"
                            style={{ background: "rgba(124,58,237,0.3)" }}
                        />
                        <p className="mt-3 text-lg font-medium text-white/80">
                            Your cyber-soul is taking shape.
                        </p>
                        <p className="text-sm text-white/40">
                            {currentIndex} vibes captured
                        </p>
                    </motion.div>
                )}
            </div>

            {/* ── Progress dots ──────────────────────────────── */}
            {!isFinished && (
                <div className="mt-5 flex gap-2">
                    {cards.map((card, i) => (
                        <div
                            key={card.id}
                            className="h-1.5 w-6 rounded-full transition-all duration-300"
                            style={{
                                background: swipedIds.has(card.id)
                                    ? "rgba(124,58,237,0.8)"
                                    : i === currentIndex
                                        ? "rgba(255,255,255,0.5)"
                                        : "rgba(255,255,255,0.12)",
                            }}
                        />
                    ))}
                </div>
            )}

            {/* ── Hint text ──────────────────────────────────── */}
            {!isFinished && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="mt-3 text-center text-sm tracking-wide text-white/30"
                >
                    Swipe right to shape your cyber-soul
                </motion.p>
            )}
        </div>
    );
}
