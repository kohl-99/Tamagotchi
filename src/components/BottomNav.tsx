"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass, Settings } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

const navItems = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "discover", label: "Discover", icon: Compass, href: "/discover" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
] as const;

export function BottomNav() {
    const pathname = usePathname();
    const theme = useThemeStore((s) => s.currentTheme);

    return (
        <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            {/* Floating glassmorphism pill */}
            <div
                className="flex items-center gap-1 border
                   px-3 py-2 shadow-2xl vibe-transition"
                style={{
                    background: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder,
                    borderRadius: theme.geometry.radiusLg,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    backdropFilter: `blur(${theme.effects.blurHeavy})`,
                    WebkitBackdropFilter: `blur(${theme.effects.blurHeavy})`,
                }}
            >
                {navItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link key={item.id} href={item.href}>
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className="relative flex flex-col items-center gap-1 px-5 py-2
                           rounded-xl outline-none focus:outline-none"
                            >
                                {/* Active background glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active-bg"
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            background:
                                                `radial-gradient(ellipse at center, ${theme.colors.glow} 0%, transparent 70%)`,
                                        }}
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}

                                {/* Icon */}
                                <motion.div
                                    animate={{
                                        color: isActive ? theme.colors.primary : theme.colors.textMuted,
                                        scale: isActive ? 1.1 : 1,
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                                </motion.div>

                                {/* Label */}
                                <span
                                    className="text-[10px] font-medium tracking-wide transition-colors duration-200"
                                    style={{ color: isActive ? theme.colors.primary : theme.colors.textMuted }}
                                >
                                    {item.label}
                                </span>

                                {/* Active dot indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-dot"
                                        className="absolute -bottom-0.5 h-[3px] w-5 rounded-full"
                                        style={{
                                            background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.primarySoft})`,
                                        }}
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
