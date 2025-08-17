// "use client";

// import { useEffect } from "react";
// import { initializeFavorites } from "@/services/FavoriteService";

// export default function FavoriteInitializer() {
//   useEffect(() => {
//     // Chỉ chạy một lần khi component mount
//     initializeFavorites();
//   }, []);
  
//   return null; // Component này không render UI
// }


//-----ok//...........

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
//-----ok//...........


// "use client";

// import { useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { initializeFavorites } from "@/services/FavoriteService";

// export default function FavoriteInitializer() {
//   const { status } = useSession();
  
//   useEffect(() => {
//     // Chỉ gọi API khi đã đăng nhập và đang ở client-side
//     if (status === "authenticated" && typeof window !== 'undefined') {
//       initializeFavorites();
//     }
//   }, [status]);
  
//   return null;
// }