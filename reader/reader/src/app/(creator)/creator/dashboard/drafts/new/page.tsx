"use client";

import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewDraftPage() {
    const router = useRouter();

    const create = async (type: "short" | "novel", importedContent: { title: string, content: string } | null = null) => {
        const user = auth.currentUser;
        if (!user) return;

        const ref = collection(db, "users", user.uid, "drafts");

        const doc = await addDoc(ref, {
            title: importedContent?.title || "",
            content: importedContent?.content || "",
            genre: "Fantasy",
            coverImage: "",
            type,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        router.push(`/creator/dashboard/drafts/${doc.id}`);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            // Simple extraction: Filename as title (minus extension), Content as is
            const title = file.name.replace(/\.[^/.]+$/, "");
            await create("short", { title, content: text });
        };
        reader.readAsText(file);
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

            <div className="relative w-full border border-[var(--reader-border)] p-8 text-left group hover:bg-[var(--reader-border)]/10 transition-all border-dashed">
                <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-lg font-medium text-[var(--foreground)] group-hover:pl-2 transition-all block mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Import from File
                </span>
                <span className="text-sm text-[var(--reader-text)] block">Upload a .txt or .md file to automatically create a draft.</span>
            </div>
        </section>
    );
}
