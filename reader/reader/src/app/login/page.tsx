"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn, signInWithGoogle } = useAuth();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await signIn(email, password);

            // Redirect to returnUrl if provided, otherwise to homepage
            const returnUrl = searchParams.get('returnUrl') || '/';
            router.push(returnUrl);
        } catch (err) {
            // Error is already set in AuthContext, but we can also set it locally
            setError(err instanceof Error ? err.message : 'An error occurred. Please try again');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);

        try {
            await signInWithGoogle();
            // Redirect to homepage after successful Google login
            router.push('/');
        } catch (err) {
            // Error is handled in AuthContext
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md space-y-12 relative z-10 text-center">
                <header className="space-y-4">
                    <Link href="/" className="text-2xl font-black tracking-tighter text-white uppercase italic">Vellum</Link>
                    <p className="text-[10px] uppercase tracking-[0.6em] text-zinc-500 font-bold">Authentication Node</p>
                </header>

                <div className="glass-panel p-10 rounded-3xl border border-white/5 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                                {error}
                            </div>
                        )}

                        <input
                            type="email"
                            placeholder="ARCHIVIST MAIL"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-6 py-4 text-xs font-black tracking-widest focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-zinc-700 disabled:opacity-50"
                        />

                        <input
                            type="password"
                            placeholder="ACCESS CODE"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-6 py-4 text-xs font-black tracking-widest focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-zinc-700 disabled:opacity-50"
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Authenticating...' : 'Enter Archives'}
                        </button>

                        <div className="relative py-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="bg-black px-4 text-zinc-600">or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isLoading ? 'Authenticating...' : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                                        <path fill="#FFFFFF" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                                    </svg>
                                    Google
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                    New Archivist? <Link href="/signup" className="text-white hover:text-[var(--accent-sakura)] transition-colors">Join the Archives</Link>
                </p>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="text-white">Loading...</div>
            </main>
        }>
            <LoginForm />
        </Suspense>
    );
}
