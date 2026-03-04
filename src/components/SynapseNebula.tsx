"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, OrbitControls, Html, Float, Environment } from "@react-three/drei";
import { EffectComposer, Glitch, ChromaticAberration } from "@react-three/postprocessing";
import { GlitchMode, BlendFunction } from "postprocessing";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
    mockAgents, stormArtifacts,
    REGIONS, getScatteredPositions,
    type MockAgent, type CrystalArtifact, type RegionInfo,
} from "@/lib/mockAgents";
import { GenerativeCreature } from "@/components/ThreeDPet";
import { useThemeStore } from "@/store/useThemeStore";
import { usePetStore } from "@/store/usePetStore";

/* ═══════════════════════════════════════════════════════════════════════════
   DATA RAIN — falling particles during monsoon
   ═══════════════════════════════════════════════════════════════════════════ */
const DataRain = () => {
    const count = 3000;
    const ref = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 80;     // x
            arr[i * 3 + 1] = Math.random() * 60 - 10;     // y
            arr[i * 3 + 2] = (Math.random() - 0.5) * 80;  // z
        }
        return arr;
    }, []);

    useFrame((_, delta) => {
        if (!ref.current) return;
        const posAttr = ref.current.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < count; i++) {
            arr[i * 3 + 1] -= delta * 25; // fall speed
            if (arr[i * 3 + 1] < -15) {
                arr[i * 3 + 1] = 50 + Math.random() * 10;
                arr[i * 3] = (Math.random() - 0.5) * 80;
                arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
            }
        }
        posAttr.needsUpdate = true;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                    count={count}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#00ff88"
                size={0.08}
                transparent
                opacity={0.7}
                sizeAttenuation
            />
        </points>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   STORM FOG — dynamic fog that lerps color during monsoon
   ═══════════════════════════════════════════════════════════════════════════ */
const StormFog = ({ isMonsoon }: { isMonsoon: boolean }) => {
    const fogRef = useRef<THREE.Fog>(null);
    const calmColor = useMemo(() => new THREE.Color("#000005"), []);
    const stormColor = useMemo(() => new THREE.Color("#3a0018"), []);
    const targetColor = useMemo(() => new THREE.Color(), []);

    useFrame(() => {
        if (!fogRef.current) return;
        targetColor.copy(isMonsoon ? stormColor : calmColor);
        fogRef.current.color.lerp(targetColor, 0.02);
        const targetNear = isMonsoon ? 15 : 40;
        const targetFar = isMonsoon ? 100 : 150;
        fogRef.current.near += (targetNear - fogRef.current.near) * 0.02;
        fogRef.current.far += (targetFar - fogRef.current.far) * 0.02;
    });

    return <fog ref={fogRef} attach="fog" args={["#000005", 40, 150]} />;
};

/* ═══════════════════════════════════════════════════════════════════════════
   THUNDER GLITCH — random flashes during monsoon
   ═══════════════════════════════════════════════════════════════════════════ */
const ThunderGlitch = ({ isMonsoon }: { isMonsoon: boolean }) => {
    const [active, setActive] = useState(false);

    useFrame((state) => {
        if (!isMonsoon) { if (active) setActive(false); return; }
        // Trigger flash randomly every ~3-5 seconds
        const t = state.clock.elapsedTime;
        const shouldFlash = Math.sin(t * 1.7) > 0.98 || Math.sin(t * 2.3) > 0.97;
        if (shouldFlash !== active) setActive(shouldFlash);
    });

    if (!active) return null;

    return (
        <EffectComposer>
            <Glitch
                duration={new THREE.Vector2(0.1, 0.3)}
                mode={GlitchMode.CONSTANT_WILD}
                active
                ratio={0.3}
            />
            <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new THREE.Vector2(0.015, 0.015)}
            />
        </EffectComposer>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   FARADAY SHIELD — wireframe icosahedron around shielded creatures
   ═══════════════════════════════════════════════════════════════════════════ */
const FaradayShield = ({ color }: { color: string }) => {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime;
        ref.current.rotation.y = t * 0.3;
        ref.current.rotation.x = t * 0.2;
        const pulse = 0.6 + Math.sin(t * 4) * 0.15;
        (ref.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    });

    return (
        <mesh ref={ref} scale={1.8}>
            <icosahedronGeometry args={[1, 1]} />
            <meshBasicMaterial
                color={color}
                wireframe
                transparent
                opacity={0.5}
            />
        </mesh>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CRYSTAL MESH — floating octahedron near a creature
   ═══════════════════════════════════════════════════════════════════════════ */
const CrystalMesh = ({
    crystal,
    index,
    onClick,
}: {
    crystal: CrystalArtifact;
    index: number;
    onClick: () => void;
}) => {
    const ref = useRef<THREE.Mesh>(null);
    const colorMap = { vibe: "#4da6ff", skill: "#c084fc", intel: "#f97316", storm: "#ff1744" };
    const color = colorMap[crystal.type];
    const offset = (index - 0.5) * 2.5;

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime;
        ref.current.rotation.y = t * 0.5;
        ref.current.rotation.x = t * 0.3;
        ref.current.position.y = Math.sin(t * 1.5 + index) * 0.2;
    });

    return (
        <mesh
            ref={ref}
            position={[offset, 1.5, 0]}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={(e) => { (e.object as THREE.Mesh).scale.setScalar(1.3); document.body.style.cursor = "pointer"; }}
            onPointerOut={(e) => { (e.object as THREE.Mesh).scale.setScalar(1.0); document.body.style.cursor = "auto"; }}
        >
            <octahedronGeometry args={[crystal.type === "storm" ? 0.45 : 0.3, 0]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={crystal.type === "storm" ? 4 : 2}
                transparent
                opacity={0.85}
            />
            <pointLight color={color} intensity={crystal.type === "storm" ? 6 : 3} distance={4} />
        </mesh>
    );
};

/* Constellation component removed — agents now render directly in NebulaScene */

/* ═══════════════════════════════════════════════════════════════════════════
   AGENT NODE — a free-floating glowing point in the nebula
   ═══════════════════════════════════════════════════════════════════════════ */
const AgentNode = ({
    agent,
    worldPosition,
    isSelected,
    onSelect,
}: {
    agent: MockAgent;
    worldPosition: [number, number, number];
    isSelected: boolean;
    onSelect: (agent: MockAgent) => void;
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const baseSize = 0.15 + (agent.resonance / 100) * 0.45;
    const glowIntensity = 1 + (agent.resonance / 100) * 8;

    useFrame((state) => {
        if (!meshRef.current || isSelected) return;
        const breath = 1 + Math.sin(state.clock.elapsedTime * 2 + agent.resonance) * 0.08;
        meshRef.current.scale.setScalar(baseSize * breath);
    });

    if (isSelected) {
        if (hovered) setHovered(false);
        return null;
    }

    return (
        <group position={worldPosition}>
            <mesh
                ref={meshRef}
                frustumCulled={false}
                onClick={(e) => { e.stopPropagation(); onSelect(agent); }}
                onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
                onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
            >
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color={agent.genes.emissiveColor} transparent opacity={0.9} />
            </mesh>

            <pointLight color={agent.genes.emissiveColor} intensity={glowIntensity} distance={5 + agent.resonance / 10} />

            {/* Halo for high-resonance */}
            {agent.resonance > 70 && (
                <mesh rotation={[Math.PI / 2, 0, 0]} frustumCulled={false}>
                    <torusGeometry args={[baseSize * 2.5, 0.02, 8, 32]} />
                    <meshBasicMaterial color={agent.genes.emissiveColor} transparent opacity={0.4} />
                </mesh>
            )}

            {/* Hover label */}
            {hovered && (
                <Html center style={{ pointerEvents: "none", transform: "translateY(-30px)" }}>
                    <div style={{
                        background: "rgba(0,0,0,0.9)",
                        border: `1px solid ${agent.genes.emissiveColor}`,
                        borderRadius: 10,
                        padding: "8px 16px",
                        whiteSpace: "nowrap",
                        fontFamily: "monospace",
                        fontSize: 14,
                        color: agent.genes.emissiveColor,
                        boxShadow: `0 0 24px ${agent.genes.emissiveColor}50`,
                        backdropFilter: "blur(10px)",
                    }}>
                        <span style={{ opacity: 0.5 }}>Signal: </span>
                        <strong>{agent.name}</strong>
                        <span style={{ opacity: 0.4 }}> | </span>
                        <span style={{ opacity: 0.6 }}>{agent.title}</span>
                    </div>
                </Html>
            )}
        </group>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   WARPED CREATURE VIEW — shows creature + crystals + shield when selected
   ═══════════════════════════════════════════════════════════════════════════ */
const WarpedCreature = ({
    agent,
    worldPosition,
    isMonsoon,
    onCrystalClick,
}: {
    agent: MockAgent;
    worldPosition: [number, number, number];
    isMonsoon: boolean;
    onCrystalClick: (crystal: CrystalArtifact) => void;
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const region = useMemo(() => REGIONS.find((r) => r.id === agent.region), [agent]);
    const regionColor = region?.color ?? "#ffffff";

    // Storm core artifacts appear near KL during monsoon
    const allCrystals = useMemo(() => {
        if (isMonsoon && agent.region === "KualaLumpur") {
            return [...agent.crystals, ...stormArtifacts.slice(0, 1)];
        }
        return agent.crystals;
    }, [isMonsoon, agent]);

    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
    });

    return (
        <group position={worldPosition}>
            <Float speed={2} rotationIntensity={0.3} floatIntensity={1}>
                <group ref={groupRef}>
                    <GenerativeCreature genes={agent.genes} speedMult={1} />
                    {/* Faraday shield if agent is shielded during storm */}
                    {isMonsoon && agent.isShielded && (
                        <FaradayShield color={regionColor} />
                    )}
                </group>
            </Float>

            {allCrystals.map((crystal, i) => (
                <CrystalMesh
                    key={crystal.id}
                    crystal={crystal}
                    index={i}
                    onClick={() => onCrystalClick(crystal)}
                />
            ))}

            <Html center position={[0, 2.5, 0]} style={{ pointerEvents: "none" }}>
                <div style={{
                    fontFamily: "monospace",
                    fontSize: 14,
                    color: agent.genes.emissiveColor,
                    textShadow: `0 0 12px ${agent.genes.emissiveColor}`,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                }}>
                    <div style={{ fontWeight: "bold" }}>{agent.name}</div>
                    <div style={{ opacity: 0.5, fontSize: 10 }}>{agent.title} · Resonance {agent.resonance}</div>
                    {isMonsoon && agent.isShielded && (
                        <div style={{ color: "#00ff88", fontSize: 9, marginTop: 2 }}>⬡ SHIELD ACTIVE</div>
                    )}
                </div>
            </Html>
        </group>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CAMERA CONTROLLER
   ═══════════════════════════════════════════════════════════════════════════ */
const CameraController = ({ target, active }: { target: [number, number, number] | null; active: boolean }) => {
    const { camera } = useThree();
    const startPos = useRef(new THREE.Vector3(0, 8, 45));
    const targetVec = useMemo(() => {
        if (!target) return new THREE.Vector3(0, 8, 45);
        return new THREE.Vector3(target[0], target[1], target[2] + 5);
    }, [target]);

    useFrame(() => {
        camera.position.lerp(active ? targetVec : startPos.current, 0.04);
    });

    return null;
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEBULA SCENE — the full 3D inner scene (organic free-scatter layout)
   ═══════════════════════════════════════════════════════════════════════════ */
const NebulaScene = ({
    selectedAgent,
    onSelectAgent,
    onCrystalClick,
}: {
    selectedAgent: MockAgent | null;
    onSelectAgent: (agent: MockAgent) => void;
    onCrystalClick: (crystal: CrystalArtifact) => void;
}) => {
    const isMonsoon = usePetStore((s) => s.nebulaWeather === "monsoon");

    // Compute scattered world positions (deterministic, stable across renders)
    const scatteredPositions = useMemo(() => getScatteredPositions(), []);

    // Camera target = scattered world position of selected agent
    const cameraTarget = useMemo<[number, number, number] | null>(() => {
        if (!selectedAgent) return null;
        return scatteredPositions.get(selectedAgent.id) ?? null;
    }, [selectedAgent, scatteredPositions]);

    return (
        <>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={isMonsoon ? 0.08 : 0.15} />
            <Environment preset="night" />

            {/* Dynamic fog */}
            <StormFog isMonsoon={isMonsoon} />

            {/* Data rain during monsoon */}
            {isMonsoon && <DataRain />}

            {/* Thunder glitch during monsoon */}
            <ThunderGlitch isMonsoon={isMonsoon} />

            {/* Camera */}
            <OrbitControls
                enableZoom maxDistance={70} minDistance={3}
                enablePan={false}
                autoRotate={!selectedAgent}
                autoRotateSpeed={0.2}
                enabled={!selectedAgent}
            />
            <CameraController target={cameraTarget} active={!!selectedAgent} />

            {/* Free-floating agent nodes */}
            {mockAgents.map((agent) => (
                <AgentNode
                    key={agent.id}
                    agent={agent}
                    worldPosition={scatteredPositions.get(agent.id) ?? [0, 0, 0]}
                    isSelected={selectedAgent?.id === agent.id}
                    onSelect={onSelectAgent}
                />
            ))}

            {/* Warped creature when selected */}
            {selectedAgent && (
                <WarpedCreature
                    agent={selectedAgent}
                    worldPosition={scatteredPositions.get(selectedAgent.id) ?? [0, 0, 0]}
                    isMonsoon={isMonsoon}
                    onCrystalClick={onCrystalClick}
                />
            )}
        </>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   BLUEPRINT CARD — HTML overlay for crystal details
   ═══════════════════════════════════════════════════════════════════════════ */
const BlueprintCard = ({
    crystal,
    agentName,
    onClose,
}: {
    crystal: CrystalArtifact;
    agentName: string;
    onClose: () => void;
}) => {
    const typeLabels = { vibe: "VIBE GENES", skill: "SKILL PACK", intel: "INTEL", storm: "⚡ STORM ARTIFACT" };
    const typeColors = { vibe: "#4da6ff", skill: "#c084fc", intel: "#f97316", storm: "#ff1744" };
    const actionLabels = { vibe: "Fork Genes", skill: "Install Skill", intel: "Decrypt", storm: "Extract Core" };
    const typeColor = typeColors[crystal.type];

    return (
        <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-80"
        >
            <div
                className="rounded-2xl p-5 border"
                style={{
                    background: crystal.type === "storm" ? "rgba(60,0,20,0.9)" : "rgba(0,0,0,0.85)",
                    borderColor: `${typeColor}40`,
                    backdropFilter: "blur(20px)",
                    boxShadow: `0 0 40px ${typeColor}15, inset 0 1px 0 ${typeColor}20`,
                }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: typeColor, boxShadow: `0 0 8px ${typeColor}` }} />
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: typeColor }}>
                        {typeLabels[crystal.type]}
                    </span>
                </div>

                <h3 className="text-white font-bold text-lg mb-1">{crystal.label}</h3>
                <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                    from <span style={{ color: typeColor }}>{agentName}</span>
                </p>
                <p className="text-[13px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {crystal.description}
                </p>

                <div className="flex gap-2">
                    <button
                        className="flex-1 py-2.5 rounded-xl text-[12px] font-bold tracking-wider uppercase transition-all hover:scale-105"
                        style={{
                            background: `linear-gradient(135deg, ${typeColor}, ${typeColor}88)`,
                            color: "#fff", border: "none",
                            boxShadow: `0 4px 20px ${typeColor}40`,
                        }}
                    >
                        {actionLabels[crystal.type]}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-[12px] font-medium tracking-wider uppercase transition-all hover:scale-105"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                        Close
                    </button>
                </div>
                <p className="text-[10px] mt-3 text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Cost: {crystal.type === "storm" ? "100" : "50"} Health Points
                </p>
            </div>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORTED COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function SynapseNebula() {
    const [selectedAgent, setSelectedAgent] = useState<MockAgent | null>(null);
    const [selectedCrystal, setSelectedCrystal] = useState<CrystalArtifact | null>(null);
    const weather = usePetStore((s) => s.nebulaWeather);
    const setWeather = usePetStore((s) => s.setNebulaWeather);
    const isMonsoon = weather === "monsoon";

    const handleSelectAgent = useCallback((agent: MockAgent) => {
        setSelectedCrystal(null);
        setSelectedAgent(agent);
    }, []);

    const handleDeselectAgent = useCallback(() => {
        setSelectedCrystal(null);
        setSelectedAgent(null);
    }, []);

    return (
        <div className="relative w-full h-full" style={{ background: "#000005" }}>
            <Canvas camera={{ position: [0, 8, 45], fov: 60 }}>
                <NebulaScene
                    selectedAgent={selectedAgent}
                    onSelectAgent={handleSelectAgent}
                    onCrystalClick={setSelectedCrystal}
                />
            </Canvas>

            {/* Back button */}
            <AnimatePresence>
                {selectedAgent && (
                    <motion.button
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onClick={handleDeselectAgent}
                        className="fixed top-6 left-6 z-50 px-4 py-2 rounded-xl text-[11px] font-medium tracking-wider uppercase hover:scale-105 transition-all"
                        style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.7)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        ← Return to Nebula
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Blueprint card */}
            <AnimatePresence>
                {selectedCrystal && selectedAgent && (
                    <BlueprintCard
                        crystal={selectedCrystal}
                        agentName={selectedAgent.name}
                        onClose={() => setSelectedCrystal(null)}
                    />
                )}
            </AnimatePresence>

            {/* Weather toggle + header */}
            <AnimatePresence>
                {!selectedAgent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-40 text-center"
                    >
                        <h1
                            className="text-[10px] font-medium uppercase tracking-[0.4em] pointer-events-none"
                            style={{ color: isMonsoon ? "#ff1744" : "rgba(255,255,255,0.25)" }}
                        >
                            {isMonsoon ? "⚡ DATA MONSOON ACTIVE ⚡" : "Synapse Nebula"}
                        </h1>
                        <p
                            className="text-[9px] mt-1 tracking-widest pointer-events-none"
                            style={{ color: isMonsoon ? "rgba(255,23,68,0.5)" : "rgba(255,255,255,0.12)" }}
                        >
                            {mockAgents.length} signals drifting
                        </p>

                        {/* Monsoon toggle */}
                        <button
                            onClick={() => setWeather(isMonsoon ? "calm" : "monsoon")}
                            className="mt-3 px-4 py-1.5 rounded-lg text-[10px] font-medium tracking-wider uppercase transition-all hover:scale-105"
                            style={{
                                background: isMonsoon ? "rgba(255,23,68,0.2)" : "rgba(255,255,255,0.06)",
                                color: isMonsoon ? "#ff1744" : "rgba(255,255,255,0.4)",
                                border: `1px solid ${isMonsoon ? "rgba(255,23,68,0.3)" : "rgba(255,255,255,0.1)"}`,
                            }}
                        >
                            {isMonsoon ? "☀ Clear Storm" : "⛈ Trigger Monsoon"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
