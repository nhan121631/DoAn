"use client";
import { useState } from "react";
import { App } from "antd";
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
      <App>
        <div className="h-screen flex">
          <AppSidebar collapsed={collapsed} />
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#001529] overflow-hidden ">
            <AppHeader collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
            <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-[#001529]">
              {children}
            </div>
          </div>
        </div>
      </App>
    </ThemeProvider>
  );
}
