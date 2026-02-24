"use client";

import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    MapPin,
    Cloud,
    Thermometer,
    Sparkles,
    MessageSquare,
    BarChart3,
    Table2,
    Newspaper,
    TrendingUp,
    TrendingDown,
    ExternalLink,
} from "lucide-react";
import { SlideToApprove } from "@/components/SlideToApprove";

/* ── Shared types (mirrors API) ────────────────────────── */
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
    articles?: { headline: string; source: string; summary: string; tag?: string; url?: string }[];
    [key: string]: unknown;
}

export interface AIResponseUI {
    uiType: UIType;
    mood: Mood;
    data: AIResponseData;
}

/* ── Schedule Card ─────────────────────────────────────── */
function ScheduleCardUI({ data }: { data: AIResponseData }) {
    const events = data.events || [];
    const colors = ["#7c3aed", "#06b6d4", "#f59e0b", "#10b981"];

    return (
        <div
            className="relative overflow-hidden rounded-2xl border p-5"
            style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 32px rgba(124,58,237,0.06), 0 1px 4px rgba(0,0,0,0.2)",
            }}
        >
            <div
                className="absolute inset-x-0 top-0 h-[1px]"
                style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)" }}
            />
            <div className="mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-violet-400" />
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                    {data.title || "Schedule"}
                </span>
            </div>
            {data.description && (
                <p className="mb-4 text-sm leading-relaxed text-white/50">{data.description}</p>
            )}
            <div className="space-y-3">
                {events.map((event, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="flex w-16 shrink-0 items-center gap-1.5">
                            <Clock size={10} className="text-white/30" />
                            <span className="text-xs tabular-nums text-white/50">{event.time}</span>
                        </div>
                        <div className="flex gap-2.5">
                            <div className="mt-0.5 h-8 w-[2px] shrink-0 rounded-full" style={{ background: colors[i % colors.length] }} />
                            <div>
                                <p className="text-sm font-medium text-white/80">{event.title}</p>
                                <div className="mt-0.5 flex items-center gap-1">
                                    <MapPin size={9} className="text-white/25" />
                                    <span className="text-[11px] text-white/30">{event.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Approval Card ─────────────────────────────────────── */
function ApprovalCardUI({ data }: { data: AIResponseData }) {
    return (
        <div
            className="overflow-hidden rounded-2xl border p-5"
            style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.04))",
                borderColor: "rgba(124,58,237,0.15)",
                boxShadow: "0 4px 32px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
        >
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: "rgba(124,58,237,0.2)" }}>
                    <Sparkles size={12} className="text-violet-400" />
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-violet-400/70">Requires Approval</span>
            </div>
            <p className="mb-1 text-sm font-medium text-white/80">{data.title}</p>
            <p className="mb-1 text-xs text-white/40">{data.description}</p>
            {data.action && <p className="mb-4 text-xs italic text-white/25">Action: {data.action}</p>}
            <div className="flex justify-center">
                <SlideToApprove onApprove={() => console.log(`Approved: ${data.title}`)} />
            </div>
        </div>
    );
}

/* ── Weather Vibe Card ─────────────────────────────────── */
function WeatherVibeUI({ data }: { data: AIResponseData }) {
    return (
        <div
            className="overflow-hidden rounded-2xl border p-5"
            style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.06), rgba(124,58,237,0.04))",
                borderColor: "rgba(6,182,212,0.12)",
                boxShadow: "0 4px 32px rgba(6,182,212,0.06), 0 1px 4px rgba(0,0,0,0.2)",
            }}
        >
            <div className="mb-4 flex items-center gap-2">
                <Cloud size={14} className="text-cyan-400" />
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">{data.title}</span>
            </div>
            <div className="mb-3 flex items-center gap-4">
                {data.temperature && (
                    <div className="flex items-center gap-1.5">
                        <Thermometer size={16} className="text-cyan-400/60" />
                        <span className="text-2xl font-light tabular-nums text-white/80">{data.temperature}</span>
                    </div>
                )}
                {data.condition && <span className="text-sm text-white/40">{data.condition}</span>}
            </div>
            <p className="text-sm leading-relaxed text-white/50">{data.description}</p>
        </div>
    );
}

/* ── Text Message Card ─────────────────────────────────── */
function TextMessageUI({ data }: { data: AIResponseData }) {
    return (
        <div
            className="overflow-hidden rounded-2xl border p-5"
            style={{
                background: "rgba(255,255,255,0.025)",
                borderColor: "rgba(255,255,255,0.06)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
            }}
        >
            <div className="mb-3 flex items-center gap-2">
                <MessageSquare size={14} className="text-violet-400/60" />
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">{data.title}</span>
            </div>
            <p className="text-sm leading-relaxed text-white/70">{data.message || data.description}</p>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   NEW UI TYPES
   ══════════════════════════════════════════════════════════ */

/* ── Chart Card ────────────────────────────────────────── */
function ChartCardUI({ data }: { data: AIResponseData }) {
    const chartData = data.chartData || [];
    const maxValue = Math.max(...chartData.map((d) => d.value), 1);
    const defaultColors = ["#7c3aed", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"];
    const isLine = data.chartType === "line";

    // Build SVG line path
    const linePoints = chartData.map((d, i) => {
        const x = (i / Math.max(chartData.length - 1, 1)) * 100;
        const y = 100 - (d.value / maxValue) * 80 - 10;
        return `${x},${y}`;
    });
    const linePath = linePoints.join(" ");

    return (
        <div
            className="relative overflow-hidden rounded-2xl border p-5"
            style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 32px rgba(124,58,237,0.06), 0 1px 4px rgba(0,0,0,0.2)",
            }}
        >
            <div
                className="absolute inset-x-0 top-0 h-[1px]"
                style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)" }}
            />

            <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-cyan-400" />
                    <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                        {data.title || "Chart"}
                    </span>
                </div>
                {data.unit && (
                    <span className="text-[10px] text-white/25">{data.unit}</span>
                )}
            </div>

            {data.description && (
                <p className="mb-4 text-xs leading-relaxed text-white/40">{data.description}</p>
            )}

            {isLine ? (
                /* ── Line Chart ─────────────────────────────────── */
                <div className="relative h-36">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                        {/* Grid lines */}
                        {[0.25, 0.5, 0.75].map((r) => (
                            <line key={r} x1="0" y1={`${100 - r * 80 - 10}`} x2="100" y2={`${100 - r * 80 - 10}`}
                                stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                        ))}
                        {/* Area fill */}
                        <polygon
                            points={`0,100 ${linePath} 100,100`}
                            fill="url(#chartGradient)"
                            opacity="0.3"
                        />
                        {/* Line */}
                        <polyline
                            points={linePath}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Dots */}
                        {chartData.map((d, i) => {
                            const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                            const y = 100 - (d.value / maxValue) * 80 - 10;
                            return (
                                <circle key={i} cx={x} cy={y} r="2" fill={d.color || "#06b6d4"}
                                    stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
                            );
                        })}
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* X-axis labels */}
                    <div className="mt-1 flex justify-between px-0.5">
                        {chartData.map((d, i) => (
                            <span key={i} className="text-[9px] text-white/25">{d.label}</span>
                        ))}
                    </div>
                </div>
            ) : (
                /* ── Bar Chart ──────────────────────────────────── */
                <div className="space-y-2.5">
                    {chartData.map((d, i) => {
                        const pct = (d.value / maxValue) * 100;
                        const color = d.color || defaultColors[i % defaultColors.length];
                        return (
                            <div key={i}>
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs text-white/60">{d.label}</span>
                                    <span className="text-xs tabular-nums text-white/40">{d.value}{data.unit ? ` ${data.unit}` : ""}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ── Data Table ────────────────────────────────────────── */
function DataTableUI({ data }: { data: AIResponseData }) {
    const columns = data.columns || [];
    const rows = data.rows || [];

    return (
        <div
            className="overflow-hidden rounded-2xl border"
            style={{
                background: "rgba(255,255,255,0.025)",
                borderColor: "rgba(255,255,255,0.08)",
                boxShadow: "0 4px 32px rgba(124,58,237,0.04), 0 1px 4px rgba(0,0,0,0.2)",
            }}
        >
            {/* Header */}
            <div className="border-b px-5 pt-4 pb-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                    <Table2 size={14} className="text-violet-400" />
                    <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                        {data.title || "Data"}
                    </span>
                </div>
                {data.description && (
                    <p className="mt-1 text-xs text-white/30">{data.description}</p>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className="px-5 py-2.5 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, ri) => (
                            <motion.tr
                                key={ri}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: ri * 0.06 }}
                                className="group transition-colors"
                                style={{
                                    borderBottom: ri < rows.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.04)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                }}
                            >
                                {row.map((cell, ci) => {
                                    // Detect trend indicators
                                    const isPositive = cell.startsWith("+") || cell.startsWith("↑");
                                    const isNegative = cell.startsWith("-") || cell.startsWith("↓");

                                    return (
                                        <td key={ci} className="px-5 py-2.5">
                                            <span
                                                className="flex items-center gap-1 text-xs"
                                                style={{
                                                    color: isPositive
                                                        ? "rgba(34,197,94,0.8)"
                                                        : isNegative
                                                            ? "rgba(239,68,68,0.8)"
                                                            : ci === 0
                                                                ? "rgba(255,255,255,0.7)"
                                                                : "rgba(255,255,255,0.45)",
                                                    fontVariantNumeric: "tabular-nums",
                                                }}
                                            >
                                                {isPositive && <TrendingUp size={10} />}
                                                {isNegative && <TrendingDown size={10} />}
                                                {cell}
                                            </span>
                                        </td>
                                    );
                                })}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ── News Summary Card ─────────────────────────────────── */
function NewsSummaryUI({ data }: { data: AIResponseData }) {
    const articles = data.articles || [];
    const tagColors: Record<string, string> = {
        tech: "#7c3aed",
        finance: "#f59e0b",
        science: "#06b6d4",
        culture: "#ec4899",
        world: "#10b981",
    };

    return (
        <div
            className="overflow-hidden rounded-2xl border"
            style={{
                background: "rgba(255,255,255,0.025)",
                borderColor: "rgba(255,255,255,0.06)",
                boxShadow: "0 4px 32px rgba(124,58,237,0.04), 0 1px 4px rgba(0,0,0,0.2)",
            }}
        >
            {/* Header */}
            <div className="border-b px-5 pt-4 pb-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                    <Newspaper size={14} className="text-violet-400" />
                    <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                        {data.title || "News Digest"}
                    </span>
                </div>
                {data.description && (
                    <p className="mt-1 text-xs text-white/30">{data.description}</p>
                )}
            </div>

            {/* Articles */}
            <div>
                {articles.map((article, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="border-b px-5 py-4 transition-colors"
                        style={{
                            borderColor: i < articles.length - 1 ? "rgba(255,255,255,0.04)" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.03)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                    >
                        <div className="mb-1.5 flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium leading-snug text-white/80">
                                {article.headline}
                            </h4>
                            {article.url && (
                                <ExternalLink size={12} className="mt-0.5 shrink-0 text-white/20" />
                            )}
                        </div>

                        <p className="mb-2 text-xs leading-relaxed text-white/40">
                            {article.summary}
                        </p>

                        <div className="flex items-center gap-2">
                            {article.tag && (
                                <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                                    style={{
                                        background: `${tagColors[article.tag.toLowerCase()] || "#71717a"}15`,
                                        color: tagColors[article.tag.toLowerCase()] || "#71717a",
                                        border: `1px solid ${tagColors[article.tag.toLowerCase()] || "#71717a"}25`,
                                    }}
                                >
                                    {article.tag}
                                </span>
                            )}
                            <span className="text-[10px] text-white/20">{article.source}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

/* ── Icon map for compact mode ─────────────────────────── */
const ICON_MAP: Record<string, typeof Calendar> = {
    schedule_card: Calendar,
    approval_card: Sparkles,
    weather_vibe: Cloud,
    text_message: MessageSquare,
    chart_card: BarChart3,
    data_table: Table2,
    news_summary: Newspaper,
};

const ACCENT_MAP: Record<string, string> = {
    schedule_card: "#7c3aed",
    approval_card: "#a78bfa",
    weather_vibe: "#06b6d4",
    text_message: "#71717a",
    chart_card: "#06b6d4",
    data_table: "#7c3aed",
    news_summary: "#7c3aed",
};

/* ── Compact preview for grid cells ────────────────────── */
function CompactPreview({ response }: { response: AIResponseUI }) {
    const { uiType, data } = response;
    const Icon = ICON_MAP[uiType] || MessageSquare;
    const accent = ACCENT_MAP[uiType] || "#7c3aed";

    // Build a short preview based on type
    const preview = (() => {
        switch (uiType) {
            case "schedule_card": {
                const events = data.events || [];
                return events.slice(0, 2).map((e) => `${e.time} — ${e.title}`).join("\n");
            }
            case "chart_card": {
                const chartData = data.chartData || [];
                const max = chartData.reduce((m, d) => (d.value > m.value ? d : m), chartData[0]);
                return max ? `Peak: ${max.label} (${max.value}${data.unit ? ` ${data.unit}` : ""})` : "";
            }
            case "data_table": {
                const rows = data.rows || [];
                return `${rows.length} rows · ${(data.columns || []).length} columns`;
            }
            case "news_summary": {
                const articles = data.articles || [];
                return articles.slice(0, 2).map((a) => a.headline).join("\n");
            }
            case "approval_card":
                return data.action || data.description || "";
            case "weather_vibe":
                return `${data.temperature || ""} ${data.condition || ""}`.trim();
            default:
                return data.message || data.description || "";
        }
    })();

    return (
        <div className="flex h-full flex-col justify-between p-4">
            {/* Header */}
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${accent}18` }}
                    >
                        <Icon size={12} style={{ color: accent }} />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/35 truncate">
                        {data.title || uiType.replace("_", " ")}
                    </span>
                </div>

                {/* Description */}
                {data.description && (
                    <p className="text-xs leading-relaxed text-white/50 line-clamp-2 mb-2">
                        {data.description}
                    </p>
                )}
            </div>

            {/* Preview content */}
            <div className="mt-auto">
                {uiType === "chart_card" && data.chartData ? (
                    /* Mini bar sparkline */
                    <div className="flex items-end gap-[3px] h-8">
                        {(data.chartData || []).map((d, i) => {
                            const max = Math.max(...(data.chartData || []).map((x) => x.value), 1);
                            const pct = (d.value / max) * 100;
                            return (
                                <motion.div
                                    key={i}
                                    className="flex-1 rounded-sm"
                                    style={{ background: d.color || accent }}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${pct}%` }}
                                    transition={{ delay: i * 0.05, duration: 0.4 }}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-[11px] leading-relaxed text-white/30 line-clamp-2 whitespace-pre-line">
                        {preview}
                    </p>
                )}
            </div>

            {/* Expand hint */}
            <div className="mt-2 flex justify-end">
                <span className="text-[9px] uppercase tracking-wider text-white/15">
                    tap to expand
                </span>
            </div>
        </div>
    );
}

/* ── Main Renderer ─────────────────────────────────────── */
export function GenerativeUIRenderer({
    response,
    compact = false,
}: {
    response: AIResponseUI;
    compact?: boolean;
}) {
    if (compact) {
        return <CompactPreview response={response} />;
    }

    const { uiType, data } = response;

    const content = (() => {
        switch (uiType) {
            case "schedule_card":
                return <ScheduleCardUI data={data} />;
            case "approval_card":
                return <ApprovalCardUI data={data} />;
            case "weather_vibe":
                return <WeatherVibeUI data={data} />;
            case "text_message":
                return <TextMessageUI data={data} />;
            case "chart_card":
                return <ChartCardUI data={data} />;
            case "data_table":
                return <DataTableUI data={data} />;
            case "news_summary":
                return <NewsSummaryUI data={data} />;
            default:
                return <TextMessageUI data={data} />;
        }
    })();

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            {content}
        </motion.div>
    );
}
