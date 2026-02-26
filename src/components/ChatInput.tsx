"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { usePetStore } from "@/store/usePetStore";

export function ChatInput({
    onSend,
    isLoading,
}: {
    onSend: (message: string, isCloneMode: boolean) => void;
    isLoading: boolean;
}) {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const theme = useThemeStore((s) => s.currentTheme);
    const isTraveling = usePetStore((s) => s.isTraveling);

    const handleSubmit = useCallback(() => {
        const trimmed = value.trim();
        if (!trimmed || isLoading) return;
        onSend(trimmed, isTraveling);
        setValue("");
    }, [value, isLoading, onSend, isTraveling]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex flex-col gap-2">
            {/* ── Clone mode badge ─────────────────────────────── */}
            <AnimatePresence>
                {isTraveling && (
                    <motion.div
                        key="clone-badge"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-center gap-2"
                    >
                        <motion.div
                            className="h-1 w-1 rounded-full shrink-0"
                            style={{ background: theme.colors.primary }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <p
                            className="text-[8px] font-light uppercase tracking-[0.35em]"
                            style={{ color: `${theme.colors.primary}70` }}
                        >
                            留守模式 · 有限记忆
                        </p>
                        <motion.div
                            className="h-1 w-1 rounded-full shrink-0"
                            style={{ background: theme.colors.primary }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Input pill ──────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="relative flex items-center gap-3 px-5 py-3 vibe-transition"
                style={{
                    background: theme.colors.surface,
                    border: `${theme.geometry.borderWidth} solid ${isTraveling
                        ? `${theme.colors.primary}30`
                        : theme.colors.surfaceBorder}`,
                    borderRadius: "9999px",
                    backdropFilter: `blur(${theme.effects.blur})`,
                    WebkitBackdropFilter: `blur(${theme.effects.blur})`,
                    boxShadow: isLoading
                        ? `0 0 30px ${theme.colors.glow}, 0 4px 20px rgba(0,0,0,0.3)`
                        : isTraveling
                            ? `0 0 16px ${theme.colors.primary}10, 0 4px 20px rgba(0,0,0,0.2)`
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
                        isLoading
                            ? isTraveling ? "留守助手在思考…" : "Lux is thinking..."
                            : isTraveling ? "留守助手在听…" : "Ask your cyber-soul anything..."
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
                            ? `linear-gradient(135deg, ${theme.colors.primary}${isTraveling ? "99" : "ff"}, ${theme.colors.primarySoft}${isTraveling ? "99" : "ff"})`
                            : theme.colors.surface,
                    }}
                >
                    <ArrowUp size={14} style={{ color: "var(--vibe-text)" }} />
                </motion.button>
            </motion.div>
        </div>
    );
}
