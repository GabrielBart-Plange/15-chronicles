"use client";

import { auth, db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, doc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";

type Draft = {
    id: string;
    title: string;
    type: "short" | "novel";
};

export default function DraftsPage() {
    const [drafts, setDrafts] = useState<Draft[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const ref = collection(db, "users", user.uid, "drafts");
                const q = query(ref, orderBy("updatedAt", "desc"));
                const snap = await getDocs(q);

                setDrafts(
                    snap.docs.map((d) => ({
                        id: d.id,
                        title: d.data().title || "Untitled",
                        type: d.data().type,
                    }))
                );
            } catch (error) {
                console.error("Error fetching drafts:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsub();
    }, []);

    const deleteDraft = async (id: string) => {
        const user = auth.currentUser;
        if (!user || !confirm("Are you sure you want to delete this draft?")) return;

        try {
            const ref = doc(db, "users", user.uid, "drafts", id);
            await deleteDoc(ref);
            setDrafts(drafts.filter((d) => d.id !== id));
        } catch (error) {
            console.error("Error deleting draft:", error);
            alert("Failed to delete draft.");
        }
    };

    return (
        <section className="space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="tracking-widest capitalize text-[var(--foreground)]">Drafts</h1>

                <Link
                    href="/dashboard/drafts/new"
                    className="border border-[var(--reader-border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
                >
                    New draft
                </Link>
            </header>

            {drafts.length === 0 ? (
                <p className="text-[var(--reader-text)]">No drafts yet.</p>
            ) : (
                <ul className="space-y-3">
                    {drafts.map((d) => (
                        <li key={d.id} className="group relative">
                            <Link
                                href={`/dashboard/drafts/${d.id}`}
                                className="block border border-[var(--reader-border)] p-4 hover:border-[var(--reader-text)] hover:bg-[var(--reader-border)]/10 transition-all"
                            >
                                <div className="flex justify-between items-start pr-12">
                                    <div>
                                        <p className="text-[var(--reader-text)] group-hover:text-[var(--foreground)]">{d.title || "Untitled"}</p>
                                        <p className="text-xs text-[var(--reader-text)]/70 uppercase tracking-widest mt-1">
                                            {d.type === "short" ? "Short story" : "Novel"}
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            <button
                                onClick={() => deleteDraft(d.id)}
                                className="absolute top-4 right-4 text-xs text-[var(--reader-text)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 px-2 py-1"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
