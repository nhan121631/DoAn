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
      <AntLayout>
        <AppSidebar collapsed={collapsed} />
        <AntLayout>
          <AppHeader collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
          {children}
        </AntLayout>
      </AntLayout>
    </ThemeProvider>
  );
}
