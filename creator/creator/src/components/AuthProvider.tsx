"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { syncCreatorProfile } from "@/lib/syncUser";

import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    useEffect(() => {
        // Listen for auth sync messages from Reader app
        const authChannel = new BroadcastChannel('auth_sync');
        authChannel.onmessage = (event) => {
            if (event.data.type === 'LOGOUT') {
                console.log("Received global LOGOUT signal. Forcing refresh...");
                // Force reload to clear state and ensure sign out
                // We can also call auth.signOut() here to be double sure
                auth.signOut().then(() => router.refresh());
            }
        };

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Creator AuthProvider state change:", user ? "User logged in" : "User logged out");
            if (user) {
                // When auth state changes and user is signed in, ensure profile is synced
                // This handles cases where user signs in from Reader app
                await syncCreatorProfile(user);
            } else {
                // Handle signout - if we were previously signed in, reload to clear state
                console.log("Detecting signout in Creator app, refreshing...");
                router.refresh();
            }
        });

        return () => {
            unsubscribe();
            authChannel.close();
        };
    }, []);

    return <>{children}</>;
}
