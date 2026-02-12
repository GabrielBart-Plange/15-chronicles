"use client";

import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MobileNav from "@/components/creator/MobileNav";
import Sidebar from "@/components/creator/Sidebar";
import { useTheme } from "@/components/creator/theme-provider";

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => {
            if (u) {
                setUser(u);
            } else {
                router.replace("/login");
            }
        });
        return () => unsub();
    }, [router]);

    if (!user) return null;

    return (
        <section className="space-y-12">
            <header className="space-y-4">
                <h1 className="text-2xl tracking-[0.2em] font-light uppercase text-[var(--foreground)]">
                    Studio Settings
                </h1>
                <p className="text-[var(--reader-text)]/70 max-w-lg leading-relaxed">
                    Technical configurations and account management for your creative residency.
                </p>
            </header>

            <div className="max-w-xl space-y-10">
                {/* Account Security */}
                <div className="space-y-6">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-[var(--reader-text)]/60 font-bold border-b border-[var(--reader-border)] pb-2">
                        Account & Security
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[var(--reader-border)]/10 border border-[var(--reader-border)] rounded-sm">
                            <div className="space-y-1">
                                <p className="text-sm text-[var(--foreground)] uppercase tracking-widest leading-none">Email Address</p>
                                <p className="text-xs text-[var(--reader-text)]">{user.email}</p>
                            </div>
                            <button className="text-[10px] uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                                Change
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[var(--reader-border)]/10 border border-[var(--reader-border)] rounded-sm">
                            <div className="space-y-1">
                                <p className="text-sm text-[var(--foreground)] uppercase tracking-widest leading-none">Password</p>
                                <p className="text-xs text-[var(--reader-text)]">Last changed: —</p>
                            </div>
                            <button className="text-[10px] uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications & Preferences */}
                <div className="space-y-6">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-[var(--reader-text)]/60 font-bold border-b border-[var(--reader-border)] pb-2">
                        Preferences
                    </h2>

                    <div className="space-y-4">
                        {/* Theme Selection */}
                        <div className="space-y-3 pt-2">
                            <p className="text-xs text-[var(--reader-text)] uppercase tracking-widest">Theme</p>
                            <div className="flex gap-2">
                                {(['void', 'archive', 'nebula', 'light'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-all ${theme === t
                                            ? "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                                            : "border-[var(--reader-border)] text-[var(--reader-text)] hover:border-[var(--reader-text)] hover:text-[var(--foreground)]"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-[var(--reader-text)] uppercase tracking-widest">Discord Integration</p>
                            <span className="text-[10px] text-[var(--reader-text)]/70 uppercase tracking-widest">Coming Soon</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-10 space-y-4">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-red-900/70 font-bold border-b border-red-900/10 pb-2">
                        Danger Zone
                    </h2>
                    <p className="text-[10px] text-[var(--reader-text)] italic">
                        Permanent actions that cannot be undone. Exercise caution.
                    </p>
                    <button className="text-[10px] uppercase tracking-widest text-red-900/50 hover:text-red-500 transition-colors">
                        Delete Creator Account
                    </button>
                </div>
            </div>

            <footer className="pt-12 text-[10px] uppercase tracking-[0.4em] text-gray-800 border-t border-white/5">
                .15 Chronicles System v1.2.0
            </footer>
        </section>
    );
}
