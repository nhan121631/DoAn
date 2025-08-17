
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { initializeFavorites } from "@/services/FavoriteService";

export default function FavoriteInitializer() {
  const { status } = useSession();
  
  useEffect(() => {
    // Chỉ gọi API khi đã đăng nhập
    if (status === "authenticated") {
      initializeFavorites();
    }
  }, [status]);
  
  return null;
}

