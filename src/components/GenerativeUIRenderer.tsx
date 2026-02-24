"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useMemo } from "react";
import {
    Calendar,
    Clock,
    Sparkles,
    Cloud,
    MessageSquare,
    BarChart3,
    Table2,
    Newspaper,
    TrendingUp,
    TrendingDown,
    CheckCircle,
} from "lucide-react";
import { SlideToApprove } from "@/components/SlideToApprove";
import { usePetStore } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";

/* ── Types ─────────────────────────────────────────────── */
type UIType =
    | "schedule_card"
    | "approval_card"
    | "weather_vibe"
    | "text_message"
    | "chart_card"
    | "data_table"
    | "news_summary";

type Mood = "calm" | "thinking" | "excited";

interface AIResponseData {
    title?: string;
    description?: string;
    events?: { time: string; title: string; location: string }[];
    temperature?: string;
    condition?: string;
    message?: string;
    action?: string;
    chartType?: "bar" | "line";
    chartData?: { label: string; value: number; color?: string }[];
    unit?: string;
    columns?: string[];
    rows?: string[][];
    articles?: {
        headline: string;
        source: string;
        summary: string;
        tag?: string;
        url?: string;
    }[];
    [key: string]: unknown;
}

interface AIResponseUI {
    uiType: UIType;
    mood: Mood;
    data: AIResponseData;
}

/* ══════════════════════════════════════════════════════════
   VOGUE / CYBER-MINIMAL CARD COMPONENTS
   No borders. Extreme glassmorphism. Oversized type.
   ══════════════════════════════════════════════════════════ */

/* ── Schedule ──────────────────────────────────────────── */
function FloatingSchedule({ data }: { data: AIResponseData }) {
    const events = data.events || [];
    return (
        <>
            <div className="mb-1 flex items-end gap-3">
                <Calendar size={11} className="mb-1" style={{ color: "var(--vibe-primary)" }} />
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--vibe-text-muted)" }}>
                    Schedule
                </span>
            </div>
            <h3 className="text-3xl font-extralight tracking-tight leading-none mb-4 sm:text-4xl" style={{ color: "var(--vibe-text)" }}>
                {data.title}
            </h3>
            <div className="space-y-3">
                {events.slice(0, 3).map((e, i) => (
                    <div key={i} className="flex items-baseline gap-3">
                        <span className="text-[10px] tabular-nums w-14 shrink-0" style={{ color: "var(--vibe-text-muted)" }}>
                            {e.time}
                        </span>
                        <div className="flex-1">
                            <p className="text-sm font-light" style={{ color: "var(--vibe-text)" }}>{e.title}</p>
                            <p className="text-[9px]" style={{ color: "var(--vibe-text-muted)" }}>{e.location}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

/* ── Approval (sync-rate gated) ─────────────────────────── */
function FloatingApproval({ data }: { data: AIResponseData }) {
    const syncRate = usePetStore((s) => s.syncRate);

    /* ── syncRate >= 80 → absolute trust → auto-executed ── */
    if (syncRate >= 80) {
        return (
            <>
                <div className="mb-1 flex items-center gap-2">
                    <CheckCircle size={10} className="text-emerald-400/60" />
                    <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-400/40">
                        Auto-Executed
                    </span>
                </div>
                <h3 className="text-3xl font-extralight tracking-tight leading-none mb-2 sm:text-4xl" style={{ color: "var(--vibe-text)" }}>
                    {data.title}
                </h3>
                <p className="text-xs font-light mb-3 leading-relaxed" style={{ color: "var(--vibe-text-muted)" }}>
                    {data.description}
                </p>
                <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2 w-fit"
                    style={{
                        background: "rgba(16,185,129,0.06)",
                        border: "1px solid rgba(16,185,129,0.12)",
                    }}
                >
                    <CheckCircle size={12} className="text-emerald-400/70" />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-emerald-400/60">
                        Executed · Trusted
                    </span>
                </div>
            </>
        );
    }

    /* ── syncRate < 50 → low trust → forced slide-to-approve ── */
    if (syncRate < 50) {
        return (
            <>
                <div className="mb-1 flex items-center gap-2">
                    <Sparkles size={10} className="text-amber-400/50" />
                    <span className="text-[9px] uppercase tracking-[0.2em] text-amber-400/40">
                        Requires Approval
                    </span>
                </div>
                <h3 className="text-3xl font-extralight tracking-tight leading-none mb-2 sm:text-4xl" style={{ color: "var(--vibe-text)" }}>
                    {data.title}
                </h3>
                <p className="text-xs font-light mb-4 leading-relaxed" style={{ color: "var(--vibe-text-muted)" }}>
                    {data.description}
                </p>
                <div className="scale-90 origin-left">
                    <SlideToApprove
                        onApprove={() => console.log(`Approved: ${data.title}`)}
                    />
                </div>
            </>
        );
    }

    /* ── 50 ≤ syncRate < 80 → moderate trust → normal approval ── */
    return (
        <>
            <div className="mb-1 flex items-center gap-2">
                <Sparkles size={10} style={{ color: "var(--vibe-primary)" }} />
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--vibe-text-muted)" }}>
                    Approval
                </span>
            </div>
            <h3 className="text-3xl font-extralight tracking-tight leading-none mb-2 sm:text-4xl" style={{ color: "var(--vibe-text)" }}>
                {data.title}
            </h3>
            <p className="text-xs font-light mb-4 leading-relaxed" style={{ color: "var(--vibe-text-muted)" }}>
                {data.description}
            </p>
            <div className="scale-90 origin-left">
                <SlideToApprove
                    onApprove={() => console.log(`Approved: ${data.title}`)}
                />
            </div>
        </>
    );
}

/* ── Weather Vibe ──────────────────────────────────────── */
function FloatingWeather({ data }: { data: AIResponseData }) {
    return (
        <>
            <div className="mb-1">
                <Cloud size={11} style={{ color: "var(--vibe-primary)" }} />
            </div>
            <div className="flex items-end gap-3 mb-2">
                <span className="text-5xl font-thin tabular-nums leading-none sm:text-6xl" style={{ color: "var(--vibe-text)" }}>
                    {data.temperature}
                </span>
                <span className="text-[10px] mb-1" style={{ color: "var(--vibe-text-muted)" }}>{data.condition}</span>
            </div>
            <p className="text-xs font-light leading-relaxed max-w-[200px]" style={{ color: "var(--vibe-text-muted)" }}>
                {data.description}
            </p>
        </>
    );
}

/* ── Text Message ──────────────────────────────────────── */
function FloatingText({ data }: { data: AIResponseData }) {
    return (
        <>
            <div className="mb-2">
                <MessageSquare size={10} style={{ color: "var(--vibe-text-muted)" }} />
            </div>
            <h3 className="text-2xl font-extralight tracking-tight leading-tight mb-3 sm:text-3xl" style={{ color: "var(--vibe-text)" }}>
                {data.title}
            </h3>
            <p className="text-xs font-light leading-relaxed" style={{ color: "var(--vibe-text-muted)" }}>
                {data.message || data.description}
            </p>
        </>
    );
}

/* ── Chart ─────────────────────────────────────────────── */
function FloatingChart({ data }: { data: AIResponseData }) {
    const chartData = data.chartData || [];
    const maxVal = Math.max(...chartData.map((d) => d.value), 1);
    const isLine = data.chartType === "line";
    const defaultColors = ["#7c3aed", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"];

    return (
        <>
            <div className="mb-1 flex items-center gap-2">
                <BarChart3 size={10} style={{ color: "var(--vibe-primary)" }} />
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--vibe-text-muted)" }}>
                    {data.unit || "Data"}
                </span>
            </div>
            <h3 className="text-3xl font-extralight tracking-tight leading-none mb-4 sm:text-4xl" style={{ color: "var(--vibe-text)" }}>
                {data.title}
            </h3>

            {isLine ? (
                <div className="h-20">
                    <svg
                        viewBox="0 0 100 50"
                        preserveAspectRatio="none"
                        className="h-full w-full"
                    >
                        <defs>
                            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {(() => {
                            const pts = chartData.map((d, i) => {
                                const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                                const y = 48 - (d.value / maxVal) * 40;
                                return `${x},${y}`;
                            });
                            return (
                                <>
                                    <polygon
                                        points={`0,50 ${pts.join(" ")} 100,50`}
                                        fill="url(#areaFill)"
                                    />
                                    <polyline
                                        points={pts.join(" ")}
                                        fill="none"
                                        stroke="#06b6d4"
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                    />
                                </>
                            );
                        })()}
                    </svg>
                </div>
            ) : (
                <div className="flex items-end gap-1 h-16">
                    {chartData.map((d, i) => {
                        const pct = (d.value / maxVal) * 100;
                        return (
                            <motion.div
                                key={i}
                                className="flex-1 rounded-sm"
                                style={{
                                    background:
                                        d.color || defaultColors[i % defaultColors.length],
                                    opacity: 0.7,
                                }}
                                initial={{ height: 0 }}
                                animate={{ height: `${pct}%` }}
                                transition={{ delay: i * 0.06, duration: 0.6, ease: "backOut" }}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
}

/* ── Table ─────────────────────────────────────────────── */
function FloatingTable({ data }: { data: AIResponseData }) {
    const columns = data.columns || [];
    const rows = data.rows || [];

    return (
        <>
            <div className="mb-1 flex items-center gap-2">
                <Table2 size={10} style={{ color: "var(--vibe-primary)" }} />
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--vibe-text-muted)" }}>
                    Data
                </span>
            </div>
            <h3 className="text-2xl font-extralight tracking-tight leading-none mb-3 sm:text-3xl" style={{ color: "var(--vibe-text)" }}>
                {data.title}
            </h3>

            <div className="overflow-hidden -mx-1">
                <table className="w-full">
                    <thead>
                        <tr>
                            {columns.map((c, i) => (
                                <th
                                    key={i}
                                    className="px-1 pb-1.5 text-left text-[8px] uppercase tracking-[0.15em] font-normal"
                                    style={{ color: "var(--vibe-text-muted)" }}
                                >
                                    {c}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.slice(0, 4).map((row, ri) => (
                            <tr key={ri}>
                                {row.map((cell, ci) => {
                                    const pos = cell.startsWith("+") || cell.startsWith("↑");
                                    const neg = cell.startsWith("-") || cell.startsWith("↓");
                                    return (
                                        <td key={ci} className="px-1 py-1">
                                            <span
                                                className="flex items-center gap-0.5 text-[10px]"
                                                style={{
                                                    color: pos
                                                        ? "rgba(34,197,94,0.7)"
                                                        : neg
                                                            ? "rgba(239,68,68,0.7)"
                                                            : ci === 0
                                                                ? "var(--vibe-text)"
                                                                : "var(--vibe-text-muted)",
                                                    fontVariantNumeric: "tabular-nums",
                                                }}
                                            >
                                                {pos && <TrendingUp size={8} />}
                                                {neg && <TrendingDown size={8} />}
                                                {cell}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

/* ── News ──────────────────────────────────────────────── */
function FloatingNews({ data }: { data: AIResponseData }) {
    const articles = data.articles || [];
    const tagColor: Record<string, string> = {
        tech: "#7c3aed",
        finance: "#f59e0b",
        science: "#06b6d4",
        culture: "#ec4899",
        world: "#10b981",
    };

    return (
        <>
            <div className="mb-1 flex items-center gap-2">
                <Newspaper size={10} style={{ color: "var(--vibe-primary)" }} />
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--vibe-text-muted)" }}>
                    Digest
                </span>
            </div>
            <h3 className="text-2xl font-extralight tracking-tight leading-none mb-4 sm:text-3xl" style={{ color: "var(--vibe-text)" }}>
                {data.title}
            </h3>
            <div className="space-y-3">
                {articles.slice(0, 3).map((a, i) => (
                    <div key={i}>
                        <p className="text-xs font-light leading-snug mb-0.5" style={{ color: "var(--vibe-text)" }}>
                            {a.headline}
                        </p>
                        <div className="flex items-center gap-1.5">
                            {a.tag && (
                                <span
                                    className="text-[8px] uppercase tracking-wider"
                                    style={{ color: tagColor[a.tag.toLowerCase()] || "#71717a" }}
                                >
                                    {a.tag}
                                </span>
                            )}
                            <span className="text-[8px]" style={{ color: "var(--vibe-text-muted)" }}>{a.source}</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════════════════
   ORBIT CARD — Floating, breathing, draggable shell
   ══════════════════════════════════════════════════════════ */
function OrbitCard({
    response,
    index,
    onExpand,
}: {
    response: AIResponseUI;
    index: number;
    onExpand: () => void;
}) {
    /* Unique float parameters so cards breathe out of sync */
    const float = useMemo(() => {
        const seed = index * 1337;
        return {
            yRange: 10 + (seed % 12),             // 10–22px drift
            duration: 4 + (seed % 5),              // 4–9s period
            delay: (seed % 3000) / 1000,           // 0–3s offset
            rotateRange: 0.5 + ((seed % 10) / 10), // 0.5–1.5° tilt
        };
    }, [index]);

    const { uiType, data } = response;

    const inner = (() => {
        switch (uiType) {
            case "schedule_card":
                return <FloatingSchedule data={data} />;
            case "approval_card":
                return <FloatingApproval data={data} />;
            case "weather_vibe":
                return <FloatingWeather data={data} />;
            case "text_message":
                return <FloatingText data={data} />;
            case "chart_card":
                return <FloatingChart data={data} />;
            case "data_table":
                return <FloatingTable data={data} />;
            case "news_summary":
                return <FloatingNews data={data} />;
            default:
                return <FloatingText data={data} />;
        }
    })();

    /* Drag hint: subtle glow on drag */
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const glowOpacity = useTransform(
        [x, y],
        ([latestX, latestY]: number[]) =>
            Math.min(0.15, (Math.abs(latestX) + Math.abs(latestY)) / 800)
    );

    return (
        <motion.div
            drag
            dragConstraints={{ top: -200, bottom: 200, left: -200, right: 200 }}
            dragElastic={0.2}
            dragMomentum
            dragTransition={{ bounceStiffness: 200, bounceDamping: 20 }}
            style={{ x, y }}
            /* Breathing float animation */
            animate={{
                translateY: [0, -float.yRange, 0],
                rotate: [0, float.rotateRange, 0, -float.rotateRange, 0],
            }}
            transition={{
                translateY: {
                    duration: float.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: float.delay,
                },
                rotate: {
                    duration: float.duration * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: float.delay,
                },
            }}
            /* Entrance */
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            /* Hover lift */
            whileHover={{
                scale: 1.03,
                transition: { duration: 0.3, ease: "easeOut" },
            }}
            whileTap={{ scale: 0.97 }}
            onDoubleClick={onExpand}
            className="cursor-grab active:cursor-grabbing select-none touch-none"
        >
            <motion.div
                className="relative px-5 py-5 sm:px-6 sm:py-6 vibe-transition"
                style={{
                    background: "var(--vibe-surface)",
                    border: `var(--vibe-border-w) solid var(--vibe-surface-border)`,
                    borderRadius: "var(--vibe-radius-lg)",
                    backdropFilter: `blur(var(--vibe-blur))`,
                    WebkitBackdropFilter: `blur(var(--vibe-blur))`,
                    boxShadow: `
            0 8px 40px rgba(0,0,0,0.3),
            0 0 80px var(--vibe-glow)
          `,
                }}
            >
                {/* Top edge accent */}
                <div
                    className="absolute inset-x-0 top-0 h-[0.5px]"
                    style={{
                        borderRadius: "var(--vibe-radius-lg)",
                        background:
                            `linear-gradient(90deg, transparent 10%, var(--vibe-primary) 50%, transparent 90%)`,
                        opacity: 0.25,
                    }}
                />

                {inner}

                {/* Expand hint */}
                <div className="absolute bottom-2 right-3">
                    <span className="text-[8px] uppercase tracking-wider" style={{ color: "var(--vibe-text-muted)" }}>
                        double-tap
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════
   EXPANDED OVERLAY — Full detail view
   ══════════════════════════════════════════════════════════ */
function ExpandedOverlay({
    response,
    onClose,
}: {
    response: AIResponseUI;
    onClose: () => void;
}) {
    const { uiType, data } = response;

    const inner = (() => {
        switch (uiType) {
            case "schedule_card":
                return <FloatingSchedule data={data} />;
            case "approval_card":
                return <FloatingApproval data={data} />;
            case "weather_vibe":
                return <FloatingWeather data={data} />;
            case "text_message":
                return <FloatingText data={data} />;
            case "chart_card":
                return <FloatingChart data={data} />;
            case "data_table":
                return <FloatingTable data={data} />;
            case "news_summary":
                return <FloatingNews data={data} />;
            default:
                return <FloatingText data={data} />;
        }
    })();

    return (
        <motion.div
            key="expanded-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-8"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.85, y: 30, filter: "blur(8px)" }}
                animate={{ scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ scale: 0.85, y: 30, filter: "blur(8px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="relative max-w-md w-full px-8 py-8 sm:px-10 sm:py-10 max-h-[80vh] overflow-y-auto vibe-transition"
                style={{
                    background: "var(--vibe-bg)",
                    borderRadius: "var(--vibe-radius-lg)",
                    border: `var(--vibe-border-w) solid var(--vibe-surface-border)`,
                    backdropFilter: `blur(var(--vibe-blur-heavy))`,
                    boxShadow:
                        `0 32px 100px rgba(0,0,0,0.6), 0 0 60px var(--vibe-glow)`,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[9px] uppercase tracking-wider transition-colors"
                    style={{ color: "var(--vibe-text-muted)" }}
                >
                    Close
                </button>

                {inner}
            </motion.div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════
   PUBLIC EXPORTS
   ══════════════════════════════════════════════════════════ */
export { OrbitCard, ExpandedOverlay };
export type { AIResponseUI, Mood };
