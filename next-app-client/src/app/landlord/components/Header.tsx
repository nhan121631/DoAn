import { useContext } from "react";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";
import { IoIosLogOut } from "react-icons/io";
import { ThemeContext } from "@/app/context/ThemeContext";

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
  const userName = "John Doe";

  const items = [
    {
      key: "logout",
      label: (
        <button
          className="flex items-center justify-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => alert("Logged out!")}
        >
          <IoIosLogOut className="text-2xl" /> Logout
        </button>
      ),
    },
  ];

  return (
    <header className="w-full flex justify-between items-center px-4 py-0 bg-slate-50 dark:bg-[#001529] border-[1px] border-gray-200 dark:border-gray-600 fixed top-0 left-0 right-0 z-50 h-16">
      <button
        onClick={toggleCollapsed}
        className="text-lg w-16 h-16 flex items-center justify-center text-gray-700 dark:text-white"
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>

      <div className="flex items-center gap-4">
        <button
          id="theme-toggle"
          className="text-2xl"
          title="Toggle theme"
          onClick={handleClick}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar src="https://i.pravatar.cc/40" />
            <span className="font-semibold dark:text-white">
              Hi, {userName}
            </span>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}

export default AppHeader;
