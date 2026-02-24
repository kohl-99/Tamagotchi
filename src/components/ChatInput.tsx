"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

export function ChatInput({
    onSend,
    isLoading,
}: {
    onSend: (message: string) => void;
    isLoading: boolean;
}) {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const theme = useThemeStore((s) => s.currentTheme);

    const handleSubmit = useCallback(() => {
        const trimmed = value.trim();
        if (!trimmed || isLoading) return;
        onSend(trimmed);
        setValue("");
    }, [value, isLoading, onSend]);

    // Focus on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative flex items-center gap-3 px-5 py-3 vibe-transition"
            style={{
                background: theme.colors.surface,
                border: `${theme.geometry.borderWidth} solid ${theme.colors.surfaceBorder}`,
                borderRadius: "9999px",
                backdropFilter: `blur(${theme.effects.blur})`,
                WebkitBackdropFilter: `blur(${theme.effects.blur})`,
                boxShadow: isLoading
                    ? `0 0 30px ${theme.colors.glow}, 0 4px 20px rgba(0,0,0,0.3)`
                    : "0 4px 24px rgba(0,0,0,0.25)",
            }}
        >
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={isLoading}
                placeholder={
                    isLoading ? "Lux is thinking..." : "Ask your cyber-soul anything..."
                }
                className="flex-1 bg-transparent text-sm placeholder-current/30
                   outline-none disabled:opacity-40 font-light tracking-wide"
                style={{ color: "var(--vibe-text)" }}
            />

            <motion.button
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                   outline-none transition-all duration-300 disabled:opacity-15"
                style={{
                    background: value.trim()
                        ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primarySoft})`
                        : theme.colors.surface,
                }}
            >
                <ArrowUp size={14} style={{ color: "var(--vibe-text)" }} />
            </motion.button>
        </motion.div>
    );
}
