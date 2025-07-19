import { useEffect, useState } from "react";
import { Layout } from "antd";
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

 


  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <ThemeContext.Provider
      value={{ isDark: isDarkMode, setIsDark: setIsDarkMode }}
    >
      <Layout
        className={`${isDarkMode ? "dark" : ""}`}
        style={{
          background: isDarkMode ? "#001529" : "#f0f2f5",
        }}
      >
        <AppSidebar collapsed={collapsed} />
        <Layout className="!min-h-screen bg-gray-50 dark:!bg-[#001529]">
          <AppHeader collapsed={collapsed} toggleCollapsed={toggleCollapsed} />

          <Outlet />
        </Layout>
      </Layout>
    </ThemeContext.Provider>
  );
}

export default Admin;
