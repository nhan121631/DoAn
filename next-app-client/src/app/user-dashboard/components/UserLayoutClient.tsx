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

  // Auto collapse sidebar on mobile/small screens
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleScreenChange = (e: MediaQueryListEvent) => {
      setCollapsed(e.matches);
    };

    // Set initial state
    setCollapsed(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener("change", handleScreenChange);

    // Cleanup
    return () => mediaQuery.removeEventListener("change", handleScreenChange);
  }, []);

  // const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderUserDashboard />
      <div className="flex flex-1">
        <AppSidebar collapsed={collapsed} />
        <main className="p-6 bg-white rounded-lg shadow-md min-w-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
