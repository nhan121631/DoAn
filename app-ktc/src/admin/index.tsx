import React, { useEffect, useState } from "react";
import { Layout, theme } from "antd";
import AppSidebar from "./components/Siderbar";
import AppHeader from "./components/Header";
import { ThemeContext } from "./context/ThemeContext";
import { Outlet } from "react-router";

function Admin() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkMode(theme === "dark");
  }, [isDarkMode]);

  // const {
  //   token: { colorBgContainer, borderRadiusLG },
  // } = theme.useToken();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <ThemeContext.Provider
      value={{ isDark: isDarkMode, setIsDark: setIsDarkMode }}
    >
      <Layout className={isDarkMode ? "dark" : ""}>
        <AppSidebar collapsed={collapsed} />
        <Layout className="bg-gray-50 dark:!bg-[#001529]">
          <AppHeader collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
          {/* <AppContent
            background={colorBgContainer}
            borderRadius={borderRadiusLG}
          /> */}
          <Outlet />
        </Layout>
      </Layout>
    </ThemeContext.Provider>
  );
}

export default Admin;
