"use client";

import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewDraftPage() {
    const router = useRouter();

    const create = async (type: "short" | "novel") => {
        const user = auth.currentUser;
        if (!user) return;

        const ref = collection(db, "users", user.uid, "drafts");

        const doc = await addDoc(ref, {
            title: "",
            content: "",
            genre: "Fantasy",
            coverImage: "",
            type,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        router.push(`/dashboard/drafts/${doc.id}`);
    };

    return (
        <section className="space-y-6 max-w-xl mx-auto pt-12">
            <h1 className="tracking-widest text-xl uppercase text-[var(--foreground)] mb-8">Start a New Draft</h1>

            <button
                onClick={() => create("short")}
                className="w-full border border-[var(--reader-border)] p-8 text-left group hover:bg-[var(--reader-border)]/10 transition-all"
            >
                <span className="text-lg font-medium text-[var(--foreground)] group-hover:pl-2 transition-all block mb-2">Short Story</span>
                <span className="text-sm text-[var(--reader-text)] block">A single piece of work, published as one entity.</span>
            </button>

            <button
                onClick={() => create("novel")}
                className="w-full border border-[var(--reader-border)] p-8 text-left group hover:bg-[var(--reader-border)]/10 transition-all"
            >
                <span className="text-lg font-medium text-[var(--foreground)] group-hover:pl-2 transition-all block mb-2">Novel Schema</span>
                <span className="text-sm text-[var(--reader-text)] block">A multi-chapter work with structured organization.</span>
            </button>
        </section>
    );
}
