"use client";
import { useState, useEffect } from "react";
import { Menu, Layout } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImProfile } from "react-icons/im";
import { LuBookCheck } from "react-icons/lu";
import {
  MdFavoriteBorder,
  MdHistory,
  MdOutlineLockReset,
} from "react-icons/md";

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
}

function AppSidebar({ collapsed }: AppSidebarProps) {
  const isDark = true;
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const pathToKey: Record<string, string> = {
    "/user-dashboard/profile": "1",
    "/user-dashboard/rental-history": "2",
    "/user-dashboard/request-status": "3",
    "/user-dashboard/favorited-rooms": "4",
    "/user-dashboard/change-password": "5",
  };

  const selectedKey = pathToKey[pathname] || "1";

  if (!mounted) {
    return (
      <div
        style={{
          width: collapsed ? 80 : 200,
          height: "100vh",
          backgroundColor: "#f5f5f5",
          borderRight: "1px solid #d9d9d9",
        }}
        className="transition-all duration-200"
      >
        <div className="flex items-center justify-center h-16">
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme={isDark ? "dark" : "light"}
      style={{
        height: "full",
        borderRight: isDark
          ? "1px solid #4A5565" // dark: slate-700
          : "1px solid #F8FAFC", // light: ant design default
      }}
    >
      <Menu
        theme={isDark ? "dark" : "light"}
        mode="inline"
        selectedKeys={[selectedKey]}
        items={[
          {
            key: "1",
            icon: (
              <span
                style={{
                  fontSize: 16,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
                className="transition-colors duration-200 hover:text-blue-400"
              >
                <ImProfile />
              </span>
            ),
            label: (
              <Link
                href="/user-dashboard/profile"
                className="block w-full h-full transition-colors duration-200 hover:text-blue-400"
              >
                Profile
              </Link>
            ),
          },
          {
            key: "2",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
                className="transition-colors duration-200 hover:text-blue-400"
              >
                <MdHistory />
              </span>
            ),
            label: (
              <Link
                href="/user-dashboard/rental-history"
                className="block w-full h-full transition-colors duration-200 hover:text-blue-400"
              >
                Rental History
              </Link>
            ),
          },
          {
            key: "3",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
                className="transition-colors duration-200 hover:text-blue-400"
              >
                <LuBookCheck />
              </span>
            ),
            label: (
              <Link
                href="/user-dashboard/request-status"
                className="block w-full h-full transition-colors duration-200 hover:text-blue-400"
              >
                Request Status
              </Link>
            ),
          },
          {
            key: "4",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
                className="transition-colors duration-200 hover:text-blue-400"
              >
                <MdFavoriteBorder />
              </span>
            ),
            label: (
              <Link
                href="/user-dashboard/favorited-rooms"
                className="block w-full h-full transition-colors duration-200 hover:text-blue-400"
              >
                Favorited Rooms
              </Link>
            ),
          },
          {
            key: "5",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
                className="transition-colors duration-200 hover:text-blue-400"
              >
                <MdOutlineLockReset />
              </span>
            ),
            label: (
              <Link
                href="/user-dashboard/change-password"
                className="block w-full h-full transition-colors duration-200 hover:text-blue-400"
              >
                Change Password
              </Link>
            ),
          },
        ]}
      />
    </Sider>
  );
}

export default AppSidebar;
