"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SocialFeed } from "@/components/SocialFeed";

export default function DiscoverPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ container: containerRef });

    /* Thread glow intensity follows scroll position */
    const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.03, 0.08, 0.03]);

    return (
        <div
            ref={containerRef}
            className="relative h-screen overflow-y-auto overflow-x-hidden bg-[#06040c]"
        >
            {/* ── Ambient gradients ──────────────────────────── */}
            <div
                className="pointer-events-none fixed inset-0"
                style={{
                    background: `
            radial-gradient(ellipse 50% 40% at 50% 20%, rgba(124,58,237,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 30% 25% at 20% 60%, rgba(6,182,212,0.03) 0%, transparent 60%),
            radial-gradient(ellipse 30% 25% at 80% 80%, rgba(245,158,11,0.02) 0%, transparent 60%)
          `,
                }}
            />

            {/* ── Header ─────────────────────────────────────── */}
            <div className="relative z-10 pt-12 pb-8 text-center">
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-[10px] font-medium uppercase tracking-[0.35em]"
                    style={{ color: "var(--vibe-text-muted)" }}
                >
                    Discover
                </motion.h1>
            </div>

            {/* ── Feed ───────────────────────────────────────── */}
            <div className="relative z-10 mx-auto max-w-2xl px-6 pb-32">
                <SocialFeed />
            </div>
        </div>
    );
}
