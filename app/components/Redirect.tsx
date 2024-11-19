"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Redirect() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    // Optionally return a loading state
    if (status === "loading") {
        return <div>Loading...</div>; // or a spinner component
    }

    return null;
}
