import { useContext } from "react";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { ThemeContext } from "../context/ThemeContext";

interface AppHeaderProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

function AppHeader({ collapsed, toggleCollapsed }: AppHeaderProps) {
  const { isDark, setIsDark } = useContext(ThemeContext);
  const handleClick = () => {
    setIsDark(!isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };
  return (
    <header className="w-full flex justify-between items-center px-4 py-0 bg-slate-50 dark:bg-[#001529] border-[1px] border-gray-200 dark:border-gray-600">
      <button
        onClick={toggleCollapsed}
        className="text-lg w-16 h-16 flex items-center justify-center text-gray-700 dark:text-white"
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>

      <button
        id="theme-toggle"
        className="text-2xl"
        title="Toggle theme"
        onClick={handleClick}
      >
        {isDark ? "☀️" : "🌙"}
      </button>
    </header>
  );
}

export default AppHeader;
