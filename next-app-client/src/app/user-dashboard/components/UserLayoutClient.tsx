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
    <div className="flex flex-col min-h-screen">
      <HeaderUserDashboard />
      <div className="flex flex-1">
        <AppSidebar collapsed={collapsed} />
        <main className="w-full p-6 bg-white rounded-lg shadow-md">
          {children}
        </main>
      </div>
    </div>
  );
}
