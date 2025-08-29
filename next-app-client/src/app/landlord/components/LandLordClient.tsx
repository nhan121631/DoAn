"use client";
import { useState } from "react";
import { Layout as AntLayout } from "antd";
import AppSidebar from "./AppSidebar";
import AppHeader from "./Header";
import ThemeProvider from "./ThemeProvider";

export default function LandlordLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <ThemeProvider>
      <div className="h-screen flex">
        <AppSidebar collapsed={collapsed} />
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#001529]">
          <AppHeader collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </ThemeProvider>
  );
}
