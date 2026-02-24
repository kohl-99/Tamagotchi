"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { BreathingOrb } from "@/components/BreathingOrb";
import { MemoryOrbit } from "@/components/MemoryOrbit";
import { ChatInput } from "@/components/ChatInput";
import {
  OrbitCard,
  ExpandedOverlay,
  type AIResponseUI,
} from "@/components/GenerativeUIRenderer";
import { usePetStore } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";

const MAX_SLOTS = 4;

interface WidgetSlot {
  id: string;
  response: AIResponseUI;
  updatedAt: number;
}

/* ── Orbit zones radiating from center ──────────────── */
const ORBIT_ZONES = [
  { x: 2, y: 8, w: 260 },    // top-left
  { x: 62, y: 6, w: 260 },   // top-right
  { x: 1, y: 55, w: 280 },   // bottom-left
  { x: 60, y: 52, w: 280 },  // bottom-right
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const setMood = usePetStore((s) => s.setMood);
  const [slots, setSlots] = useState<WidgetSlot[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const idCounter = useRef(0);

  /* Jittered positions derived from zone + slot id to stay stable */
  const positions = useMemo(() => {
    return ORBIT_ZONES.map((zone, i) => {
      const jitterX = ((i * 7 + 13) % 6) - 3; // ±3%
      const jitterY = ((i * 11 + 7) % 5) - 2; // ±2%
      return {
        left: `${zone.x + jitterX}%`,
        top: `${zone.y + jitterY}%`,
        width: zone.w,
      };
    });
  }, []);

  const handleSend = useCallback(async (message: string) => {
    setIsLoading(true);
    setMood("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const { vibeTheme, ...responseData } = data as AIResponseUI & { vibeTheme?: Record<string, unknown> };
      setMood(responseData.mood);

      /* ── Apply vibe theme if AI triggered a visual shift ── */
      if (vibeTheme) {
        const { applyPreset, patchTheme } = useThemeStore.getState();
        if (vibeTheme.preset && typeof vibeTheme.preset === "string") {
          // Preset-based switch (from mock or AI)
          applyPreset(vibeTheme.preset);
        } else {
          // Full theme object from AI function calling
          patchTheme(vibeTheme);
        }
      }

      const newSlot: WidgetSlot = {
        id: `w-${++idCounter.current}`,
        response: responseData,
        updatedAt: Date.now(),
      };

      setSlots((prev) => {
        if (prev.length < MAX_SLOTS) return [...prev, newSlot];
        // LRU: replace oldest
        const oldestIdx = prev.reduce(
          (mi, s, i, a) => (s.updatedAt < a[mi].updatedAt ? i : mi),
          0
        );
        const next = [...prev];
        next[oldestIdx] = newSlot;
        return next;
      });
    } catch (err) {
      console.error("Failed:", err);
      setMood("calm");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const expandedSlot = slots.find((s) => s.id === expandedId);
  const theme = useThemeStore((s) => s.currentTheme);

  return (
    <div className="relative h-screen w-screen overflow-hidden vibe-transition" style={{ background: theme.colors.background }}>
      {/* ── Ambient glow (background) ──────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 25%, ${theme.ambient.glow1} 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 30% 70%, ${theme.ambient.glow2} 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 70% 80%, ${theme.ambient.glow3} 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Status label (above orb) ────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+100px)] z-20">
        <p
          className="text-[10px] font-medium uppercase tracking-[0.3em] transition-colors duration-500"
          style={{
            color: isLoading
              ? `${theme.colors.primarySoft}80`
              : theme.colors.textMuted,
          }}
        >
          {isLoading ? "Processing · Rendering" : "Online · Listening"}
        </p>
      </div>

      {/* ── Breathing Orb + Memory Orbit (true center) ──── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ width: 400, height: 400 }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <BreathingOrb isLoading={isLoading} />
        </div>
        <MemoryOrbit />
      </div>

      {/* ── Chat Input (pinned bottom) ─────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-6">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>

      {/* ══ Floating Orbit Field ══════════════════════════ */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence>
          {slots.map((slot, i) => {
            const pos = positions[i];
            return (
              <div
                key={slot.id}
                className="absolute"
                style={{
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                }}
              >
                <OrbitCard
                  response={slot.response}
                  index={i}
                  onExpand={() => setExpandedId(slot.id)}
                />
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Expanded Overlay ───────────────────────────── */}
      <AnimatePresence>
        {expandedSlot && (
          <ExpandedOverlay
            response={expandedSlot.response}
            onClose={() => setExpandedId(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Bottom nav placeholder (z above orbit cards) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        {/* BottomNav will render here from layout */}
      </div>
    </div>
  );
}
