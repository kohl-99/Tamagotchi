"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Music, Play, Heart } from "lucide-react";

/* ── Shared card wrapper ───────────────────────────────── */
function WidgetCard({
    children,
    accentColor = "rgba(124,58,237,0.5)",
    delay = 0,
}: {
    children: React.ReactNode;
    accentColor?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-2xl border p-5"
            style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
            }}
        >
            {/* Neon accent border glow (top edge) */}
            <div
                className="absolute inset-x-0 top-0 h-[1px]"
                style={{
                    background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                }}
            />
            {children}
        </motion.div>
    );
}

/* ── Schedule Card ─────────────────────────────────────── */
export function ScheduleWidget() {
    const events = [
        {
            time: "10:00 AM",
            title: "Design Review",
            location: "Studio A",
            color: "#7c3aed",
        },
        {
            time: "2:30 PM",
            title: "Neural Sync Session",
            location: "Virtual",
            color: "#06b6d4",
        },
    ];

    return (
        <WidgetCard accentColor="rgba(124,58,237,0.6)" delay={0.2}>
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-violet-400" />
                    <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                        Today&apos;s Schedule
                    </span>
                </div>
                <span className="text-xs text-white/25">Feb 23</span>
            </div>

            {/* Events */}
            <div className="space-y-3">
                {events.map((event, i) => (
                    <div key={i} className="flex items-start gap-3">
                        {/* Time pill */}
                        <div className="flex w-16 shrink-0 items-center gap-1.5">
                            <Clock size={10} className="text-white/30" />
                            <span className="text-xs tabular-nums text-white/50">
                                {event.time}
                            </span>
                        </div>

                        {/* Accent bar + content */}
                        <div className="flex gap-2.5">
                            <div
                                className="mt-0.5 h-8 w-[2px] shrink-0 rounded-full"
                                style={{ background: event.color }}
                            />
                            <div>
                                <p className="text-sm font-medium text-white/80">
                                    {event.title}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1">
                                    <MapPin size={9} className="text-white/25" />
                                    <span className="text-[11px] text-white/30">
                                        {event.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetCard>
    );
}

/* ── Music Card ────────────────────────────────────────── */
export function MusicWidget() {
    return (
        <WidgetCard accentColor="rgba(6,182,212,0.5)" delay={0.35}>
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
                <Music size={14} className="text-cyan-400" />
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                    Curated for You
                </span>
            </div>

            {/* Track */}
            <div className="flex items-center gap-4">
                {/* Album art placeholder */}
                <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <Play size={18} className="ml-0.5 text-white/60" />
                </div>

                {/* Track info */}
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/80">
                        Midnight Protocol
                    </p>
                    <p className="mt-0.5 text-xs text-white/35">
                        Synthwave Collective
                    </p>

                    {/* Faux waveform */}
                    <div className="mt-2 flex items-end gap-[2px]">
                        {Array.from({ length: 24 }, (_, i) => {
                            const h = Math.sin(i * 0.7) * 8 + Math.random() * 6 + 4;
                            const played = i < 14;
                            return (
                                <div
                                    key={i}
                                    className="w-[3px] rounded-full transition-colors"
                                    style={{
                                        height: `${h}px`,
                                        background: played
                                            ? "rgba(6,182,212,0.6)"
                                            : "rgba(255,255,255,0.1)",
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Like button */}
                <button className="shrink-0 rounded-full p-2 text-white/30 transition-colors hover:text-pink-400">
                    <Heart size={16} />
                </button>
            </div>
        </WidgetCard>
    );
}
