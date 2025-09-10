import { useContext } from "react";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { ThemeContext } from "../context/ThemeContext";
import { Avatar, Dropdown } from "antd";
import { IoIosLogOut } from "react-icons/io";
import { useAuthStore } from "../stores/useAuthorStore";
import { useNavigate } from "react-router";

interface AppHeaderProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

function AppHeader({ collapsed, toggleCollapsed }: AppHeaderProps) {
  const { loggedInUser, logOut } = useAuthStore((state) => state);
  const { isDark, setIsDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const handleClick = () => {
    setIsDark(!isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };
  const userName = loggedInUser?.username || "Guest";

  const items = [
    {
      key: "logout",
      label: (
        <button
          className="flex items-center justify-center w-full gap-2 px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => {
            logOut();
            navigate("/login");
          }}
        >
          <IoIosLogOut className="text-2xl" /> Logout
        </button>
      ),
    },
  ];

  return (
    <header className="w-full flex justify-between items-center px-4 py-0 bg-slate-50 dark:bg-[#001529] border-[1px] border-gray-200 dark:border-gray-600">
      <button
        onClick={toggleCollapsed}
        className="flex items-center justify-center w-16 h-16 text-lg text-gray-700 dark:text-white"
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
            <Avatar src="https://i.pravatar.cc/40" alt="User Avatar" />
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
