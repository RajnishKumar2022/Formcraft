"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RedirectAuthenticatedUser() {
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      try {
        const response = await fetch("/api/getme", {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.ok) {
          router.replace("/dashboard");
          return;
        }

        if (response.status !== 401) {
          const result = (await response.json()) as { message?: string };
          throw new Error(result.message || "Unable to verify your session");
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Unable to check existing session:", error);
      }
    }

    void checkSession();
    return () => controller.abort();
  }, [router]);

  return null;
}
