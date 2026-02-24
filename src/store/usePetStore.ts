import { create } from "zustand";

/* ══════════════════════════════════════════════════════════
   PET STATE STORE — Cyber-soul life signs
   ══════════════════════════════════════════════════════════ */

export type PetMood = "calm" | "excited" | "emo" | "thinking";

export interface Memory {
    id: string;
    text: string;
    timestamp: number;
}

interface PetState {
    health: number;       // 0-100  — Token算力池
    mood: PetMood;        // 算力燃烧率
    location: string;     // 当前位置
    syncRate: number;     // 0-100  — 与主人的羁绊信任度
    memories: Memory[];   // context fragments orbiting the soul

    /* ── Actions ────────────────────────────────────────── */
    setHealth: (v: number) => void;
    setMood: (m: PetMood) => void;
    setLocation: (l: string) => void;
    setSyncRate: (v: number) => void;

    /* ── Memory actions ────────────────────────────────── */
    addMemory: (text: string) => void;
    removeMemory: (id: string) => void;

    /* ── Compound actions ───────────────────────────────── */
    heal: (amount: number) => void;
    drain: (amount: number) => void;
    boostSync: (amount: number) => void;
    decaySync: (amount: number) => void;
}

const clamp = (v: number, min = 0, max = 100) =>
    Math.max(min, Math.min(max, v));

let memIdCounter = 100;

export const usePetStore = create<PetState>()((set) => ({
    /* defaults */
    health: 87,
    mood: "calm",
    location: "主脑内休眠",
    syncRate: 72,
    memories: [
        { id: "m1", text: "you like coffee at 7am", timestamp: Date.now() - 86400000 },
        { id: "m2", text: "thursday evenings are always free", timestamp: Date.now() - 72000000 },
        { id: "m3", text: "favorite color is deep violet", timestamp: Date.now() - 50000000 },
        { id: "m4", text: "prefer lo-fi over classical", timestamp: Date.now() - 36000000 },
        { id: "m5", text: "allergic to small talk", timestamp: Date.now() - 20000000 },
    ],

    /* setters */
    setHealth: (v) => set({ health: clamp(v) }),
    setMood: (m) => set({ mood: m }),
    setLocation: (l) => set({ location: l }),
    setSyncRate: (v) => set({ syncRate: clamp(v) }),

    /* memory actions */
    addMemory: (text) =>
        set((s) => ({
            memories: [
                ...s.memories,
                { id: `m${++memIdCounter}`, text, timestamp: Date.now() },
            ],
        })),
    removeMemory: (id) =>
        set((s) => ({
            memories: s.memories.filter((m) => m.id !== id),
        })),

    /* compound actions */
    heal: (amount: number) =>
        set((s) => ({ health: clamp(s.health + amount) })),
    drain: (amount: number) =>
        set((s) => ({ health: clamp(s.health - amount) })),
    boostSync: (amount: number) =>
        set((s) => ({ syncRate: clamp(s.syncRate + amount) })),
    decaySync: (amount: number) =>
        set((s) => ({ syncRate: clamp(s.syncRate - amount) })),
}));
