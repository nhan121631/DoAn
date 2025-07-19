"use client";
import { useContext, useState, useEffect } from "react";
import { Menu, Layout } from "antd";
import { FaChartLine, FaFileContract } from "react-icons/fa";
import { MdBuild, MdOutlineRequestQuote, MdComment } from "react-icons/md";
import { RiHotelLine } from "react-icons/ri";
import { ThemeContext } from "@/app/context/ThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImProfile } from "react-icons/im";
import { FaMoneyCheckDollar } from "react-icons/fa6";

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
}

function AppSidebar({ collapsed }: AppSidebarProps) {
  const { isDark } = useContext(ThemeContext);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const pathToKey: Record<string, string> = {
    "/landlord/profile": "1",
    "/landlord/statistics": "2",
    "/landlord/manage-maintain": "3",
    "/landlord/manage-rooms": "4",
    "/landlord/manage-contracts": "5",
    "/landlord/manage-requests": "6",
    "/landlord/manage-comments": "7",
    "/landlord/add-funds": "8",
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
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        right: undefined,
        height: "100vh",
        zIndex: 100,
        borderRight: isDark ? "1px solid #4A5565" : "1px solid #F8FAFC",
      }}
    >
      <div className="flex items-center justify-center h-16">
        <h1 className="text-lg font-bold dark:text-white transition-all duration-300">
          {collapsed ? "A" : "LandLord Panel"}
        </h1>
      </div>
      <Menu
        theme={isDark ? "dark" : "light"}
        mode="inline"
        selectedKeys={[selectedKey]}
        items={[
          {
            key: "1",
            icon: <ImProfile />,
            label: <Link href="/landlord/profile">Profile</Link>,
          },
          {
            key: "2",
            icon: <FaChartLine />,
            label: <Link href="/landlord/statistics">Statistic</Link>,
          },
          {
            key: "3",
            icon: <MdBuild />,
            label: (
              <Link href="/landlord/manage-maintain">Manage Maintain</Link>
            ),
          },
          {
            key: "4",
            icon: <RiHotelLine />,
            label: <Link href="/landlord/manage-rooms">Manage Rooms</Link>,
          },
          {
            key: "5",
            icon: <FaFileContract />,
            label: (
              <Link href="/landlord/manage-contracts">Manage Contracts</Link>
            ),
          },
          {
            key: "6",
            icon: <MdOutlineRequestQuote />,
            label: (
              <Link href="/landlord/manage-requests">Manage Requests</Link>
            ),
          },
          {
            key: "7",
            icon: <MdComment />,
            label: (
              <Link href="/landlord/manage-comments">Manage Comments</Link>
            ),
          },
          {
            key: "8",
            icon: <FaMoneyCheckDollar />,
            label: <Link href="/landlord/add-funds">Add Funds</Link>,
          },
        ]}
      />
    </Sider>
  );
}

export default AppSidebar;