"use client";
import { Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ImProfile } from "react-icons/im";
import { LuBookCheck } from "react-icons/lu";
import {
  MdDescription,
  MdFavoriteBorder,
  MdHistory,
  MdOutlineLockReset,
  MdOutlineMessage,
} from "react-icons/md";
import { TeamOutlined } from "@ant-design/icons";

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
}

function AppSidebar({ collapsed }: AppSidebarProps) {
  const isDark = false;
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const pathToKey: Record<string, string> = {
    "/user-dashboard/profile": "1",
    "/user-dashboard/my-contracts": "2",
    "/user-dashboard/rental-history": "3",
    "/user-dashboard/request-status": "4",
    "/user-dashboard/favorited-rooms": "5",
    "/user-dashboard/residents": "6",
    "/user-dashboard/change-password": "7",
    "/user-dashboard/message": "8",
  };

  // const selectedKey = pathToKey[pathname || ""] || "1";
  const getSelectedKey = () => {
    const p = pathname || "";
    if (/^\/user-dashboard\/my-contracts(\/|$)/.test(p)) return "2";
    if (/^\/user-dashboard\/residents(\/|$)/.test(p)) return "6";
    return pathToKey[p] || "1";
  };
  const selectedKey = getSelectedKey();

  if (!mounted) {
    return (
      <div
        style={{
          width: collapsed ? 80 : 200,
          height: "calc(100vh - 85px)",
          backgroundColor: "#f5f5f5",
          borderRight: "1px solid #d9d9d9",
          position: "sticky",
          top: 0,
          left: 0,
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
        height: "calc(100vh - 85px)",
        position: "sticky",
        top: 0,
        left: 0,
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
              >
                <ImProfile />
              </span>
            ),
            label: <Link href="/user-dashboard/profile">Profile</Link>,
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
              >
                <MdDescription />
              </span>
            ),
            label: (
              <Link href="/user-dashboard/my-contracts">My Contracts</Link>
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
              >
                <MdHistory />
              </span>
            ),
            label: (
              <Link href="/user-dashboard/rental-history">Rental History</Link>
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
              >
                <LuBookCheck />
              </span>
            ),
            label: (
              <Link href="/user-dashboard/request-status">Request Status</Link>
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
              >
                <MdFavoriteBorder />
              </span>
            ),
            label: (
              <Link href="/user-dashboard/favorited-rooms">
                Favorited Rooms
              </Link>
            ),
          },
          {
            key: "6",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <TeamOutlined />
              </span>
            ),
            label: (
              <Link href="/user-dashboard/residents">
                Residents
              </Link>
            ),
          },
          {
            key: "7",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <MdOutlineLockReset />
              </span>
            ),
            label: (
              <Link href="/user-dashboard/change-password">
                Change Password
              </Link>
            ),
          },
          {
            key: "8",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <MdOutlineMessage />
              </span>
            ),
            label: <Link href="/user-dashboard/message">Message</Link>,
          },
        ]}
      />
    </Sider>
  );
}

export default AppSidebar;
