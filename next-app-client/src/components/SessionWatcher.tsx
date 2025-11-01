"use client";
import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { getJwtExpiration } from "@/utils/jwtUtils";

export default function SessionWatcher() {
  const { data: session, status } = useSession();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (status === "authenticated" && session?.user?.accessToken) {
      // Lấy thời gian hết hạn từ JWT token
      const jwtExpiration = getJwtExpiration(session.user.accessToken);

      if (jwtExpiration) {
        const margin = 5_000; // logout 5s trước khi token hết hạn
        const ms = jwtExpiration - Date.now() - margin;

        console.log("JWT SessionWatcher:", {
          expiresAt: new Date(jwtExpiration).toLocaleString(),
          timeRemaining: Math.round((jwtExpiration - Date.now()) / 1000) + "s",
          willLogoutIn: Math.round((ms > 0 ? ms : 0) / 1000) + "s",
        });

        if (ms <= 0) {
          // Nếu đã hết hạn hoặc gần hết hạn -> sign out ngay
          console.log("JWT expired, logging out...");
          signOut({ callbackUrl: "/auth/login" });
          return;
        }

        timerRef.current = window.setTimeout(() => {
          console.log("JWT expired timeout reached, logging out...");
          signOut({ callbackUrl: "/auth/login" });
        }, ms) as unknown as number;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [session?.user?.accessToken, status]);

  return null;
}
