import { create } from "zustand";

/* ══════════════════════════════════════════════════════════
   GLOBAL VIBE ENGINE — AI-controllable design token system
   
   Every visual property in the app (color, geometry, typography,
   effects) is defined here as a ThemeVibe. The AI agent can
   rewrite the entire visual reality at runtime via function
   calling or direct store mutation.
   ══════════════════════════════════════════════════════════ */

/* ── ThemeVibe Interface ───────────────────────────────── */
export interface ThemeVibe {
    name: string;
    colors: {
        background: string;   // page bg (hex)
        surface: string;      // glass card bg (rgba)
        surfaceBorder: string;// glass border (rgba)
        primary: string;      // main accent color
        primarySoft: string;  // softer accent variant
        textMain: string;     // primary text
        textMuted: string;    // dimmed text
        glow: string;         // shadow / glow color
    };
    orb: {
        calm: { primary: string; glow: string; ring: string; highlight: string };
        excited: { primary: string; glow: string; ring: string; highlight: string };
        emo: { primary: string; glow: string; ring: string; highlight: string };
        thinking: { primary: string; glow: string; ring: string; highlight: string };
    };
    hud: {
        location: string;
        healthOk: string;
        healthWarn: string;
        healthCrit: string;
        sync: string;
        moodCalm: string;
        moodExcited: string;
        moodEmo: string;
        moodThinking: string;
    };
    memory: {
        dotColor: string;
        dotGlow: string;
        cardBg: string;
    };
    geometry: {
        radius: string;       // e.g. '16px', '0px'
        radiusLg: string;     // larger radius for cards
        borderWidth: string;  // e.g. '1px', '0.5px'
    };
    typography: {
        fontFamily: "sans" | "serif" | "mono";
    };
    effects: {
        blur: string;         // backdrop-filter value, e.g. '20px'
        blurHeavy: string;    // heavier blur, e.g. '40px'
    };
    ambient: {
        glow1: string;        // top center
        glow2: string;        // bottom-left
        glow3: string;        // bottom-right
    };
}

/* ── Store shape ───────────────────────────────────────── */
interface ThemeStore {
    currentTheme: ThemeVibe;
    previousThemePrimary: string | null; // for transition overlay color
    setTheme: (theme: ThemeVibe) => void;
    applyPreset: (name: string) => void;
    patchTheme: (partial: DeepPartial<ThemeVibe>) => void;
}

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/* Recursive merge utility */
function deepMerge<T extends Record<string, unknown>>(
    base: T,
    patch: DeepPartial<T>
): T {
    const result = { ...base };
    for (const key in patch) {
        const val = patch[key];
        if (
            val !== null &&
            typeof val === "object" &&
            !Array.isArray(val) &&
            typeof result[key] === "object"
        ) {
            result[key] = deepMerge(
                result[key] as Record<string, unknown>,
                val as DeepPartial<Record<string, unknown>>
            ) as T[typeof key];
        } else if (val !== undefined) {
            result[key] = val as T[typeof key];
        }
    }
    return result;
}

/* ══════════════════════════════════════════════════════════
   PRESET: CYBER-DARK (default — current look)
   Neon-electric, zero-radius, mono font, maximum cyberpunk
   ══════════════════════════════════════════════════════════ */
const CYBER_DARK: ThemeVibe = {
    name: "Cyber-Dark",
    colors: {
        background: "#06040c",
        surface: "rgba(255,255,255,0.04)",
        surfaceBorder: "rgba(255,255,255,0.08)",
        primary: "#7c3aed",
        primarySoft: "#a78bfa",
        textMain: "rgba(255,255,255,0.85)",
        textMuted: "rgba(255,255,255,0.25)",
        glow: "rgba(124,58,237,0.15)",
    },
    orb: {
        calm: {
            primary: "rgba(148,163,184,0.22)",
            glow: "rgba(148,163,184,0.18)",
            ring: "rgba(186,200,215,0.10)",
            highlight: "rgba(220,230,240,0.28)",
        },
        excited: {
            primary: "rgba(192,38,211,0.28)",
            glow: "rgba(192,38,211,0.24)",
            ring: "rgba(232,121,249,0.14)",
            highlight: "rgba(249,168,212,0.35)",
        },
        emo: {
            primary: "rgba(51,65,85,0.20)",
            glow: "rgba(51,65,85,0.10)",
            ring: "rgba(71,85,105,0.06)",
            highlight: "rgba(100,116,139,0.12)",
        },
        thinking: {
            primary: "rgba(6,182,212,0.25)",
            glow: "rgba(6,182,212,0.20)",
            ring: "rgba(103,232,249,0.12)",
            highlight: "rgba(165,243,252,0.30)",
        },
    },
    hud: {
        location: "#22c55e",
        healthOk: "#8b5cf6",
        healthWarn: "#f59e0b",
        healthCrit: "#ef4444",
        sync: "#a78bfa",
        moodCalm: "#94a3b8",
        moodExcited: "#e879f9",
        moodEmo: "#64748b",
        moodThinking: "#22d3ee",
    },
    memory: {
        dotColor: "rgba(167,139,250,1)",
        dotGlow: "rgba(124,58,237,1)",
        cardBg: "rgba(10,6,20,0.88)",
    },
    geometry: {
        radius: "4px",
        radiusLg: "16px",
        borderWidth: "0.5px",
    },
    typography: {
        fontFamily: "sans",
    },
    effects: {
        blur: "20px",
        blurHeavy: "40px",
    },
    ambient: {
        glow1: "rgba(124,58,237,0.06)",
        glow2: "rgba(6,182,212,0.03)",
        glow3: "rgba(245,158,11,0.02)",
    },
};

/* ══════════════════════════════════════════════════════════
   PRESET: MINIMAL-WABISABI
   Soft cream, large radius, serif font, zen calm
   ══════════════════════════════════════════════════════════ */
const MINIMAL_WABISABI: ThemeVibe = {
    name: "Minimal-WabiSabi",
    colors: {
        background: "#f5f0e8",
        surface: "rgba(0,0,0,0.03)",
        surfaceBorder: "rgba(0,0,0,0.06)",
        primary: "#8b7355",
        primarySoft: "#b8a88a",
        textMain: "rgba(30,25,20,0.85)",
        textMuted: "rgba(30,25,20,0.35)",
        glow: "rgba(139,115,85,0.10)",
    },
    orb: {
        calm: {
            primary: "rgba(180,165,140,0.25)",
            glow: "rgba(180,165,140,0.15)",
            ring: "rgba(200,185,160,0.12)",
            highlight: "rgba(220,210,195,0.30)",
        },
        excited: {
            primary: "rgba(210,140,90,0.28)",
            glow: "rgba(210,140,90,0.20)",
            ring: "rgba(230,170,120,0.14)",
            highlight: "rgba(245,200,160,0.32)",
        },
        emo: {
            primary: "rgba(100,90,75,0.18)",
            glow: "rgba(100,90,75,0.10)",
            ring: "rgba(130,120,100,0.08)",
            highlight: "rgba(160,150,130,0.14)",
        },
        thinking: {
            primary: "rgba(120,140,100,0.22)",
            glow: "rgba(120,140,100,0.16)",
            ring: "rgba(150,170,130,0.10)",
            highlight: "rgba(180,200,160,0.28)",
        },
    },
    hud: {
        location: "#6b8f50",
        healthOk: "#8b7355",
        healthWarn: "#c49545",
        healthCrit: "#b84c30",
        sync: "#b8a88a",
        moodCalm: "#a09080",
        moodExcited: "#c49545",
        moodEmo: "#7a6b5a",
        moodThinking: "#6b8f50",
    },
    memory: {
        dotColor: "rgba(139,115,85,1)",
        dotGlow: "rgba(184,168,138,1)",
        cardBg: "rgba(245,240,232,0.92)",
    },
    geometry: {
        radius: "20px",
        radiusLg: "28px",
        borderWidth: "1px",
    },
    typography: {
        fontFamily: "serif",
    },
    effects: {
        blur: "24px",
        blurHeavy: "48px",
    },
    ambient: {
        glow1: "rgba(139,115,85,0.04)",
        glow2: "rgba(180,165,140,0.03)",
        glow3: "rgba(210,190,160,0.02)",
    },
};

/* ══════════════════════════════════════════════════════════
   PRESET: ABYSS (for heartbreak / melancholy)
   Deep ocean blues, serif, sharp edges, minimal glow
   ══════════════════════════════════════════════════════════ */
const ABYSS: ThemeVibe = {
    name: "Abyss",
    colors: {
        background: "#03050a",
        surface: "rgba(20,30,60,0.15)",
        surfaceBorder: "rgba(50,70,120,0.10)",
        primary: "#1e3a5f",
        primarySoft: "#4a6fa5",
        textMain: "rgba(150,170,200,0.6)",
        textMuted: "rgba(100,120,160,0.25)",
        glow: "rgba(30,58,95,0.12)",
    },
    orb: {
        calm: {
            primary: "rgba(30,58,95,0.20)",
            glow: "rgba(20,40,70,0.15)",
            ring: "rgba(50,70,120,0.08)",
            highlight: "rgba(74,111,165,0.18)",
        },
        excited: {
            primary: "rgba(60,100,160,0.22)",
            glow: "rgba(60,100,160,0.16)",
            ring: "rgba(80,130,200,0.10)",
            highlight: "rgba(100,150,220,0.24)",
        },
        emo: {
            primary: "rgba(15,20,40,0.25)",
            glow: "rgba(15,20,40,0.12)",
            ring: "rgba(30,40,70,0.06)",
            highlight: "rgba(50,60,100,0.10)",
        },
        thinking: {
            primary: "rgba(40,80,140,0.20)",
            glow: "rgba(40,80,140,0.15)",
            ring: "rgba(60,100,170,0.08)",
            highlight: "rgba(80,130,200,0.22)",
        },
    },
    hud: {
        location: "#2d5a8c",
        healthOk: "#4a6fa5",
        healthWarn: "#6b5b3e",
        healthCrit: "#6b3030",
        sync: "#4a6fa5",
        moodCalm: "#4a6fa5",
        moodExcited: "#5580b3",
        moodEmo: "#2d3a5c",
        moodThinking: "#3d6b9c",
    },
    memory: {
        dotColor: "rgba(74,111,165,1)",
        dotGlow: "rgba(30,58,95,1)",
        cardBg: "rgba(3,5,10,0.92)",
    },
    geometry: {
        radius: "0px",
        radiusLg: "2px",
        borderWidth: "0.5px",
    },
    typography: {
        fontFamily: "serif",
    },
    effects: {
        blur: "16px",
        blurHeavy: "32px",
    },
    ambient: {
        glow1: "rgba(30,58,95,0.04)",
        glow2: "rgba(20,40,70,0.02)",
        glow3: "rgba(10,20,40,0.02)",
    },
};

/* ══════════════════════════════════════════════════════════
   PRESET: TATAMI ZEN (榻榻米 / 侘寂)
   Warm rice-paper cream, matcha green, serif, zen stillness
   ══════════════════════════════════════════════════════════ */
const TATAMI_ZEN: ThemeVibe = {
    name: "Tatami Zen",
    colors: {
        background: "#EBE6DF",
        surface: "rgba(245,242,237,0.6)",
        surfaceBorder: "rgba(180,170,155,0.3)",
        primary: "#5A6B53",
        primarySoft: "rgba(90,107,83,0.4)",
        textMain: "#2C2A28",
        textMuted: "#7A756D",
        glow: "rgba(90,107,83,0.3)",
    },
    orb: {
        calm: {
            primary: "rgba(90,107,83,0.22)",
            glow: "rgba(90,107,83,0.15)",
            ring: "rgba(180,170,155,0.12)",
            highlight: "rgba(200,195,180,0.28)",
        },
        excited: {
            primary: "rgba(160,130,80,0.25)",
            glow: "rgba(160,130,80,0.18)",
            ring: "rgba(200,170,100,0.14)",
            highlight: "rgba(220,200,140,0.30)",
        },
        emo: {
            primary: "rgba(80,75,65,0.18)",
            glow: "rgba(80,75,65,0.10)",
            ring: "rgba(120,115,100,0.08)",
            highlight: "rgba(150,145,130,0.14)",
        },
        thinking: {
            primary: "rgba(90,107,83,0.20)",
            glow: "rgba(90,107,83,0.14)",
            ring: "rgba(120,140,110,0.10)",
            highlight: "rgba(160,180,140,0.24)",
        },
    },
    hud: {
        location: "#5A6B53",
        healthOk: "#5A6B53",
        healthWarn: "#B89B60",
        healthCrit: "#A0523D",
        sync: "#7A756D",
        moodCalm: "#7A756D",
        moodExcited: "#B89B60",
        moodEmo: "#5C5650",
        moodThinking: "#5A6B53",
    },
    memory: {
        dotColor: "rgba(90,107,83,1)",
        dotGlow: "rgba(180,170,155,1)",
        cardBg: "rgba(235,230,223,0.92)",
    },
    geometry: {
        radius: "8px",
        radiusLg: "16px",
        borderWidth: "1px",
    },
    typography: { fontFamily: "serif" },
    effects: { blur: "12px", blurHeavy: "24px" },
    ambient: {
        glow1: "rgba(90,107,83,0.08)",
        glow2: "rgba(200,180,150,0.05)",
        glow3: "rgba(235,230,223,0.06)",
    },
};

/* ══════════════════════════════════════════════════════════
   PRESET: ANIME POP (二次元 / 动漫流体)
   Deep starfield blue, hot pink + cyan neon, bubbly 24px radius
   ══════════════════════════════════════════════════════════ */
const ANIME_POP: ThemeVibe = {
    name: "Anime Pop",
    colors: {
        background: "#0D0E15",
        surface: "rgba(255,255,255,0.05)",
        surfaceBorder: "rgba(255,105,180,0.4)",
        primary: "#00E5FF",
        primarySoft: "rgba(0,229,255,0.35)",
        textMain: "#FFFFFF",
        textMuted: "rgba(255,255,255,0.6)",
        glow: "rgba(255,105,180,0.6)",
    },
    orb: {
        calm: {
            primary: "rgba(0,229,255,0.25)",
            glow: "rgba(0,229,255,0.20)",
            ring: "rgba(255,105,180,0.15)",
            highlight: "rgba(147,112,219,0.30)",
        },
        excited: {
            primary: "rgba(255,105,180,0.30)",
            glow: "rgba(255,105,180,0.25)",
            ring: "rgba(0,229,255,0.18)",
            highlight: "rgba(255,200,230,0.35)",
        },
        emo: {
            primary: "rgba(75,0,130,0.20)",
            glow: "rgba(75,0,130,0.12)",
            ring: "rgba(147,112,219,0.08)",
            highlight: "rgba(180,150,230,0.16)",
        },
        thinking: {
            primary: "rgba(147,112,219,0.25)",
            glow: "rgba(147,112,219,0.18)",
            ring: "rgba(0,229,255,0.12)",
            highlight: "rgba(200,180,255,0.28)",
        },
    },
    hud: {
        location: "#00E5FF",
        healthOk: "#00E5FF",
        healthWarn: "#FF69B4",
        healthCrit: "#FF1744",
        sync: "#FF69B4",
        moodCalm: "#00E5FF",
        moodExcited: "#FF69B4",
        moodEmo: "#9370DB",
        moodThinking: "#7B68EE",
    },
    memory: {
        dotColor: "rgba(0,229,255,1)",
        dotGlow: "rgba(255,105,180,1)",
        cardBg: "rgba(13,14,21,0.92)",
    },
    geometry: {
        radius: "24px",
        radiusLg: "40px",
        borderWidth: "2px",
    },
    typography: { fontFamily: "sans" },
    effects: { blur: "16px", blurHeavy: "32px" },
    ambient: {
        glow1: "rgba(255,105,180,0.12)",
        glow2: "rgba(0,229,255,0.10)",
        glow3: "rgba(147,112,219,0.08)",
    },
};

/* ══════════════════════════════════════════════════════════
   PRESET: DARK ABYSS FOCUS (黑暗专注模式)
   OLED pure black, acid green, mono, zero radius, zero blur
   ══════════════════════════════════════════════════════════ */
const DARK_FOCUS: ThemeVibe = {
    name: "Dark Abyss",
    colors: {
        background: "#000000",
        surface: "rgba(15,15,15,0.8)",
        surfaceBorder: "rgba(50,50,50,0.5)",
        primary: "#CCFF00",
        primarySoft: "rgba(204,255,0,0.3)",
        textMain: "#E0E0E0",
        textMuted: "#666666",
        glow: "rgba(204,255,0,0.4)",
    },
    orb: {
        calm: {
            primary: "rgba(204,255,0,0.20)",
            glow: "rgba(204,255,0,0.12)",
            ring: "rgba(204,255,0,0.06)",
            highlight: "rgba(220,255,80,0.22)",
        },
        excited: {
            primary: "rgba(204,255,0,0.30)",
            glow: "rgba(204,255,0,0.22)",
            ring: "rgba(255,255,100,0.12)",
            highlight: "rgba(240,255,120,0.32)",
        },
        emo: {
            primary: "rgba(30,30,30,0.20)",
            glow: "rgba(30,30,30,0.10)",
            ring: "rgba(50,50,50,0.06)",
            highlight: "rgba(80,80,80,0.12)",
        },
        thinking: {
            primary: "rgba(204,255,0,0.18)",
            glow: "rgba(204,255,0,0.14)",
            ring: "rgba(180,220,0,0.08)",
            highlight: "rgba(200,240,40,0.20)",
        },
    },
    hud: {
        location: "#CCFF00",
        healthOk: "#CCFF00",
        healthWarn: "#FF9500",
        healthCrit: "#FF3B30",
        sync: "#CCFF00",
        moodCalm: "#888888",
        moodExcited: "#CCFF00",
        moodEmo: "#555555",
        moodThinking: "#AADD00",
    },
    memory: {
        dotColor: "rgba(204,255,0,1)",
        dotGlow: "rgba(160,200,0,1)",
        cardBg: "rgba(0,0,0,0.95)",
    },
    geometry: {
        radius: "0px",
        radiusLg: "0px",
        borderWidth: "1px",
    },
    typography: { fontFamily: "mono" },
    effects: { blur: "4px", blurHeavy: "8px" },
    ambient: {
        glow1: "rgba(0,0,0,0)",
        glow2: "rgba(0,0,0,0)",
        glow3: "rgba(0,0,0,0)",
    },
};

/* ══════════════════════════════════════════════════════════
   PRESET: LIQUID CHROME (液态金属 / Y2K)
   Silver metallic base, pill shapes, extreme glassmorphism
   ══════════════════════════════════════════════════════════ */
const LIQUID_CHROME: ThemeVibe = {
    name: "Liquid Chrome",
    colors: {
        background: "#B0B3B8",
        surface: "rgba(255,255,255,0.4)",
        surfaceBorder: "rgba(255,255,255,0.8)",
        primary: "#1A1A1A",
        primarySoft: "rgba(255,255,255,0.5)",
        textMain: "#050505",
        textMuted: "#4A4A4A",
        glow: "rgba(255,255,255,0.9)",
    },
    orb: {
        calm: {
            primary: "rgba(200,200,210,0.30)",
            glow: "rgba(255,255,255,0.25)",
            ring: "rgba(255,255,255,0.15)",
            highlight: "rgba(255,255,255,0.40)",
        },
        excited: {
            primary: "rgba(255,255,255,0.35)",
            glow: "rgba(255,255,255,0.30)",
            ring: "rgba(26,26,26,0.12)",
            highlight: "rgba(255,255,255,0.50)",
        },
        emo: {
            primary: "rgba(100,100,110,0.20)",
            glow: "rgba(100,100,110,0.12)",
            ring: "rgba(150,150,160,0.08)",
            highlight: "rgba(180,180,190,0.18)",
        },
        thinking: {
            primary: "rgba(180,180,190,0.25)",
            glow: "rgba(180,180,190,0.18)",
            ring: "rgba(200,200,210,0.10)",
            highlight: "rgba(230,230,240,0.30)",
        },
    },
    hud: {
        location: "#1A1A1A",
        healthOk: "#1A1A1A",
        healthWarn: "#8A6D00",
        healthCrit: "#8A0000",
        sync: "#4A4A4A",
        moodCalm: "#4A4A4A",
        moodExcited: "#1A1A1A",
        moodEmo: "#6A6A6A",
        moodThinking: "#3A3A3A",
    },
    memory: {
        dotColor: "rgba(26,26,26,1)",
        dotGlow: "rgba(100,100,110,1)",
        cardBg: "rgba(255,255,255,0.6)",
    },
    geometry: {
        radius: "9999px",
        radiusLg: "9999px",
        borderWidth: "0px",
    },
    typography: { fontFamily: "sans" },
    effects: { blur: "24px", blurHeavy: "48px" },
    ambient: {
        glow1: "rgba(255,255,255,0.15)",
        glow2: "rgba(0,0,0,0.04)",
        glow3: "rgba(0,0,0,0)",
    },
};

/* ── Preset registry ───────────────────────────────────── */
export const PRESETS: Record<string, ThemeVibe> = {
    "Cyber-Dark": CYBER_DARK,
    "Minimal-WabiSabi": MINIMAL_WABISABI,
    "Abyss": ABYSS,
    "Tatami-Zen": TATAMI_ZEN,
    "Anime-Pop": ANIME_POP,
    "Dark-Focus": DARK_FOCUS,
    "Liquid-Chrome": LIQUID_CHROME,
};

/* ══════════════════════════════════════════════════════════
   ZUSTAND STORE
   ══════════════════════════════════════════════════════════ */
export const useThemeStore = create<ThemeStore>((set) => ({
    currentTheme: CYBER_DARK,
    previousThemePrimary: null,

    setTheme: (theme) =>
        set((s) => ({
            previousThemePrimary: s.currentTheme.colors.primary,
            currentTheme: theme,
        })),

    applyPreset: (name) => {
        const preset = PRESETS[name];
        if (preset) {
            set((s) => ({
                previousThemePrimary: s.currentTheme.colors.primary,
                currentTheme: preset,
            }));
        }
    },

    patchTheme: (partial) =>
        set((s) => ({
            previousThemePrimary: s.currentTheme.colors.primary,
            currentTheme: deepMerge(
                s.currentTheme as unknown as Record<string, unknown>,
                partial as DeepPartial<Record<string, unknown>>
            ) as unknown as ThemeVibe,
        })),
}));
