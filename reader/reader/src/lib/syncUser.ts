import { db } from "@/lib/firebase";
import { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export async function syncCreatorProfile(user: User, username?: string) {
    try {
        const userRef = doc(db, "users", user.uid);
        const existing = await getDoc(userRef);

        const fallbackName =
            username ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "Creator";

        const existingData = existing.exists() ? existing.data() : null;
        const existingRoles = Array.isArray(existingData?.roles) ? existingData?.roles : [];

        // Check for upgrade
        const isUpgrade = existingRoles.includes("reader") && !existingRoles.includes("creator");
        if (isUpgrade) {
            console.log(`User ${user.uid} upgrading from reader to creator`);
        }

        const nextRoles = existingRoles.includes("creator") ? existingRoles : [...existingRoles, "creator"];

        const payload: {
            username: string;
            email: string;
            roles: string[];
            updatedAt: ReturnType<typeof serverTimestamp>;
            createdAt?: ReturnType<typeof serverTimestamp>;
            becameCreatorAt?: ReturnType<typeof serverTimestamp>;
        } = {
            username: fallbackName,
            email: user.email || "",
            roles: nextRoles.length ? nextRoles : ["creator"],
            updatedAt: serverTimestamp(),
        };

        if (isUpgrade) {
            payload.becameCreatorAt = serverTimestamp();
        }

        if (!existing.exists()) {
            payload.createdAt = serverTimestamp();
        }

        await setDoc(userRef, payload, { merge: true });
    } catch (error) {
        console.error("Creator profile sync failed:", error);
    }
}
