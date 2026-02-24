"use client";

import { BottomNav } from "@/components/BottomNav";
import { PetHUD } from "@/components/PetHUD";
import { ThemeProvider } from "@/components/ThemeProvider";
import { VibeTransitionOverlay } from "@/components/VibeTransitionOverlay";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <VibeTransitionOverlay />
            <PetHUD />
            <main className="min-h-screen pb-24">{children}</main>
            <BottomNav />
        </ThemeProvider>
    );
}
