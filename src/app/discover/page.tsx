import { SocialFeed } from "@/components/SocialFeed";

export const metadata = {
    title: "Discover — Tamagotchi",
    description: "See what's happening in your circle",
};

export default function DiscoverPage() {
    return (
        <div className="mx-auto max-w-lg px-4 pb-28 pt-10">
            {/* Header */}
            <h1 className="mb-8 text-center text-xs font-medium uppercase tracking-[0.25em] text-white/25">
                Discover
            </h1>

            <SocialFeed />
        </div>
    );
}
