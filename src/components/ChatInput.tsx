"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ChatInput({
    onSend,
    isLoading,
}: {
    onSend: (message: string) => void;
    isLoading: boolean;
}) {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

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
            className="relative flex items-center gap-2 rounded-2xl border px-4 py-2.5"
            style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: isLoading
                    ? "rgba(124,58,237,0.3)"
                    : "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                boxShadow: isLoading
                    ? "0 0 24px rgba(124,58,237,0.1)"
                    : "0 2px 12px rgba(0,0,0,0.2)",
                transition: "border-color 0.3s, box-shadow 0.3s",
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
                className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25
                   outline-none disabled:opacity-50"
            />

            <motion.button
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                   outline-none transition-opacity disabled:opacity-20"
                style={{
                    background: value.trim()
                        ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
                        : "rgba(255,255,255,0.06)",
                }}
            >
                <ArrowUp size={16} className="text-white" />
            </motion.button>
        </motion.div>
    );
}
