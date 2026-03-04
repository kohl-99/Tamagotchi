"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════════════════════
   GENERATIVE ORB RENDERER
   Renders AI-generated orb HTML inside a sandboxed iframe.
   Supports 2D/3D/Canvas/Three.js/CSS art — anything.
   ══════════════════════════════════════════════════════════ */

interface GenerativeOrbRendererProps {
    orbCode: string;
    onGenerated?: () => void;
}

export function GenerativeOrbRenderer({ orbCode, onGenerated }: GenerativeOrbRendererProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
        const timer = setTimeout(() => setIsLoaded(true), 200);
        return () => clearTimeout(timer);
    }, [orbCode]);

    useEffect(() => {
        if (isLoaded) onGenerated?.();
    }, [isLoaded, onGenerated]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={orbCode.slice(0, 32)}
                initial={{ opacity: 0, scale: 0.6, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.6, filter: "blur(20px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-64 h-64 flex items-center justify-center"
            >
                {/* Glow halo behind iframe */}
                <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at center, var(--vibe-primary-soft) 0%, transparent 70%)",
                        filter: "blur(24px)",
                        opacity: 0.6,
                    }}
                />
                <iframe
                    ref={iframeRef}
                    srcDoc={orbCode}
                    sandbox="allow-scripts"
                    className="w-full h-full border-none bg-transparent rounded-full overflow-hidden"
                    style={{
                        background: "transparent",
                        colorScheme: "dark",
                    }}
                    title="Generative Orb"
                />
            </motion.div>
        </AnimatePresence>
    );
}

/* ══════════════════════════════════════════════════════════
   ORB GENERATION LOADING STATE
   ══════════════════════════════════════════════════════════ */
export function OrbGenerating() {
    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute w-24 h-24 rounded-full border border-[var(--vibe-primary-soft)]"
                style={{ borderTopColor: "var(--vibe-primary)" }}
            />
            <motion.div
                animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-3 h-3 rounded-full"
                style={{ background: "var(--vibe-primary)", boxShadow: "0 0 20px var(--vibe-primary)" }}
            />
            <span
                className="absolute bottom-16 text-[9px] uppercase tracking-[0.3em]"
                style={{ color: "var(--vibe-text-muted)" }}
            >
                generating orb...
            </span>
        </div>
    );
}
