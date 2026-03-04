"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePetStore } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";

/* ══════════════════════════════════════════════════════════
   AgentChatFeed — Shows last 3 messages with dimming.
   Scrollable to view previous messages.
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
            className="fixed bottom-[140px] left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-30 flex flex-col gap-2 pb-2 overflow-y-auto"
            style={{
                maxHeight: '35vh',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
            }}
        >
            {/* Spacer pushes messages to bottom when few */}
            <div className="flex-1 min-h-0" />
            <AnimatePresence initial={false}>
                {chatHistory.map((msg, i) => {
                    const isUser = msg.role === "user";
                    // Dim older messages: last 3 are full opacity, older ones fade
                    const fromEnd = chatHistory.length - 1 - i;
                    const opacity = fromEnd === 0 ? 1 : fromEnd === 1 ? 0.75 : fromEnd === 2 ? 0.5 : 0.35;

                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className="relative px-3.5 py-2 max-w-[80%] rounded-2xl text-[12px] leading-relaxed tracking-wide font-medium pointer-events-auto"
                                style={
                                    isUser
                                        ? {
                                            background: `linear-gradient(135deg, ${theme.colors.primary}dd, ${theme.colors.primarySoft}cc)`,
                                            color: "#ffffff",
                                            borderBottomRightRadius: "4px",
                                            boxShadow: `0 2px 12px ${theme.colors.primary}30`,
                                        }
                                        : {
                                            background: "var(--vibe-surface)",
                                            color: "var(--vibe-text)",
                                            border: `1px solid var(--vibe-surface-border)`,
                                            backdropFilter: `blur(var(--vibe-blur))`,
                                            WebkitBackdropFilter: `blur(var(--vibe-blur))`,
                                            boxShadow: `0 2px 12px rgba(0,0,0,0.08)`,
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
