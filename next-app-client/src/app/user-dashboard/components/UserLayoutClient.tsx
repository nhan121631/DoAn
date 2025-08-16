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
    <Layout className="min-h-screen">
      <HeaderUserDashboard />
      <Layout className="!min-h-screen">
        <AppSidebar collapsed={collapsed} />
        <Content className="p-6 bg-gray-100">{children}</Content>
      </Layout>
    </Layout>
  );
}
