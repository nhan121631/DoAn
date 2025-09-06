"use client";
import { useState, useEffect } from "react";
import { Layout } from "antd";
import AppSidebar from "./AppSidebar";
import HeaderUserDashboard from "./HeaderUserDashboard";

const { Content } = Layout;

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
      <div className="h-[85px]">
        <HeaderUserDashboard fixed={false} />
      </div>
      <Layout className="flex-1">
        <AppSidebar collapsed={collapsed} />
        <Content className="bg-gray-100">{children}</Content>
      </Layout>
    </div>
  );
}
