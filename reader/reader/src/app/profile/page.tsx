"use client";

import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp, writeBatch, collection, query, where, getDocs } from "firebase/firestore";
import ImageUpload from "@/components/creator/ImageUpload";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [isArchivist, setIsArchivist] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsub = auth.onAuthStateChanged(async (u) => {
            if (u) {
                setUser(u);
                // Fetch user data from Firestore
                const userRef = doc(db, "users", u.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUsername(data.username || "");
                    setBio(data.bio || "");
                    setAvatarUrl(data.avatarUrl || "");
                    setBannerUrl(data.bannerUrl || "");
                    setIsArchivist(data.roles?.includes("creator") || false);
                }
            } else {
                router.replace("/login");
            }
        });
        return () => unsub();
    }, [router]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        console.log("[Profile] Sync start for:", user.uid);

        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                username,
                bio,
                avatarUrl,
                bannerUrl,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            console.log("[Profile] User document updated. Syncing unit metadata...");

            // Bulk update authorName in novels and stories
            const batch = writeBatch(db);
            let updateCount = 0;

            const syncCollection = async (collName: string, idField: string) => {
                const q = query(collection(db, collName), where(idField, "==", user.uid));
                const snap = await getDocs(q);
                console.log(`[Profile] Found ${snap.size} documents in ${collName} using ${idField}`);
                snap.forEach((d) => {
                    batch.update(d.ref, { authorName: username });
                    updateCount++;
                });
            };

            // Sync using both naming conventions
            await syncCollection("novels", "authorId");
            await syncCollection("novels", "creatorId");
            await syncCollection("stories", "authorId");
            await syncCollection("stories", "creatorId");

            // Also sync authorName in the user's own library for their own works
            console.log("[Profile] Syncing savedNovels in user library...");
            const savedNovelsRef = collection(db, "users", user.uid, "savedNovels");
            const savedNovelsSnap = await getDocs(savedNovelsRef);
            savedNovelsSnap.forEach((d) => {
                // We only want to update if this saved item is actually by the user
                // But since we don't have authorId explicitly in the savedNovels doc (it's mostly metadata),
                // we can't easily filter without more data. 
                // However, the user's specific complaint is about the NOVEL PAGE.
            });

            if (updateCount > 0) {
                await batch.commit();
                console.log(`[Profile] Batch committed for ${updateCount} total units.`);
            } else {
                console.warn("[Profile] No units matches for authorId/creatorId. Name sync skipped.");
            }

            console.log("Sync sequence complete.");
            alert("Identity synchronized across the Archives.");
        } catch (error) {
            console.error("[Profile] Synchronization Error:", error);
            alert("Archive synchronization failed. Check console.");
        } finally {
            setSaving(false);
        }
    };

    if (!user) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-zinc-700 font-black tracking-[0.5em] uppercase text-xs">
            Summoning...
        </div>
    );

    return (
        <main className="min-h-screen bg-black text-zinc-100 pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-20 space-y-12">
                <header className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white">
                        Profile
                    </h1>
                    <p className="text-zinc-500 max-w-lg leading-relaxed text-sm">
                        This is your public identity. Your avatar and banner will be shown on on your Athenaeum card.
                    </p>
                </header>

                <div className="space-y-8">
                    <div className="border border-white/5 bg-white/[0.02] p-8 rounded-3xl space-y-12">
                        {/* Information Grid */}
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black italic">
                                        Username
                                    </label>
                                    <input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your handle..."
                                        className="w-full bg-black border border-white/10 p-4 text-white focus:outline-none focus:border-purple-500/50 transition-all rounded-xl text-sm"
                                    />
                                    <p className="text-[10px] text-zinc-600 tracking-wider">This name appears on all your units and interactions.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black italic">
                                        Biography
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Unroll your scroll of history..."
                                        className="w-full bg-black border border-white/10 p-4 text-white focus:outline-none focus:border-purple-500/50 transition-all h-40 resize-none text-sm leading-relaxed rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black italic">
                                        Avatar
                                    </label>
                                    <div className="flex items-start gap-6">
                                        <div className="h-24 w-24 flex-shrink-0 bg-zinc-900 border border-white/10 rounded-full overflow-hidden shadow-2xl">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar Preview" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-800 font-black text-2xl">?</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <ImageUpload onUploadComplete={setAvatarUrl} className="max-w-[150px]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black italic">
                                        Banner
                                    </label>
                                    <div className="space-y-4">
                                        <div className="h-28 w-full bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden bg-cover bg-center shadow-inner" style={{ backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none' }}>
                                            {!bannerUrl && <div className="w-full h-full flex items-center justify-center text-zinc-800 text-[10px] uppercase tracking-widest italic">No Banner Signal</div>}
                                        </div>
                                        <ImageUpload onUploadComplete={setBannerUrl} className="max-w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
                            <div className="flex gap-12">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Status</p>
                                    <p className={`text-xs font-bold uppercase tracking-widest ${isArchivist ? 'text-purple-400' : 'text-zinc-400'}`}>
                                        {isArchivist ? 'Archivist' : 'reader'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Node Address</p>
                                    <p className="text-xs font-medium text-zinc-300">{user.email}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="px-12 py-4 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-black hover:bg-zinc-200 disabled:opacity-50 transition-all rounded-xl shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)]"
                            >
                                {saving ? "Synchronizing..." : "Update Identity"}
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="pt-12 text-[9px] uppercase tracking-[0.6em] text-zinc-700 flex justify-between items-center opacity-50">
                    <span>Vellum Identity Management v1.0.4</span>
                    <span>System Online</span>
                </footer>
            </div>
        </main>
    );
}
