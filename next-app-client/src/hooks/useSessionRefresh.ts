import { useSession } from "next-auth/react";
import { useCallback } from "react";

export const useSessionRefresh = () => {
  const { data: session, update } = useSession();

  const refreshSession = useCallback(async () => {
    // Trigger a session refresh to get updated data
    await update();
  }, [update]);

  return {
    session,
    refreshSession,
  };
};
