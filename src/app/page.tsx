"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BreathingOrb } from "@/components/BreathingOrb";
import { ChatInput } from "@/components/ChatInput";
import { GenerativeUIRenderer, type AIResponseUI } from "@/components/GenerativeUIRenderer";
import { X } from "lucide-react";

type Mood = "calm" | "thinking" | "excited";

const MAX_SLOTS = 4;

interface WidgetSlot {
  id: string;
  response: AIResponseUI;
  updatedAt: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState<Mood>("calm");
  const [slots, setSlots] = useState<WidgetSlot[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const idCounter = useRef(0);

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

      const data: AIResponseUI = await res.json();
      setMood(data.mood);

      const newSlot: WidgetSlot = {
        id: `widget-${++idCounter.current}`,
        response: data,
        updatedAt: Date.now(),
      };

      setSlots((prev) => {
        if (prev.length < MAX_SLOTS) {
          // Still have empty slots — just append
          return [...prev, newSlot];
        }
        // Replace the least recently updated slot
        const oldestIndex = prev.reduce(
          (minIdx, slot, idx, arr) =>
            slot.updatedAt < arr[minIdx].updatedAt ? idx : minIdx,
          0
        );
        const updated = [...prev];
        updated[oldestIndex] = newSlot;
        return updated;
      });
    } catch (err) {
      console.error("Failed to fetch:", err);
      setMood("calm");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const expandedSlot = slots.find((s) => s.id === expandedId);

  return (
    <div className="flex h-screen flex-col items-center overflow-hidden px-4 pt-6 pb-20 sm:px-6 sm:pt-8">
      {/* ── Status label ───────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mb-4 text-center text-[10px] font-medium uppercase tracking-[0.25em] sm:mb-5"
        style={{
          color: isLoading ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.25)",
          transition: "color 0.5s",
        }}
      >
        {isLoading ? "Processing · Rendering" : "Online · Listening"}
      </motion.p>

      {/* ── Breathing Orb (compact) ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-4 scale-75 sm:mb-5 sm:scale-90"
      >
        <BreathingOrb isLoading={isLoading} mood={mood} />
      </motion.div>

      {/* ── Chat Input ─────────────────────────────────── */}
      <div className="w-full max-w-lg mb-4 sm:mb-5">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>

      {/* ── Widget Grid (2×2, fills remaining space) ──── */}
      <div className="w-full max-w-3xl flex-1 min-h-0">
        <div className="grid h-full grid-cols-2 gap-3">
          {Array.from({ length: MAX_SLOTS }).map((_, i) => {
            const slot = slots[i];

            return (
              <motion.div
                key={slot?.id ?? `empty-${i}`}
                layout
                className="relative min-h-0 overflow-hidden rounded-2xl border cursor-pointer
                           transition-colors duration-200"
                style={{
                  background: slot
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(255,255,255,0.01)",
                  borderColor: slot
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(255,255,255,0.03)",
                  borderStyle: slot ? "solid" : "dashed",
                }}
                onClick={() => slot && setExpandedId(slot.id)}
                whileHover={slot ? { borderColor: "rgba(124,58,237,0.2)" } : {}}
              >
                {slot ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full overflow-hidden p-0.5"
                  >
                    <div className="h-full overflow-hidden [&>div]:!rounded-xl">
                      <GenerativeUIRenderer response={slot.response} compact />
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div
                        className="mx-auto mb-2 h-8 w-8 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <div className="h-3 w-3 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                      </div>
                      <span className="text-[10px] text-white/15 tracking-wider uppercase">
                        Awaiting
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Expanded Widget Overlay ─────────────────────── */}
      <AnimatePresence>
        {expandedSlot && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setExpandedId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border p-1"
              style={{
                background: "rgba(15,10,30,0.95)",
                borderColor: "rgba(124,58,237,0.15)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setExpandedId(null)}
                className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center
                           rounded-lg outline-none transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <X size={14} className="text-white/40" />
              </button>

              <GenerativeUIRenderer response={expandedSlot.response} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
