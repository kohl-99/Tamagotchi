"use client";

import { useEffect, useRef } from "react";
import { useThemeStore } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   THEME PROVIDER — CSS Variable Injection Engine

   Watches the Zustand store and injects all ThemeVibe tokens
   as CSS custom properties on <html>. This makes them available
   to Tailwind @theme variables and all inline styles.

   All visual transitions happen via CSS transition on the
   root element — silky smooth, zero flicker.
   ══════════════════════════════════════════════════════════ */

const FONT_MAP: Record<string, string> = {
    sans: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    serif: "var(--font-playfair), 'Playfair Display', ui-serif, Georgia, serif",
    mono: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useThemeStore((s) => s.currentTheme);
    const rootRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const root = document.documentElement;
        rootRef.current = root;

        /* ── Global palette ──────────────────────────────── */
        root.style.setProperty("--vibe-bg", theme.colors.background);
        root.style.setProperty("--vibe-surface", theme.colors.surface);
        root.style.setProperty("--vibe-surface-border", theme.colors.surfaceBorder);
        root.style.setProperty("--vibe-primary", theme.colors.primary);
        root.style.setProperty("--vibe-primary-soft", theme.colors.primarySoft);
        root.style.setProperty("--vibe-text", theme.colors.textMain);
        root.style.setProperty("--vibe-text-muted", theme.colors.textMuted);
        root.style.setProperty("--vibe-glow", theme.colors.glow);

        /* ── Geometry ─────────────────────────────────────── */
        root.style.setProperty("--vibe-radius", theme.geometry.radius);
        root.style.setProperty("--vibe-radius-lg", theme.geometry.radiusLg);
        root.style.setProperty("--vibe-border-w", theme.geometry.borderWidth);

        /* ── Typography ───────────────────────────────────── */
        root.style.setProperty(
            "--vibe-font",
            FONT_MAP[theme.typography.fontFamily] ?? FONT_MAP.sans
        );

        /* ── Effects ──────────────────────────────────────── */
        root.style.setProperty("--vibe-blur", theme.effects.blur);
        root.style.setProperty("--vibe-blur-heavy", theme.effects.blurHeavy);

        /* ── Ambient glow ─────────────────────────────────── */
        root.style.setProperty("--vibe-glow1", theme.ambient.glow1);
        root.style.setProperty("--vibe-glow2", theme.ambient.glow2);
        root.style.setProperty("--vibe-glow3", theme.ambient.glow3);

        /* ── Apply bg/text directly to body for instant feel */
        root.style.setProperty("background", theme.colors.background);
        root.style.setProperty("color", theme.colors.textMain);
        root.style.setProperty("font-family", FONT_MAP[theme.typography.fontFamily] ?? FONT_MAP.sans);

    }, [theme]);

    return <>{children}</>;
}
