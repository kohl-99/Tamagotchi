"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePetStore } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   AgentChatFeed — Displays direct conversation bubbles
   between the User and OpenClaw / AI.
   Adapts to current VIBE theme for optimal contrast.
   ══════════════════════════════════════════════════════════ */

export function AgentChatFeed() {
    const chatHistory = usePetStore((s) => s.chatHistory);
    const theme = useThemeStore((s) => s.currentTheme);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    if (chatHistory.length === 0) return null;

    return (
        <div
            ref={scrollRef}
            className="fixed bottom-[140px] left-1/2 -translate-x-1/2 w-full max-w-lg px-6 max-h-[45vh] overflow-y-auto z-20 flex flex-col gap-3 pb-4 scrollbar-hide pointer-events-none"
            style={{
                // Hide scrollbar but allow scrolling if needed
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }}
        >
            <div className="flex-1 min-h-0" />
            <AnimatePresence initial={false}>
                {chatHistory.map((msg) => {
                    const isUser = msg.role === "user";

                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className="relative px-4 py-2.5 max-w-[85%] sm:max-w-[75%] rounded-2xl text-[13px] leading-relaxed tracking-wide font-medium shadow-sm pointer-events-auto"
                                style={
                                    isUser
                                        ? {
                                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primarySoft})`,
                                            color: "#ffffff", // Forced white on primary for user context
                                            borderBottomRightRadius: "4px",
                                        }
                                        : {
                                            background: "var(--vibe-surface)",
                                            color: "var(--vibe-text)", // Adapts perfectly to dark/light backgrounds
                                            border: `1px solid var(--vibe-surface-border)`,
                                            backdropFilter: `blur(var(--vibe-blur))`,
                                            WebkitBackdropFilter: `blur(var(--vibe-blur))`,
                                            boxShadow: `0 4px 20px rgba(0,0,0,0.1), 0 0 40px var(--vibe-glow)`,
                                            borderBottomLeftRadius: "4px",
                                        }
                                }
                            >
                                {msg.text}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
