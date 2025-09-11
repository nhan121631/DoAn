"use client";
import { useState, useEffect } from "react";
import AppSidebar from "./AppSidebar";
import HeaderUserDashboard from "./HeaderUserDashboard";

export default function UserLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleScreenChange = (e: MediaQueryListEvent) => {
      setCollapsed(e.matches);
    };
    setCollapsed(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleScreenChange);
    return () => mediaQuery.removeEventListener("change", handleScreenChange);
  }, [mounted]);
  return (
    <div className="h-screen flex flex-col">
      <div className="h-[85px] relative z-10">
        <HeaderUserDashboard />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-shrink-0">
          <AppSidebar collapsed={collapsed} />
        </div>
        <div className="flex-1 overflow-auto bg-gray-100">{children}</div>
      </div>
    </div>
  );
}
