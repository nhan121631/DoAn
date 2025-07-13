import React, { useContext } from "react";
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Menu, Layout } from "antd";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useLocation } from "react-router";
import { FaChartLine } from "react-icons/fa";
import { MdSupervisorAccount } from "react-icons/md";
import { RiHotelLine } from "react-icons/ri";
import { useContext } from "react";

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
}

function AppSidebar({ collapsed }: AppSidebarProps) {
  const { isDark } = useContext(ThemeContext);
  const pathToKey: Record<string, string> = {
    "/admin/statistics": "1",
    "/admin/manage-accounts": "2",
    "/admin/manage-rooms": "3",
  };
  const location = useLocation();
  const selectedKey = pathToKey[location.pathname] || "1";
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme={isDark ? "dark" : "light"}
      style={{
        height: "100vh",
        borderRight: isDark
          ? "1px solid #4A5565" // dark: slate-700
          : "1px solid #F8FAFC", // light: ant design default
      }}
    >
      <div className="flex items-center justify-center h-16 ">
        <h1 className="text-lg font-bold dark:text-white transition-all duration-300">
          {collapsed ? "A" : "Admin Panel"}
        </h1>
      </div>

      <Menu
        theme={isDark ? "dark" : "light"}
        mode="inline"
        defaultSelectedKeys={[selectedKey]}
        items={[
          {
            key: "1",
            icon: <FaChartLine />,
            label: <Link to="/admin/statistics">Statistics</Link>,
          },
          {
            key: "2",
            icon: <MdSupervisorAccount />,
            label: <Link to="/admin/manage-accounts">Management Accounts</Link>,
          },
          {
            key: "3",
            icon: <RiHotelLine />,
            label: <Link to="/admin/manage-rooms">Managememt Rooms</Link>,
          },
        ]}
      />
    </Sider>
  );
}

export default AppSidebar;
