import { useContext, useEffect, useState } from "react";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Dropdown,
  Badge,
  Popover,
  List,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // tiếng Việt (nếu muốn)

import { IoIosLogOut } from "react-icons/io";
import { ThemeContext } from "@/app/context/ThemeContext";
import { signOut, useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

type Notification = {
  id: string;
  landlordId: string;
  type: string;
  createdAt: any;
  message: string;
  read: boolean;
};

function AppHeader({ collapsed, toggleCollapsed }: AppHeaderProps) {
  dayjs.extend(relativeTime);
  dayjs.locale("vi");
  const router = useRouter();
  const { data: session } = useSession();
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleClick = () => {
    setIsDark(!isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  const userName = session?.user?.userProfile.fullName || "User";
  const landlordId = session?.user?.id || ""; // 👈 ID landlord từ session

  // Lắng nghe realtime notifications
  useEffect(() => {
    if (!landlordId) return;

    const q = query(
      collection(db, "notifications"),
      where("receiverId", "==", landlordId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (docSnap) =>
          ({
            id: docSnap.id,
            ...docSnap.data(),
          } as Notification)
      );
      setNotifications(data);
    });

    return () => unsub();
  }, [landlordId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      for (const n of unread) {
        await updateDoc(doc(db, "notifications", n.id), { read: true });
      }
      message.success("Đã đánh dấu tất cả thông báo là đã đọc");
    } catch (err) {
      console.error("Error mark all as read:", err);
    }
  };

  const handleNotificationClick = async (id: string, type: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
      if(type === "booking_success"){
        router.push(`/landlord/rentals`);
      }
      console.log("Notification clicked:", id);
    } catch (err) {
      console.error("Error update notification:", err);
    }
  };

  const notificationContent = (
    <div className="w-80">
      <div className="flex justify-between items-center p-3 border-b">
        <Typography.Title level={5} className="!m-0">
          Thông báo
        </Typography.Title>
        <Typography.Link onClick={markAllAsRead}>
          Đánh dấu tất cả đã đọc
        </Typography.Link>
      </div>
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              !item.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
            }`}
            onClick={() => handleNotificationClick(item.id,item.type)}
          >
            <List.Item.Meta
              title={
                <div className="flex justify-between items-start">
                  <span className={`${!item.read ? "font-semibold" : ""}`}>
                    {item.type === "booking_success"
                      ? "Rental Booking"
                      : "Thông báo"}
                  </span>
                  {!item.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                  )}
                </div>
              }
              description={
                <div>
                  <div className="text-gray-600 dark:text-gray-300 mb-1">
                    {item.type == "booking_success"
                      ? item.message
                      : "Chi tiết thông báo"}
                  </div>
                  <div className="text-xs text-gray-400">
  {item.createdAt?.toDate
    ? dayjs(item.createdAt.toDate()).fromNow()
    : ""}
</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      {/* {notifications.length > 3 && (
        <div className="text-center p-3 border-t">
          <Typography.Link onClick={() => console.log("Xem tất cả thông báo")}>
            Xem tất cả thông báo
          </Typography.Link>
        </div>
      )} */}
    </div>
  );

  const items = [
    {
      key: "logout",
      label: (
        <button
          className="flex items-center justify-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:!bg-gray-900 dark:!bg-gray-900"
          onClick={async () => await signOut({ callbackUrl: "/auth/login" })}
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
        className="!text-lg w-16 h-16 flex items-center justify-center !text-gray-700 dark:!text-white"
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>

      <div className="flex items-center gap-4">
        <button
          id="theme-toggle"
          className="!text-2xl"
          title="Toggle theme"
          onClick={handleClick}
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <Popover
          content={notificationContent}
          title={null}
          trigger="click"
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
          placement="bottomRight"
          overlayClassName="notification-popover"
        >
          <Badge count={unreadCount} size="small">
            <BellOutlined
              className="text-xl cursor-pointer text-gray-700 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setNotificationOpen(!notificationOpen)}
            />
          </Badge>
        </Popover>

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
