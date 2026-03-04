import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { EffectComposer, Glitch, ChromaticAberration } from '@react-three/postprocessing';
import { GlitchMode, BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useThemeStore } from '../store/useThemeStore';
import { usePetStore, type PetGenes, type CreaturePart } from '../store/usePetStore';

/* ═══════════════════════════════════════════════════════════════════════════
   MATERIAL FACTORY — creates a cyber material based on genes
   ═══════════════════════════════════════════════════════════════════════════ */
function useCyberMaterial(genes: PetGenes, colorOverride?: string) {
    const effectiveColor = colorOverride || genes.baseColor;
    return useMemo(() => {
        switch (genes.materialType) {
            case 'Glass':
                return new THREE.MeshPhysicalMaterial({
                    color: effectiveColor,
                    transmission: 0.92,
                    opacity: 1,
                    transparent: true,
                    metalness: 0.0,
                    roughness: 0.05,
                    ior: 1.5,
                    thickness: 1.5,
                    envMapIntensity: 1.5,
                });
            case 'LiquidMetal':
                return new THREE.MeshStandardMaterial({
                    color: effectiveColor,
                    emissive: genes.emissiveColor,
                    emissiveIntensity: genes.emissiveIntensity * 0.3,
                    metalness: 1.0,
                    roughness: 0.08,
                    wireframe: genes.wireframe,
                });
            case 'Hologram':
                return new THREE.MeshBasicMaterial({
                    color: effectiveColor,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.7,
                });
            case 'MattePlastic':
                return new THREE.MeshStandardMaterial({
                    color: effectiveColor,
                    emissive: genes.emissiveColor,
                    emissiveIntensity: genes.emissiveIntensity * 0.2,
                    roughness: 0.8,
                    metalness: 0.1,
                    wireframe: genes.wireframe,
                });
            default:
                return new THREE.MeshStandardMaterial({ color: effectiveColor });
        }
    }, [genes.materialType, effectiveColor, genes.emissiveColor, genes.emissiveIntensity, genes.wireframe]);
}

/* ═══════════════════════════════════════════════════════════════════════════
   GEOMETRY FACTORY — returns JSX geometry from shape name
   ═══════════════════════════════════════════════════════════════════════════ */
function ShapeGeometry({ shape }: { shape: string }) {
    switch (shape) {
        case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />;
        case 'box': return <boxGeometry args={[1, 1, 1]} />;
        case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 16]} />;
        case 'cone': return <coneGeometry args={[0.5, 1, 16]} />;
        case 'torus': return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
        case 'torusKnot': return <torusKnotGeometry args={[0.4, 0.15, 64, 16]} />;
        case 'icosahedron': return <icosahedronGeometry args={[0.5, 1]} />;
        case 'octahedron': return <octahedronGeometry args={[0.5, 0]} />;
        case 'ring': return <torusGeometry args={[0.5, 0.02, 8, 64]} />;
        default: return <sphereGeometry args={[0.5, 32, 32]} />;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED PART — a single body part with its animation
   ═══════════════════════════════════════════════════════════════════════════ */
const AnimatedPart = ({ part, material, speedMult, index }: {
    part: CreaturePart;
    material: THREE.Material;
    speedMult: number;
    index: number;
}) => {
    const ref = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Clamp values to safe ranges
    const pos = (part.position || [0, 0, 0]).map(v => Math.max(-3, Math.min(3, v))) as [number, number, number];
    const scl = (part.scale || [0.5, 0.5, 0.5]).map(v => Math.max(0.15, Math.min(3, v))) as [number, number, number];
    const rot = (part.rotation || [0, 0, 0]) as [number, number, number];
    const anim = part.animation || 'none';

    // Phase offset so parts don't all sync
    const phase = index * 1.3;

    useFrame((state) => {
        const t = state.clock.elapsedTime * speedMult;
        if (!ref.current) return;

        switch (anim) {
            case 'rotate':
                ref.current.rotation.y = t * 0.8 + phase;
                ref.current.rotation.x = Math.sin(t * 0.3 + phase) * 0.2;
                break;
            case 'bob':
                ref.current.position.y = pos[1] + Math.sin(t * 1.5 + phase) * 0.3;
                break;
            case 'pulse': {
                const breathe = 1 + Math.sin(t * 1.2 + phase) * 0.08;
                ref.current.scale.set(scl[0] * breathe, scl[1] * breathe, scl[2] * breathe);
                break;
            }
            case 'wave':
                ref.current.rotation.z = Math.sin(t * 2 + phase) * 0.4;
                ref.current.rotation.x = Math.cos(t * 1.5 + phase) * 0.2;
                break;
            case 'orbit': {
                const orbitR = Math.max(scl[0], scl[1]) * 0.5;
                if (groupRef.current) {
                    groupRef.current.rotation.y = t * 0.5 + phase;
                    groupRef.current.rotation.x = Math.sin(t * 0.2 + phase) * 0.3;
                }
                break;
            }
        }
    });

    if (anim === 'orbit') {
        return (
            <group ref={groupRef}>
                <mesh ref={ref} position={pos} rotation={rot} scale={scl} material={material}>
                    <ShapeGeometry shape={part.shape} />
                </mesh>
            </group>
        );
    }

    return (
        <mesh ref={ref} position={pos} rotation={rot} scale={scl} material={material}>
            <ShapeGeometry shape={part.shape} />
        </mesh>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   GENERATIVE CREATURE — renders any parts array the LLM provides
   ═══════════════════════════════════════════════════════════════════════════ */
export const GenerativeCreature = ({ genes, speedMult }: { genes: PetGenes; speedMult: number }) => {
    const baseMat = useCyberMaterial(genes);

    // Build materials for parts that override color
    const parts = genes.parts || [];

    return (
        <group>
            {parts.map((part, i) => {
                // If part has a color override, create a separate material
                const mat = part.color ? (() => {
                    const m = baseMat.clone();
                    (m as any).color = new THREE.Color(part.color);
                    return m;
                })() : baseMat;

                return (
                    <AnimatedPart
                        key={i}
                        part={part}
                        material={mat}
                        speedMult={speedMult}
                        index={i}
                    />
                );
            })}
            {/* Inner glow core */}
            <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial color={genes.emissiveColor} transparent opacity={0.4} />
            </mesh>
        </group>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PET SHELL — handles rotation, glitch transitions, and lighting
   ═══════════════════════════════════════════════════════════════════════════ */
const TheDynamicPet = () => {
    const outerRef = useRef<THREE.Group>(null);

    const genes = usePetStore((s) => s.genes);
    const themePrimary = useThemeStore((s) => s.currentTheme.colors.primary);
    const mood = usePetStore((s) => s.mood);
    const isTransitioning = usePetStore((s) => s.isTransitioning);

    const [isMorphing, setIsMorphing] = useState(false);
    // Trigger on any meaningful change
    const triggerString = JSON.stringify(genes.parts?.map(p => p.shape + p.animation)) + genes.materialType + genes.baseColor;
    const [prevTrigger, setPrevTrigger] = useState(triggerString);

    useEffect(() => {
        if (triggerString !== prevTrigger) {
            setIsMorphing(true);
            setPrevTrigger(triggerString);
            setTimeout(() => { setIsMorphing(false); }, 800);
        }
    }, [triggerString, prevTrigger]);

    const speedMultiplier = mood === 'excited' ? 2.5 : mood === 'emo' ? 0.4 : 1;

    useFrame((state, delta) => {
        if (outerRef.current) {
            // Normal rotation + fast spin during transition
            const transitionBoost = isTransitioning ? 4.0 : 1.0;
            outerRef.current.rotation.y += delta * 0.12 * speedMultiplier * transitionBoost;
            outerRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.06;

            // Pulsing scale during transition
            if (isTransitioning) {
                const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.12;
                outerRef.current.scale.setScalar(0.85 * pulse);
            } else {
                outerRef.current.scale.setScalar(0.85);
            }
        }
    });

    // Show effects during transition OR morph
    const showEffects = isMorphing || isTransitioning;

    return (
        <group>
            <group ref={outerRef} position={[0, -0.3, 0]} scale={0.85}>
                <GenerativeCreature genes={genes} speedMult={isTransitioning ? speedMultiplier * 3 : speedMultiplier} />
            </group>

            <pointLight
                color={genes.emissiveColor || themePrimary}
                intensity={isTransitioning ? genes.emissiveIntensity * 20 : genes.emissiveIntensity * 8}
                distance={10}
                position={[0, -0.3, 0]}
            />

            {showEffects && (
                <EffectComposer>
                    <Glitch
                        duration={new THREE.Vector2(0.3, 0.8)}
                        mode={isTransitioning ? GlitchMode.CONSTANT_WILD : GlitchMode.SPORADIC}
                        active
                        ratio={isTransitioning ? 0.4 : 0.85}
                    />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={new THREE.Vector2(isTransitioning ? 0.008 : 0.02, isTransitioning ? 0.008 : 0.02)}
                    />
                </EffectComposer>
            )}
        </group>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTED CANVAS WRAPPER
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ThreeDPet() {
    const genes = usePetStore((s) => s.genes);
    return (
        <div style={{ position: 'absolute', inset: 0 }}>
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <Environment preset="city" />
                <Float speed={2 * genes.spinSpeed} rotationIntensity={0.5} floatIntensity={1.5 * genes.floatHeight}>
                    <TheDynamicPet />
                </Float>
            </Canvas>
        </div>
    );
}
