"use client";
import { ThemeContext } from "@/app/context/ThemeContext";
import { useEffect, useState } from "react";
import { ConfigProvider, theme, App } from "antd";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkMode(theme === "dark");
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider
      value={{ isDark: isDarkMode, setIsDark: setIsDarkMode }}
    >
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            colorBgContainer: isDarkMode ? '#001529' : '#ffffff',
            colorBgElevated: isDarkMode ? '#22304a' : '#ffffff',
            colorText: isDarkMode ? '#ffffff' : '#000000',
            colorTextSecondary: isDarkMode ? '#a0a0a0' : '#666666',
            colorBorder: isDarkMode ? '#4a5568' : '#d9d9d9',
          },
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
