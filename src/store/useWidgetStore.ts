import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ══════════════════════════════════════════════════════════
   WIDGET TERRARIUM STORE
   Persists placed widget positions to localStorage so users'
   arrangements survive page refreshes.
   ══════════════════════════════════════════════════════════ */

export type WidgetType = "clock" | "music_player";

export interface PlacedWidget {
    id: string;
    type: WidgetType;
    x: number;
    y: number;
}

interface WidgetStore {
    widgets: PlacedWidget[];
    updatePosition: (id: string, x: number, y: number) => void;
    addWidget: (type: WidgetType) => void;
    removeWidget: (id: string) => void;
}

export const useWidgetStore = create<WidgetStore>()(
    persist(
        (set) => ({
            /* Default arrangement — sensible for ~1440px wide screens */
            widgets: [
                { id: "w-clock", type: "clock", x: 1180, y: 68 },
                { id: "w-player", type: "music_player", x: 56, y: 580 },
            ],

            updatePosition: (id, x, y) =>
                set((s) => ({
                    widgets: s.widgets.map((w) =>
                        w.id === id ? { ...w, x, y } : w
                    ),
                })),

            addWidget: (type) =>
                set((s) => ({
                    widgets: [
                        ...s.widgets,
                        {
                            id: `w-${type}-${Date.now()}`,
                            type,
                            x: 200 + Math.random() * 200,
                            y: 200 + Math.random() * 200,
                        },
                    ],
                })),

            removeWidget: (id) =>
                set((s) => ({
                    widgets: s.widgets.filter((w) => w.id !== id),
                })),
        }),
        {
            name: "cyber-terrarium",
            // Only persist the positions, not actions
            partialize: (s) => ({ widgets: s.widgets }),
        }
    )
);
