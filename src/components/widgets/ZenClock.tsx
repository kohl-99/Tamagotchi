"use client";

import { useState, useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   枯山水时钟 — ZEN CLOCK
   No dial, no hands. Just two stark lines of time.
   Glassmorphism shell, full theme-engine integration.
   ══════════════════════════════════════════════════════════ */

function pad(n: number) {
    return String(n).padStart(2, "0");
}

export function ZenClock() {
    const theme = useThemeStore((s) => s.currentTheme);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const weekday = now.toLocaleDateString("zh-CN", { weekday: "long" });
    const dateStr = now.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });

    return (
        <div
            className="vibe-transition"
            style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: `1px solid ${theme.colors.primary}18`,
                borderRadius: theme.geometry.radius,
                padding: "18px 24px 14px",
                minWidth: "160px",
            }}
        >
            {/* Hours : Minutes */}
            <div className="flex items-end gap-1 leading-none">
                <span
                    className="font-extralight tabular-nums"
                    style={{ fontSize: "52px", color: theme.colors.primary, letterSpacing: "-0.03em" }}
                >
                    {hh}
                </span>
                <span
                    className="font-thin mb-1"
                    style={{ fontSize: "32px", color: `${theme.colors.primary}55`, lineHeight: 1 }}
                >
                    :
                </span>
                <span
                    className="font-extralight tabular-nums"
                    style={{ fontSize: "52px", color: theme.colors.primary, letterSpacing: "-0.03em" }}
                >
                    {mm}
                </span>
            </div>

            {/* Seconds bar */}
            <div className="mt-2 flex items-center gap-2">
                <div
                    className="h-px flex-1"
                    style={{ background: `${theme.colors.primary}20` }}
                />
                <span
                    className="font-light tabular-nums text-[11px] tracking-widest"
                    style={{ color: `${theme.colors.primary}50` }}
                >
                    {ss}
                </span>
            </div>

            {/* Date / weekday */}
            <div className="mt-2 flex items-center justify-between">
                <span
                    className="text-[9px] font-light tracking-[0.25em] uppercase"
                    style={{ color: `${theme.colors.primary}40` }}
                >
                    {weekday}
                </span>
                <span
                    className="text-[9px] font-light tabular-nums"
                    style={{ color: `${theme.colors.primary}30` }}
                >
                    {dateStr}
                </span>
            </div>
        </div>
    );
}
