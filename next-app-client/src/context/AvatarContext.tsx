"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { URL_IMAGE } from "@/services/Constant";

interface AvatarContextType {
  avatarUrl: string;
  updateAvatarUrl: (newUrl: string) => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const userProfile = session?.user?.userProfile;
    if (!userProfile?.avatar) {
      setAvatarUrl("/images/default/avatar.jpg");
      return;
    }
    const url = userProfile.avatar.startsWith("http")
      ? userProfile.avatar
      : `${URL_IMAGE}${userProfile.avatar}`;
    setAvatarUrl(url);
  }, [session]);

  const updateAvatarUrl = (newUrl: string) => {
    setAvatarUrl(newUrl);
  };

  return (
    <AvatarContext.Provider value={{ avatarUrl, updateAvatarUrl }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }
  return context;
};
