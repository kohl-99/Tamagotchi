import { MoodboardSwipe } from "@/components/MoodboardSwipe";

export const metadata = {
    title: "Onboarding — Tamagotchi",
    description: "Shape your cyber-soul",
};

export default function OnboardingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-6">
            {/* Ambient background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div
                    className="glow-pulse absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ background: "rgba(124,58,237,0.12)" }}
                />
            </div>

            {/* Heading */}
            <h1 className="mb-4 text-center text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: "var(--vibe-text)" }}>
                What speaks to you?
            </h1>

            {/* Swipe area */}
            <div
                className="relative w-full max-w-[400px]"
                style={{ height: "min(48vh, 440px)" }}
            >
                <MoodboardSwipe />
            </div>
        </div>
    );
}
