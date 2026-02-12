"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "./firebase";
import { User } from "firebase/auth";

export function useRequireAuth(options?: { requireVerified?: boolean }) {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const requireVerified = options?.requireVerified ?? true;

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user: User | null) => {
            if (!user) {
                setReady(false);
                router.replace("/login");
                return;
            }

            if (requireVerified && !user.emailVerified) {
                setReady(false);
                router.replace("/verify-email");
                return;
            }

            setReady(true);
        });

        return () => unsub();
    }, [router, requireVerified]);

    return ready;
}
