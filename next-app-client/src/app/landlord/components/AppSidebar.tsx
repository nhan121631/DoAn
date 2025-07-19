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
    "/admin/statistics": "1",
    "/admin/manage-accounts": "2",
    "/admin/manage-rooms": "3",
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
        height: "100vh",
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
            label: <Link href="/landlord/manage-maintain">Manage Maintain</Link>,
          },
          {
            key: "4",
            icon: <RiHotelLine />,
            label: <Link href="/landlord/manage-rooms">Manage Rooms</Link>,
          },
          {
            key: "5",
            icon: <FaFileContract />,
            label: <Link href="/landlord/manage-contracts">Manage Contracts</Link>,
          },
          {
            key: "6",
            icon: <MdOutlineRequestQuote />,
            label: <Link href="/landlord/manage-requests">Manage Requests</Link>,
          },
          {
            key: "7",
            icon: <MdComment />,
            label: <Link href="/landlord/manage-comments">Manage Comments</Link>,
          },
        ]}
      />
    </Sider>
  );
}

export default AppSidebar;
