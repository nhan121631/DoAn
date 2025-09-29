"use client";
import { useContext, useState, useEffect } from "react";
import { Menu, Layout } from "antd";
import { FaChartLine } from "react-icons/fa";
import {
  MdHistoryEdu,
  MdOutlineRequestQuote,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import { RiContractLine, RiHotelLine } from "react-icons/ri";
import { ThemeContext } from "@/app/context/ThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImProfile } from "react-icons/im";
import { PiHandDepositLight } from "react-icons/pi";
import { LuBookCheck } from "react-icons/lu";
import { VscFeedback } from "react-icons/vsc";
import { GrHostMaintenance } from "react-icons/gr";
import { HiUsers } from "react-icons/hi";

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
    "/landlord/dashboard": "1",
    "/landlord/statistics": "2",
    "/landlord/profile": "3",
    "/landlord/manage-rooms": "4",
    "/landlord/rentals": "5",
    "/landlord/manage-contracts": "6",
    "/landlord/manage-residents": "7",
    "/landlord/manage-requests": "8",
    "/landlord/manage-maintain": "9",
    "/landlord/manage-comments": "10",
    "/landlord/add-funds": "11",
    "/landlord/payment-history": "12",
    "/landlord/manage-chat": "13",
  };

  // const selectedKey = pathToKey[pathname] || "1";
  const getSelectedKey = () => {
    const p = pathname || "";
    if (/^\/landlord\/manage-rooms(\/|$)/.test(p)) return "4";
    if (/^\/landlord\/manage-contracts(\/|$)/.test(p)) return "6";
    if (/^\/landlord\/manage-residents(\/|$)/.test(p)) return "7";
    if (/^\/landlord\/add-funds(\/|$)/.test(p)) return "11";
    return pathToKey[p] || "1";
  };
  const selectedKey = getSelectedKey();

  if (!mounted) {
    return (
      <div
        style={{
          width: collapsed ? 80 : 200,
          height: "100%",
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
        height: "100%",
        borderRight: isDark
          ? "1px solid #4A5565" // dark: slate-700
          : "1px solid #F8FAFC", // light: ant design default
      }}
    >
      <div className="flex items-center justify-center h-16 ">
        <h1 className="text-lg font-bold dark:text-white transition-all duration-300">
          {collapsed ? "L" : "LandLord Panel"}
        </h1>
      </div>
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
                <MdOutlineSpaceDashboard />
              </span>
            ),
            label: <Link href="/landlord/dashboard">Dashboard</Link>,
          },
          {
            key: "2",
            icon: (
              <span
                style={{
                  fontSize: 16,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <FaChartLine />
              </span>
            ),
            label: <Link href="/landlord/statistics">Statistics</Link>,
          },
          {
            key: "3",
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
            label: <Link href="/landlord/profile">Profile</Link>,
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
                <RiHotelLine />
              </span>
            ),
            label: <Link href="/landlord/manage-rooms">Rooms Management</Link>,
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
                <LuBookCheck />
              </span>
            ),
            label: <Link href="/landlord/rentals">Rentals Management</Link>,
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
                <RiContractLine />
              </span>
            ),
            label: (
              <Link href="/landlord/manage-contracts">Contract Management</Link>
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
                <HiUsers />
              </span>
            ),
            label: (
              <Link href="/landlord/manage-residents">Residents Management</Link>
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
                <MdOutlineRequestQuote />
              </span>
            ),
            label: (
              <Link href="/landlord/manage-requests">Request Management</Link>
            ),
          },
          {
            key: "9",
            icon: (
              <span
                style={{
                  fontSize: 16,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <GrHostMaintenance />
              </span>
            ),
            label: (
              <Link href="/landlord/manage-maintain">
                Maintenance Management
              </Link>
            ),
          },
          {
            key: "10",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <VscFeedback />
              </span>
            ),
            label: (
              <Link href="/landlord/manage-comments">Feedback Management</Link>
            ),
          },
          {
            key: "11",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <PiHandDepositLight />
              </span>
            ),
            label: <Link href="/landlord/add-funds">Deposit Management</Link>,
          },
          {
            key: "12",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <MdHistoryEdu />
              </span>
            ),
            label: (
              <Link href="/landlord/payment-history">Transaction History</Link>
            ),
          },
          {
            key: "13",
            icon: (
              <span
                style={{
                  fontSize: 18,
                  marginRight: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <ImProfile />
              </span>
            ),
            label: <Link href="/landlord/manage-chat">Chat Management</Link>,
          },
        ]}
      />
    </Sider>
  );
}

export default AppSidebar;
