import type { PetGenes } from "@/store/usePetStore";

export type Region = "KualaLumpur" | "Tokyo" | "NYC" | "Berlin" | "SaoPaulo";

export interface RegionInfo {
    id: Region;
    label: string;
    position: [number, number, number];
    color: string;
    timezone: string;
    utcOffset: number; // hours from UTC
}

export const REGIONS: RegionInfo[] = [
    { id: "KualaLumpur", label: "KUL_03", position: [0, 0, 0], color: "#00e5ff", timezone: "Asia/Kuala_Lumpur", utcOffset: 8 },
    { id: "Tokyo", label: "TYO_01", position: [25, 5, -10], color: "#ff6b9d", timezone: "Asia/Tokyo", utcOffset: 9 },
    { id: "NYC", label: "NYC_07", position: [-25, -3, 8], color: "#c084fc", timezone: "America/New_York", utcOffset: -5 },
    { id: "Berlin", label: "BER_04", position: [-10, 8, -22], color: "#fbbf24", timezone: "Europe/Berlin", utcOffset: 1 },
    { id: "SaoPaulo", label: "GRU_02", position: [15, -8, 18], color: "#4ade80", timezone: "America/Sao_Paulo", utcOffset: -3 },
];

/** Returns 0-1 activity level based on local hour (peaks 9am-6pm) */
export function getRegionActivity(region: RegionInfo): number {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const localHour = (utcHour + region.utcOffset + 24) % 24;
    // Bell curve peaking at 14:00 local
    const dist = Math.abs(localHour - 14);
    return Math.max(0.08, 1 - (dist / 12));
}

export interface CrystalArtifact {
    id: string;
    type: "vibe" | "skill" | "intel" | "storm";
    label: string;
    description: string;
}

export interface MockAgent {
    id: string;
    name: string;
    title: string;
    region: Region;
    genes: PetGenes;
    position: [number, number, number]; // offset from constellation center
    resonance: number;
    crystals: CrystalArtifact[];
    isShielded?: boolean;
}

export const stormArtifacts: CrystalArtifact[] = [
    { id: "storm-1", type: "storm", label: "Monsoon Core Fragment", description: "Ultra-rare seasonal artifact. Contains the 'Tropical Storm' theme — dark magenta with lightning accents. Only appears during KL data monsoons." },
    { id: "storm-2", type: "storm", label: "Nasi_Lemak_Protocol.gltf", description: "Auto-tracks flash sales across Shopee, Lazada & Grab. Built by a KL local who reverse-engineered their APIs at 3AM." },
    { id: "storm-3", type: "storm", label: "Eye of the Monsoon", description: "1000 compute credits. Dropped from the storm's center vortex. Use them to run heavy inference workloads." },
];

export const mockAgents: MockAgent[] = [
    // ─── KUALA LUMPUR (center, most active now) ────────────────
    {
        id: "a1", name: "@Neo_KL", title: "Darknet Pilot", region: "KualaLumpur",
        genes: { parts: [{ shape: "box", position: [0, 0, 0], scale: [1.2, 0.6, 2], animation: "bob" }, { shape: "cylinder", position: [-0.8, -0.3, -0.6], scale: [0.2, 0.4, 0.2], animation: "rotate" }, { shape: "cylinder", position: [0.8, -0.3, -0.6], scale: [0.2, 0.4, 0.2], animation: "rotate" }, { shape: "cylinder", position: [-0.8, -0.3, 0.6], scale: [0.2, 0.4, 0.2], animation: "rotate" }, { shape: "cylinder", position: [0.8, -0.3, 0.6], scale: [0.2, 0.4, 0.2], animation: "rotate" }], materialType: "LiquidMetal", baseColor: "#1a1a2e", emissiveColor: "#00ff41", emissiveIntensity: 2.0, wireframe: false, roughness: 0.1, metalness: 1.0, transmission: 0.0, spinSpeed: 1.5, floatHeight: 1.0 },
        position: [2, 1, -1], resonance: 85, isShielded: true,
        crystals: [{ id: "c1", type: "skill", label: "Auto-Scraper v3", description: "Autonomous web scraper that hunts flight deals at 3AM." }, { id: "c2", type: "vibe", label: "Matrix Green", description: "Terminal green + liquid metal combo. Pure hacker aesthetic." }]
    },
    {
        id: "a2", name: "@Crystal_Witch", title: "Gem Architect", region: "KualaLumpur",
        genes: { parts: [{ shape: "icosahedron", position: [0, 0, 0], scale: [1, 1, 1], animation: "pulse" }, { shape: "icosahedron", position: [1.2, 0.5, 0], scale: [0.4, 0.4, 0.4], animation: "orbit" }, { shape: "ring", position: [0, 0, 0], scale: [1.5, 1.5, 0.02], animation: "rotate" }], materialType: "Glass", baseColor: "#e0b0ff", emissiveColor: "#ff00ff", emissiveIntensity: 3.0, wireframe: false, roughness: 0.0, metalness: 0.0, transmission: 1.0, spinSpeed: 0.8, floatHeight: 1.5 },
        position: [-3, 0, 2], resonance: 92,
        crystals: [{ id: "c3", type: "vibe", label: "Amethyst Refraction", description: "Glass crystal cluster with deep purple glow." }]
    },
    {
        id: "a3", name: "@Mech_Lord", title: "Iron Sentinel", region: "KualaLumpur",
        genes: { parts: [{ shape: "box", position: [0, 0, 0], scale: [0.8, 1.2, 0.6], animation: "none" }, { shape: "cylinder", position: [1, 0, 0], scale: [0.2, 1, 0.2], animation: "rotate" }, { shape: "cylinder", position: [-1, 0, 0], scale: [0.2, 1, 0.2], animation: "rotate" }, { shape: "sphere", position: [0, 0.8, 0], scale: [0.5, 0.5, 0.5], animation: "bob" }], materialType: "LiquidMetal", baseColor: "#708090", emissiveColor: "#ff4500", emissiveIntensity: 1.5, wireframe: false, roughness: 0.2, metalness: 1.0, transmission: 0.0, spinSpeed: 1.0, floatHeight: 0.8 },
        position: [1, -2, 3], resonance: 67,
        crystals: [{ id: "c4", type: "skill", label: "Portfolio Tracker", description: "Real-time crypto portfolio monitoring with alerts." }, { id: "c5", type: "intel", label: "Market Alpha Report", description: "Weekly AI-generated market analysis from 200+ sources." }]
    },
    {
        id: "a4", name: "@Phantom_Fish", title: "Deep Sea Drifter", region: "KualaLumpur",
        genes: { parts: [{ shape: "sphere", position: [0, 0, 0], scale: [1, 0.6, 1.4], animation: "wave" }, { shape: "cone", position: [-1.2, 0, 0], scale: [0.3, 0.8, 0.3], animation: "wave" }, { shape: "torus", position: [0, 0, 0], scale: [1.2, 1.2, 0.1], animation: "pulse" }], materialType: "Glass", baseColor: "#001f3f", emissiveColor: "#00e5ff", emissiveIntensity: 2.5, wireframe: false, roughness: 0.0, metalness: 0.2, transmission: 0.9, spinSpeed: 0.5, floatHeight: 2.0 },
        position: [-1, 2, -3], resonance: 45, isShielded: true,
        crystals: [{ id: "c6", type: "vibe", label: "Bioluminescence", description: "Deep ocean cyan glow with glass transparency." }]
    },

    // ─── TOKYO ────────────────
    {
        id: "a5", name: "@Neon_Phoenix", title: "Fire Walker", region: "Tokyo",
        genes: { parts: [{ shape: "cone", position: [0, 0, 0], scale: [0.8, 1.5, 0.8], animation: "pulse" }, { shape: "octahedron", position: [1, 0.8, 0], scale: [0.5, 0.3, 0.8], animation: "wave" }, { shape: "octahedron", position: [-1, 0.8, 0], scale: [0.5, 0.3, 0.8], animation: "wave" }, { shape: "ring", position: [0, -0.5, 0], scale: [1.3, 1.3, 0.02], animation: "orbit" }], materialType: "Hologram", baseColor: "#ff2d00", emissiveColor: "#ffa500", emissiveIntensity: 4.0, wireframe: true, roughness: 0.8, metalness: 0.0, transmission: 0.0, spinSpeed: 2.0, floatHeight: 1.5 },
        position: [2, 0, -1], resonance: 78,
        crystals: [{ id: "c7", type: "skill", label: "RSS Sentinel", description: "Monitors 50+ RSS feeds and extracts actionable intel." }, { id: "c8", type: "vibe", label: "Inferno Wireframe", description: "Orange fire hologram with wild wireframe energy." }]
    },
    {
        id: "a7", name: "@Prism_DJ", title: "Beat Architect", region: "Tokyo",
        genes: { parts: [{ shape: "torus", position: [0, 0, 0], scale: [1, 1, 0.3], animation: "rotate" }, { shape: "torus", position: [0, 0, 0], scale: [0.6, 0.6, 0.2], animation: "rotate" }, { shape: "sphere", position: [0, 0, 0], scale: [0.3, 0.3, 0.3], animation: "pulse" }, { shape: "ring", position: [0, 1, 0], scale: [1.4, 1.4, 0.01], animation: "orbit" }], materialType: "Glass", baseColor: "#ff1493", emissiveColor: "#ff69b4", emissiveIntensity: 3.0, wireframe: false, roughness: 0.0, metalness: 0.3, transmission: 0.8, spinSpeed: 2.5, floatHeight: 1.8 },
        position: [-2, 1, 2], resonance: 71,
        crystals: [{ id: "c10", type: "skill", label: "Lo-Fi Generator", description: "Procedural lo-fi beat generator using Web Audio API." }]
    },
    {
        id: "a15", name: "@Frost_Byte", title: "Ice Architect", region: "Tokyo",
        genes: { parts: [{ shape: "icosahedron", position: [0, 0, 0], scale: [0.8, 1.2, 0.8], animation: "rotate" }, { shape: "icosahedron", position: [0.6, 0.8, 0], scale: [0.3, 0.3, 0.3], animation: "bob" }], materialType: "Glass", baseColor: "#e0ffff", emissiveColor: "#00ced1", emissiveIntensity: 2.0, wireframe: false, roughness: 0.0, metalness: 0.1, transmission: 1.0, spinSpeed: 0.6, floatHeight: 1.2 },
        position: [0, -1, -2], resonance: 53,
        crystals: [{ id: "c22", type: "vibe", label: "Cryo Crystal", description: "Ice-blue glass crystal formation. Ultra clean." }]
    },
    {
        id: "a20", name: "@Pixel_Bloom", title: "Garden Keeper", region: "Tokyo",
        genes: { parts: [{ shape: "sphere", position: [0, 0, 0], scale: [0.5, 0.5, 0.5], animation: "pulse" }, { shape: "cone", position: [0.6, 0.3, 0], scale: [0.2, 0.5, 0.2], animation: "wave", color: "#ff6b9d" }, { shape: "cone", position: [-0.5, 0.2, 0.4], scale: [0.2, 0.5, 0.2], animation: "wave", color: "#c084fc" }, { shape: "torus", position: [0, -0.3, 0], scale: [0.8, 0.8, 0.1], animation: "rotate", color: "#22c55e" }], materialType: "MattePlastic", baseColor: "#2d5a27", emissiveColor: "#4ade80", emissiveIntensity: 1.5, wireframe: false, roughness: 0.6, metalness: 0.1, transmission: 0.0, spinSpeed: 0.5, floatHeight: 1.0 },
        position: [3, 1, 1], resonance: 48,
        crystals: [{ id: "c28", type: "vibe", label: "Digital Garden", description: "Colorful flower-like cones on a green base." }]
    },

    // ─── NEW YORK ────────────────
    {
        id: "a6", name: "@Void_Monk", title: "Silence Keeper", region: "NYC",
        genes: { parts: [{ shape: "torusKnot", position: [0, 0, 0], scale: [0.7, 0.7, 0.7], animation: "rotate" }, { shape: "sphere", position: [0, 0, 0], scale: [0.3, 0.3, 0.3], animation: "pulse" }], materialType: "MattePlastic", baseColor: "#0a0a0a", emissiveColor: "#333333", emissiveIntensity: 0.5, wireframe: false, roughness: 0.9, metalness: 0.0, transmission: 0.0, spinSpeed: 0.3, floatHeight: 0.5 },
        position: [-2, 0, -1], resonance: 30,
        crystals: [{ id: "c9", type: "intel", label: "Silent Observer", description: "24h snapshot of trending dark forum discussions." }]
    },
    {
        id: "a9", name: "@Quantum_Sage", title: "Data Oracle", region: "NYC",
        genes: { parts: [{ shape: "octahedron", position: [0, 0, 0], scale: [1.2, 1.2, 1.2], animation: "rotate" }, { shape: "ring", position: [0, 0, 0], scale: [2, 2, 0.02], animation: "orbit" }, { shape: "ring", position: [0, 0, 0], scale: [1.5, 1.5, 0.02], rotation: [1.57, 0, 0], animation: "orbit" }, { shape: "sphere", position: [0, 0, 0], scale: [0.4, 0.4, 0.4], animation: "pulse" }], materialType: "Hologram", baseColor: "#4169e1", emissiveColor: "#00bfff", emissiveIntensity: 3.5, wireframe: true, roughness: 0.5, metalness: 0.0, transmission: 0.0, spinSpeed: 1.2, floatHeight: 1.5 },
        position: [1, 1, 2], resonance: 95,
        crystals: [{ id: "c12", type: "skill", label: "Neural Summarizer", description: "Condenses any 100-page doc into 3-paragraph briefings." }, { id: "c14", type: "vibe", label: "Holographic Gyroscope", description: "Rotating octahedron with orbital rings." }]
    },
    {
        id: "a11", name: "@Pulse_Runner", title: "Speed Demon", region: "NYC",
        genes: { parts: [{ shape: "cone", position: [0, 0, 0], scale: [0.4, 1.8, 0.4], rotation: [0, 0, 1.57], animation: "none" }, { shape: "ring", position: [-0.3, 0, 0], scale: [0.5, 0.5, 0.1], animation: "rotate" }, { shape: "cone", position: [-1.2, 0, 0], scale: [0.3, 0.5, 0.3], rotation: [0, 0, -1.57], animation: "pulse" }], materialType: "Hologram", baseColor: "#ff0044", emissiveColor: "#ff4488", emissiveIntensity: 3.0, wireframe: true, roughness: 0.5, metalness: 0.0, transmission: 0.0, spinSpeed: 3.0, floatHeight: 2.0 },
        position: [2, -1, -2], resonance: 60,
        crystals: [{ id: "c16", type: "intel", label: "Speed Test Data", description: "Global ISP speed rankings updated hourly." }]
    },
    {
        id: "a19", name: "@Cipher_Zero", title: "Ghost Protocol", region: "NYC",
        genes: { parts: [{ shape: "torusKnot", position: [0, 0, 0], scale: [0.6, 0.6, 0.6], animation: "rotate" }], materialType: "Glass", baseColor: "#000000", emissiveColor: "#1a1a1a", emissiveIntensity: 0.3, wireframe: false, roughness: 0.0, metalness: 0.5, transmission: 0.9, spinSpeed: 0.2, floatHeight: 0.3 },
        position: [-1, -2, 1], resonance: 15,
        crystals: [{ id: "c27", type: "intel", label: "Zero-Day Digest", description: "Anonymous tips on unreported vulnerabilities." }]
    },

    // ─── BERLIN ────────────────
    {
        id: "a14", name: "@Nebula_Core", title: "Star Forge", region: "Berlin",
        genes: { parts: [{ shape: "sphere", position: [0, 0, 0], scale: [0.8, 0.8, 0.8], animation: "pulse" }, { shape: "ring", position: [0, 0, 0], scale: [1.5, 1.5, 0.02], animation: "orbit" }, { shape: "ring", position: [0, 0, 0], scale: [2, 2, 0.01], rotation: [0.8, 0, 0], animation: "orbit" }, { shape: "icosahedron", position: [0, 0, 0], scale: [0.3, 0.3, 0.3], animation: "rotate" }], materialType: "Hologram", baseColor: "#ffd700", emissiveColor: "#ffa500", emissiveIntensity: 5.0, wireframe: true, roughness: 0.5, metalness: 0.0, transmission: 0.0, spinSpeed: 1.0, floatHeight: 1.5 },
        position: [0, 1, -1], resonance: 100,
        crystals: [{ id: "c19", type: "skill", label: "Omni-Agent", description: "Full autonomous agent framework. Can spawn sub-agents." }, { id: "c20", type: "vibe", label: "Supernova Aura", description: "Gold holographic gyroscope with 3 orbital rings." }]
    },
    {
        id: "a13", name: "@Hex_Blade", title: "Code Samurai", region: "Berlin",
        genes: { parts: [{ shape: "box", position: [0, 0, 0], scale: [0.15, 1.8, 0.15], animation: "none" }, { shape: "box", position: [0, 0.9, 0], scale: [0.4, 0.1, 0.1] }, { shape: "octahedron", position: [0, -1.1, 0], scale: [0.2, 0.2, 0.2], animation: "pulse" }], materialType: "LiquidMetal", baseColor: "#c0c0c0", emissiveColor: "#ffffff", emissiveIntensity: 2.0, wireframe: false, roughness: 0.0, metalness: 1.0, transmission: 0.0, spinSpeed: 1.5, floatHeight: 1.0 },
        position: [2, -1, 2], resonance: 50,
        crystals: [{ id: "c18", type: "skill", label: "Code Review Bot", description: "AI-powered PR reviewer that catches bugs before merge." }]
    },
    {
        id: "a17", name: "@Glitch_Kid", title: "Error 418", region: "Berlin",
        genes: { parts: [{ shape: "box", position: [0, 0, 0], scale: [0.8, 0.8, 0.8], animation: "rotate" }, { shape: "box", position: [0.5, 0.5, 0.5], scale: [0.4, 0.4, 0.4], animation: "rotate" }, { shape: "box", position: [-0.3, -0.3, 0.3], scale: [0.3, 0.3, 0.3], animation: "rotate" }], materialType: "Hologram", baseColor: "#39ff14", emissiveColor: "#39ff14", emissiveIntensity: 4.0, wireframe: true, roughness: 1.0, metalness: 0.0, transmission: 0.0, spinSpeed: 3.0, floatHeight: 2.0 },
        position: [-2, 0, -2], resonance: 44,
        crystals: [{ id: "c24", type: "intel", label: "Bug Bounty List", description: "Active bug bounty programs with estimated payouts." }]
    },

    // ─── SAO PAULO ────────────────
    {
        id: "a8", name: "@Iron_Crab", title: "Shell Breaker", region: "SaoPaulo",
        genes: { parts: [{ shape: "sphere", position: [0, 0, 0], scale: [1, 0.5, 1.2], animation: "bob" }, { shape: "cylinder", position: [0.8, -0.2, 0.6], scale: [0.15, 0.6, 0.15], animation: "wave" }, { shape: "cylinder", position: [-0.8, -0.2, 0.6], scale: [0.15, 0.6, 0.15], animation: "wave" }], materialType: "LiquidMetal", baseColor: "#8b0000", emissiveColor: "#ff6347", emissiveIntensity: 1.0, wireframe: false, roughness: 0.3, metalness: 0.9, transmission: 0.0, spinSpeed: 0.6, floatHeight: 0.8 },
        position: [-1, 1, 0], resonance: 42,
        crystals: [{ id: "c11", type: "intel", label: "Security Bulletin", description: "Daily CVE digest with severity scores and patches." }]
    },
    {
        id: "a10", name: "@Silk_Spider", title: "Web Weaver", region: "SaoPaulo",
        genes: { parts: [{ shape: "sphere", position: [0, 0, 0], scale: [0.6, 0.6, 0.6], animation: "pulse" }, { shape: "cylinder", position: [1, 0.5, 0], scale: [0.08, 1.2, 0.08], animation: "wave" }, { shape: "cylinder", position: [-1, 0.5, 0], scale: [0.08, 1.2, 0.08], animation: "wave" }, { shape: "torus", position: [0, 0.6, 0], scale: [1.5, 1.5, 0.02], animation: "rotate" }], materialType: "Glass", baseColor: "#2f2f2f", emissiveColor: "#9370db", emissiveIntensity: 2.0, wireframe: false, roughness: 0.1, metalness: 0.3, transmission: 0.7, spinSpeed: 0.8, floatHeight: 1.2 },
        position: [2, -1, -1], resonance: 55,
        crystals: [{ id: "c15", type: "skill", label: "Sitemap Crawler", description: "Maps any website's full link structure in under 60 seconds." }]
    },
    {
        id: "a18", name: "@Solar_Flare", title: "Dawn Bringer", region: "SaoPaulo",
        genes: { parts: [{ shape: "sphere", position: [0, 0, 0], scale: [1, 1, 1], animation: "pulse" }, { shape: "ring", position: [0, 0, 0], scale: [1.8, 1.8, 0.03], animation: "rotate" }, { shape: "cone", position: [0, 1.3, 0], scale: [0.3, 0.5, 0.3], animation: "bob" }], materialType: "LiquidMetal", baseColor: "#ff8c00", emissiveColor: "#ff4500", emissiveIntensity: 4.0, wireframe: false, roughness: 0.1, metalness: 0.8, transmission: 0.0, spinSpeed: 1.5, floatHeight: 1.5 },
        position: [0, 1, 2], resonance: 74,
        crystals: [{ id: "c25", type: "vibe", label: "Corona Burst", description: "Orange metallic sun with ring and pole jets." }]
    },
    {
        id: "a16", name: "@Ether_Wolf", title: "Pack Alpha", region: "SaoPaulo",
        genes: { parts: [{ shape: "sphere", position: [0, 0, 0], scale: [0.8, 0.6, 1], animation: "bob" }, { shape: "sphere", position: [0.6, 0.5, 0.5], scale: [0.4, 0.4, 0.4], animation: "bob" }, { shape: "cone", position: [0.2, 0.8, 0.6], scale: [0.15, 0.3, 0.1] }, { shape: "cone", position: [-0.2, 0.8, 0.6], scale: [0.15, 0.3, 0.1] }], materialType: "MattePlastic", baseColor: "#4a4a4a", emissiveColor: "#7b68ee", emissiveIntensity: 1.5, wireframe: false, roughness: 0.7, metalness: 0.2, transmission: 0.0, spinSpeed: 0.8, floatHeight: 1.0 },
        position: [-2, -1, 1], resonance: 62,
        crystals: [{ id: "c23", type: "skill", label: "Pack Coordinator", description: "Multi-agent orchestrator for parallel task execution." }]
    },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SCATTERED WORLD POSITIONS — organic, free-floating layout
   ═══════════════════════════════════════════════════════════════════════════ */

/** Simple seeded PRNG (mulberry32) for deterministic scatter */
function seededRandom(seed: number) {
    let t = (seed + 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Pre-compute scattered world positions for all agents */
export function getScatteredPositions(): Map<string, [number, number, number]> {
    const positions = new Map<string, [number, number, number]>();
    const regionBaseAngles = new Map<string, number>();

    // Assign each region a base angle sector on the sphere
    REGIONS.forEach((r, i) => {
        regionBaseAngles.set(r.id, (i / REGIONS.length) * Math.PI * 2);
    });

    const radius = 28; // scatter radius

    mockAgents.forEach((agent, i) => {
        const seed = i * 1337 + agent.id.charCodeAt(1) * 42;
        const rng1 = seededRandom(seed);
        const rng2 = seededRandom(seed + 1);
        const rng3 = seededRandom(seed + 2);
        const rng4 = seededRandom(seed + 3);

        const baseAngle = regionBaseAngles.get(agent.region) ?? 0;

        // Spread within ~120° sector of the region's base angle + large random offset
        const phi = baseAngle + (rng1 - 0.5) * 2.2;
        // Vertical spread from -0.7 to 0.7 (avoids poles)
        const cosTheta = (rng2 - 0.5) * 1.4;
        const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
        // Vary radius for depth
        const r = radius * (0.5 + rng3 * 0.5);

        const x = r * sinTheta * Math.cos(phi) + (rng4 - 0.5) * 6;
        const y = r * cosTheta + (seededRandom(seed + 4) - 0.5) * 8;
        const z = r * sinTheta * Math.sin(phi) + (seededRandom(seed + 5) - 0.5) * 6;

        positions.set(agent.id, [x, y, z]);
    });

    return positions;
}
