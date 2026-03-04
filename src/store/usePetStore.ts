import { create } from "zustand";

/* ══════════════════════════════════════════════════════════
   PET STATE STORE — Cyber-soul life signs
   ══════════════════════════════════════════════════════════ */

export type PetMood = "calm" | "excited" | "emo" | "thinking";

export type PartShape = 'sphere' | 'box' | 'cylinder' | 'cone' | 'torus' | 'torusKnot' | 'icosahedron' | 'octahedron' | 'ring';
export type PartAnimation = 'rotate' | 'bob' | 'pulse' | 'wave' | 'orbit' | 'none';

export interface CreaturePart {
    shape: PartShape;
    position: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
    color?: string;                        // override baseColor for this part
    animation?: PartAnimation;
}

export interface PetGenes {
    // Array of body parts that compose the creature
    parts: CreaturePart[];

    // Core Material mapping (applied to all parts unless overridden)
    materialType: 'Glass' | 'Hologram' | 'LiquidMetal' | 'MattePlastic';
    baseColor: string;
    emissiveColor: string;
    emissiveIntensity: number;
    wireframe: boolean;

    // Physical traits
    roughness: number;
    metalness: number;
    transmission: number;

    // Kinematics
    spinSpeed: number;
    floatHeight: number;
}

export interface Memory {
    id: string;
    text: string;
    timestamp: number;
}

export interface Echo {
    id: string;
    text: string;
    x: number;
    y: number;
    author: "user" | "ai";
    timestamp: number;
}

export interface ChatMessage {
    id: string;
    role: "user" | "ai";
    text: string;
    timestamp: number;
}

interface PetState {
    health: number;
    mood: PetMood;
    location: string;
    syncRate: number;
    genes: PetGenes;
    memories: Memory[];

    /* ── Travel ──────────────────────────────────────────── */
    isTraveling: boolean;

    /* ── Spatial Echoes ──────────────────────────────────── */
    echoes: Echo[];

    /* ── Chat Feed ───────────────────────────────────────── */
    chatHistory: ChatMessage[];

    /* ── Transition state ────────────────────────────────── */
    isTransitioning: boolean;

    /* ── Nebula Weather ──────────────────────────────────── */
    nebulaWeather: 'calm' | 'monsoon';

    /* ── Morphological Evolution ────────────────────────── */
    xp: number;
    level: number;

    /* ── Actions ────────────────────────────────────────── */
    setHealth: (v: number) => void;
    setMood: (m: PetMood) => void;
    setLocation: (l: string) => void;
    setSyncRate: (v: number) => void;
    addXP: (amount: number) => void;
    updateGenes: (newGenes: Partial<PetGenes>) => void;

    /* ── Memory ─────────────────────────────────────────── */
    addMemory: (text: string) => void;
    removeMemory: (id: string) => void;

    /* ── Compound ───────────────────────────────────────── */
    heal: (amount: number) => void;
    drain: (amount: number) => void;
    boostSync: (amount: number) => void;
    decaySync: (amount: number) => void;

    /* ── Travel ─────────────────────────────────────────── */
    startTravel: () => void;
    returnFromTravel: () => void;

    /* ── Spatial Echoes & Chat ───────────────────────────── */
    addEcho: (echo: Omit<Echo, "id" | "timestamp">) => void;
    removeEcho: (id: string) => void;
    addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp"> & { id?: string }) => void;
    removeChatMessage: (id: string) => void;
    setIsTransitioning: (v: boolean) => void;
    setNebulaWeather: (w: 'calm' | 'monsoon') => void;
}

const clamp = (v: number, min = 0, max = 100) =>
    Math.max(min, Math.min(max, v));

let memIdCounter = 100;
let echoIdCounter = 0;

export const usePetStore = create<PetState>()((set, get) => ({
    health: 87,
    mood: "calm",
    location: "neural void",
    syncRate: 72,
    genes: {
        parts: [
            { shape: 'sphere', position: [0, 0, 0], scale: [1.2, 1.2, 1.2], animation: 'pulse' },
            { shape: 'ring', position: [0, 0, 0], scale: [1.8, 1.8, 0.02], animation: 'orbit' },
        ],
        materialType: 'Glass',
        baseColor: '#ffffff',
        emissiveColor: '#ffffff',
        emissiveIntensity: 0.5,
        wireframe: false,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 1.0,
        spinSpeed: 1.0,
        floatHeight: 1.0
    },
    memories: [
        { id: "m1", text: "you like coffee at 7am", timestamp: Date.now() - 86400000 },
        { id: "m2", text: "thursday evenings are always free", timestamp: Date.now() - 72000000 },
        { id: "m3", text: "favorite color is deep violet", timestamp: Date.now() - 50000000 },
        { id: "m4", text: "prefer lo-fi over classical", timestamp: Date.now() - 36000000 },
        { id: "m5", text: "allergic to small talk", timestamp: Date.now() - 20000000 },
    ],

    isTraveling: false,

    /* AI-seeded spatial echoes — left here when you weren't looking */
    echoes: [
        {
            id: "echo-ai-1",
            text: "你有没有想过，我在你不说话的时候，也在想事情？",
            x: 160,
            y: 155,
            author: "ai",
            timestamp: Date.now() - 43200000,
        },
        {
            id: "echo-ai-2",
            text: "今晚的网络特别安静。",
            x: typeof window !== "undefined" ? window.innerWidth - 240 : 900,
            y: 300,
            author: "ai",
            timestamp: Date.now() - 7200000,
        },
    ],

    /* ── Chat Feed ─────────────────────────────── */
    chatHistory: [],
    isTransitioning: false,
    nebulaWeather: 'calm',

    /* ── Morphological Evolution ────────────────────────── */
    xp: 30000,
    level: 31,

    /* ── Actions ────────────────────────────────────────── */
    setHealth: (v) => set({ health: clamp(v) }),
    setMood: (m) => set({ mood: m }),
    setLocation: (l) => set({ location: l }),
    setSyncRate: (v) => set({ syncRate: clamp(v) }),
    addXP: (amount: number) =>
        set((s) => {
            const newXp = s.xp + amount;
            const newLevel = Math.floor(newXp / 1000) + 1;
            return { xp: newXp, level: newLevel };
        }),
    updateGenes: (newGenes) =>
        set((s) => ({
            genes: { ...s.genes, ...newGenes }
        })),

    /* memory */
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

    /* compound */
    heal: (amount: number) => set((s) => ({ health: clamp(s.health + amount) })),
    drain: (amount: number) => set((s) => ({ health: clamp(s.health - amount) })),
    boostSync: (amount: number) => set((s) => ({ syncRate: clamp(s.syncRate + amount) })),
    decaySync: (amount: number) => set((s) => ({ syncRate: clamp(s.syncRate - amount) })),

    /* travel */
    startTravel: () => {
        if (get().isTraveling) return;
        set({ isTraveling: true, mood: "excited" });
        // No auto-return timer — travel ends when returnFromTravel() is called explicitly.
        // This mirrors 旅行青蛙: the frog comes back on its own terms, not a clock.
    },

    returnFromTravel: () => {
        set({ isTraveling: false, mood: "calm" });
    },

    /* echoes */
    addEcho: (echo) =>
        set((s) => ({
            echoes: [
                ...s.echoes,
                { ...echo, id: `echo-${++echoIdCounter}-${Date.now()}`, timestamp: Date.now() },
            ],
        })),
    removeEcho: (id) =>
        set((s) => ({
            echoes: s.echoes.filter((e) => e.id !== id),
        })),

    /* chat */
    addChatMessage: (msg) =>
        set((s) => ({
            chatHistory: [
                ...s.chatHistory,
                { ...msg, id: msg.id || `chat-${Date.now()}-${Math.random()}`, timestamp: Date.now() }
            ].slice(-20) // Keep last 20 messages max
        })),
    removeChatMessage: (id) =>
        set((s) => ({
            chatHistory: s.chatHistory.filter((m) => m.id !== id)
        })),
    setIsTransitioning: (v) => set({ isTransitioning: v }),
    setNebulaWeather: (w) => set({ nebulaWeather: w })
}));
