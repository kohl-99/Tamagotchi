"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { BreathingOrb } from "@/components/BreathingOrb";
import { CloneOrb } from "@/components/CloneOrb";
import { MemoryOrbit } from "@/components/MemoryOrbit";
import { ChatInput } from "@/components/ChatInput";
import { AgentChatFeed } from "@/components/AgentChatFeed";
import { SouvenirPostcard } from "@/components/SouvenirPostcard";
import { EchoCanvas } from "@/components/EchoCanvas";
import { WidgetTerrarium } from "@/components/widgets/WidgetTerrarium";
import {
  OrbitCard,
  ExpandedOverlay,
  type AIResponseUI,
} from "@/components/GenerativeUIRenderer";
import { usePetStore } from "@/store/usePetStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useAgentStream } from "@/hooks/useAgentStream";

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

  /* Travel state */
  const isTraveling = usePetStore((s) => s.isTraveling);
  const startTravel = usePetStore((s) => s.startTravel);
  const returnFromTravel = usePetStore((s) => s.returnFromTravel);
  const [showPostcard, setShowPostcard] = useState(false);
  const prevTraveling = useRef(false);

  /* Agent stream — real-time events from OpenClaw */
  const [isPinging, setIsPinging] = useState(false);
  useAgentStream({
    onPing: useCallback(() => {
      setIsPinging(true);
      setTimeout(() => setIsPinging(false), 1500);
    }, []),
    onSouvenir: useCallback(() => setShowPostcard(true), []),
    onUIUpdate: useCallback((uiData: AIResponseUI) => {
      const newSlot: WidgetSlot = {
        id: `w-${++idCounter.current}`,
        response: uiData,
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
    }, []),
  });

  useEffect(() => {
    if (prevTraveling.current && !isTraveling) {
      // Just returned → show souvenir postcard
      setShowPostcard(true);
    }
    prevTraveling.current = isTraveling;
  }, [isTraveling]);

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

  const handleSend = useCallback(async (message: string, isCloneMode: boolean) => {
    setIsLoading(true);
    setMood("thinking");
    usePetStore.getState().addChatMessage({ role: "user", text: message });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, isCloneMode }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      // If we are getting a vibe theme directly from the mock response in clone mode
      const { vibeTheme, ...responseData } = data as AIResponseUI & { vibeTheme?: Record<string, unknown> };

      // Set the mood based on immediate acknowledgment
      if (responseData.mood) {
        setMood(responseData.mood);
      }

      /* ── Apply vibe theme if triggered ── */
      if (vibeTheme) {
        const { applyPreset, patchTheme } = useThemeStore.getState();
        if (vibeTheme.preset && typeof vibeTheme.preset === "string") {
          applyPreset(vibeTheme.preset);
        } else {
          patchTheme(vibeTheme);
        }
      }

      // We explicitly DO NOT push the responseData into widgets here anymore.
      // The OpenClaw Daemon will handle generating the UI payloads asynchronously 
      // and hit the onUIUpdate callback via SSE webhook.

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

      {/* ── Spatial Echoes Canvas ────────────────────────── */}
      <EchoCanvas />

      {/* ── Status label (above orb) ────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isTraveling ? "traveling" : isLoading ? "loading" : "idle"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+100px)] z-20"
        >
          <motion.p
            className="text-[10px] font-medium uppercase tracking-[0.3em]"
            style={{ color: isTraveling ? `${theme.colors.primary}55` : isLoading ? `${theme.colors.primarySoft}80` : theme.colors.textMuted }}
            animate={isTraveling ? { opacity: [0.4, 0.9, 0.4] } : {}}
            transition={isTraveling ? { duration: 3, repeat: Infinity } : {}}
          >
            {isTraveling ? "在旅行中…" : isLoading ? "Processing · Rendering" : "Online · Listening"}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* ── Orb container: main + clone ─────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ width: 400, height: 400 }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <BreathingOrb isLoading={isLoading} isPinging={isPinging} />
          {/* CloneOrb appears here after main departs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <CloneOrb />
          </div>
        </div>
        <MemoryOrbit />
      </div>

      {/* ── Chat Feed & Input (pinned bottom, above nav) ─────────── */}
      <AgentChatFeed />
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-6">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>

      {/* ── Travel / Recall Button ──────────────────────── */}
      <motion.button
        onClick={() => isTraveling ? returnFromTravel() : startTravel()}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-[6.5rem] right-5 z-40 flex flex-col items-center justify-center h-12 w-12 rounded-full gap-0.5"
        style={{
          background: theme.colors.surface,
          border: `1px solid ${isTraveling ? `${theme.colors.primary}40` : theme.colors.surfaceBorder}`,
          backdropFilter: `blur(${theme.effects.blur})`,
          WebkitBackdropFilter: `blur(${theme.effects.blur})`,
          boxShadow: isTraveling
            ? `0 0 18px ${theme.colors.primary}18, 0 4px 20px rgba(0,0,0,0.25)`
            : "0 4px 20px rgba(0,0,0,0.3)",
        }}
        title={isTraveling ? "召回" : "Go Wander"}
      >
        <motion.div
          animate={isTraveling ? { rotate: 360 } : { rotate: 0 }}
          transition={isTraveling ? { duration: 4, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
        >
          <Navigation size={14} style={{ color: theme.colors.primary }} />
        </motion.div>
        <span
          className="text-[6px] uppercase tracking-[0.2em] font-medium"
          style={{ color: `${theme.colors.primary}70` }}
        >
          {isTraveling ? "召回" : "wander"}
        </span>
      </motion.button>

      {/* ── Widget Terrarium ────────────────────────────── */}
      <WidgetTerrarium />

      {/* ── Peaceful ambient dim (during travel) ───────── */}
      <motion.div
        className="fixed inset-0 z-[15] pointer-events-none"
        animate={{ opacity: isTraveling ? 1 : 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{ background: "rgba(0, 0, 0, 0.22)" }}
      />
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
      {/* ── Souvenir Postcard (on return) ──────────────── */}
      <AnimatePresence>
        {showPostcard && (
          <SouvenirPostcard
            key="postcard"
            onDismiss={() => setShowPostcard(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
