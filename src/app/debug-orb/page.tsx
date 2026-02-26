"use client";

import { Stage1Proto, Stage2Liquid, Stage3Hypercube } from "@/components/BreathingOrb";
import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export default function DebugOrbShowcase() {
    const { applyPreset } = useThemeStore();

    useEffect(() => {
        // Force a specific theme for best contrast if needed, or leave it.
        applyPreset("Cyber-Dark");
    }, [applyPreset]);

    return (
        <div className="flex flex-col min-h-screen bg-black text-white font-mono p-8 items-center justify-center space-y-12">
            <h1 className="text-3xl font-bold tracking-widest text-[#00ffcc]">MORPHOLOGICAL_EVOLUTION.EXE</h1>

            <div className="flex flex-row items-center justify-center w-full gap-16">

                {/* STAGE 1 */}
                <div className="flex flex-col items-center">
                    <h2 className="mb-8 text-xl text-white/60">LVL 1-9: PROTO-CORE</h2>
                    <div className="relative w-[300px] h-[300px] flex items-center justify-center border border-white/10 rounded-xl bg-white/5">
                        <Stage1Proto isLoading={false} handleClick={() => { }} />
                    </div>
                </div>

                {/* STAGE 2 */}
                <div className="flex flex-col items-center">
                    <h2 className="mb-8 text-xl text-white/60">LVL 10-29: LIQUID MATRIX</h2>
                    <div className="relative w-[300px] h-[300px] flex items-center justify-center border border-white/10 rounded-xl bg-white/5">
                        <Stage2Liquid isLoading={false} handleClick={() => { }} />
                    </div>
                </div>

                {/* STAGE 3 */}
                <div className="flex flex-col items-center">
                    <h2 className="mb-8 text-xl text-[#00ffcc] animate-pulse">LVL 30+: HYPERCUBE (MAX)</h2>
                    <div className="relative w-[300px] h-[300px] flex items-center justify-center border border-[#00ffcc]/30 rounded-xl bg-white/5 shadow-[0_0_50px_rgba(0,255,204,0.1)]">
                        <Stage3Hypercube isLoading={false} handleClick={() => { }} />
                    </div>
                </div>

            </div>
        </div>
    );
}
