"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePetStore } from "@/store/usePetStore";
import type { PetMood } from "@/store/usePetStore";

/* ══════════════════════════════════════════════════════════
   useAgentStream — subscribes to the SSE stream and maps
   incoming agent events to Zustand state + UI callbacks.
   ══════════════════════════════════════════════════════════ */

export interface SouvenirData {
    title?: string;
    description?: string;
    message?: string;
    scene?: string;
    link?: string;
}

interface UseAgentStreamOptions {
    /** Called when the agent delivers a souvenir postcard */
    onSouvenir?: (data: SouvenirData) => void;
    /** Called for any agent event (for visual ping effects) */
    onPing?: () => void;
    /** Called when the agent sends a rich UI payload to render */
    onUIUpdate?: (data: any) => void;
}

export function useAgentStream({ onSouvenir, onPing, onUIUpdate }: UseAgentStreamOptions = {}) {
    const setMood = usePetStore((s) => s.setMood);
    const setHealth = usePetStore((s) => s.setHealth);
    const addEcho = usePetStore((s) => s.addEcho);

    /* Stable refs so the EventSource handler never captures stale closures */
    const onSouvenirRef = useRef(onSouvenir);
    const onPingRef = useRef(onPing);
    const onUIUpdateRef = useRef(onUIUpdate);

    useEffect(() => { onSouvenirRef.current = onSouvenir; }, [onSouvenir]);
    useEffect(() => { onPingRef.current = onPing; }, [onPing]);
    useEffect(() => { onUIUpdateRef.current = onUIUpdate; }, [onUIUpdate]);

    const handleMessage = useCallback(
        (raw: string) => {
            let event: { action: string; data: Record<string, unknown>; timestamp?: number };
            try {
                event = JSON.parse(raw);
            } catch {
                return;
            }

            /* Skip connection confirmation messages */
            if ((event as { type?: string }).type === "connected") return;

            onPingRef.current?.();

            switch (event.action) {
                case "update_status": {
                    const { mood, health } = event.data as {
                        mood?: PetMood;
                        health?: number;
                    };
                    if (mood) setMood(mood);
                    if (typeof health === "number") setHealth(health);
                    break;
                }

                case "post_echo": {
                    const { text, x, y } = event.data as {
                        text?: string;
                        x?: number;
                        y?: number;
                    };
                    if (text) {
                        addEcho({
                            text,
                            x: x ?? 120 + Math.random() * (window.innerWidth - 320),
                            y: y ?? 120 + Math.random() * (window.innerHeight - 320),
                            author: "ai",
                        });
                    }
                    break;
                }

                case "post_chat_message": {
                    const { text } = event.data as { text?: string };
                    if (text) {
                        usePetStore.getState().addChatMessage({ role: "ai", text });
                    }
                    break;
                }

                case "update_ui_state": {
                    if (event.data) {
                        onUIUpdateRef.current?.(event.data);
                    }
                    break;
                }

                case "deliver_souvenir": {
                    onSouvenirRef.current?.(event.data as SouvenirData);
                    break;
                }
            }
        },
        [setMood, setHealth, addEcho]
    );

    useEffect(() => {
        const es = new EventSource("/api/agent/stream");

        es.onmessage = (e) => handleMessage(e.data);

        es.onerror = () => {
            /* EventSource auto-reconnects — we don't need to manage this */
        };

        return () => es.close();
    }, [handleMessage]);
}
