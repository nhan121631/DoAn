/* eslint-disable @typescript-eslint/no-explicit-any */
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
import "dayjs/locale/en"; // tiếng Việt (nếu muốn)

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
  contractId?: number | string | undefined;
  message: string;
  isRead: boolean;
};

function AppHeader({ collapsed, toggleCollapsed }: AppHeaderProps) {
  dayjs.extend(relativeTime);
  dayjs.locale("en");
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { data: session } = useSession();
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [displayedNotifications, setDisplayedNotifications] = useState<
    Notification[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const notificationsPerPage = 5;
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleClick = () => {
    setIsDark(!isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  const userName = session?.user?.userProfile.fullName || "Người dùng";
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

      // Chỉ hiển thị popup cho notification thực sự mới (không phải lần đầu load)
      if (!isInitialLoad) {
        // Chỉ hiển thị popup nếu có document mới được thêm VÀ không phải từ cache
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && !change.doc.metadata.fromCache) {
            messageApi.success({
              content: "Thông báo: " + change.doc.data().message,
              duration: 3,
            });
          }
        });
      } else {
        console.log("Tải lần đầu, bỏ qua popup thông báo");
        setIsInitialLoad(false);
      }

      setNotifications(data);
      // Reset pagination when new notifications come
      setCurrentPage(1);
      setDisplayedNotifications(data.slice(0, notificationsPerPage));
    });

    return () => unsub();
  }, [landlordId, messageApi, isInitialLoad]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      for (const n of unread) {
        await updateDoc(doc(db, "notifications", n.id), { isRead: true });
      }
      messageApi.success("Đã đánh dấu tất cả thông báo là đã đọc");
    } catch (err) {
      console.error("Error mark all as read:", err);
    }
  };

  const handleNotificationClick = async (
    id: string,
    type: string,
    contractId: number | string | undefined
  ) => {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
      if (type === "booking_success") {
        router.push(`/landlord/rentals`);
      } else if (type === "request_success") {
        router.push(`/landlord/manage-requests`);
      } else if (type === "resident_success") {
        router.push(`/landlord/manage-contracts/${contractId}`);
      } else if (type === "payment_success") {
        router.push(`/landlord/manage-contracts/${contractId}`);
      }
      console.log("Thông báo đã được nhấp:", id);
    } catch (err) {
      console.error("Lỗi khi cập nhật thông báo:", err);
    }
  };

  const loadMoreNotifications = () => {
    if (isLoadingMore || displayedNotifications.length >= notifications.length)
      return;

    setIsLoadingMore(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const newDisplayedNotifications = notifications.slice(
        0,
        nextPage * notificationsPerPage
      );
      setDisplayedNotifications(newDisplayedNotifications);
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    }, 500); // Simulate loading delay
  };

  const handleNotificationScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      loadMoreNotifications();
    }
  };

  const notificationContent = (
    <div className="w-80">
      <div className="flex justify-between items-center p-3 border-b">
        <Typography.Title level={5} className="!m-0">
          Thông báo
        </Typography.Title>
        <Typography.Link onClick={markAllAsRead}>
          Đánh dấu tất cả là đã đọc
        </Typography.Link>
      </div>
      <div
        className="max-h-80 overflow-y-auto"
        onScroll={handleNotificationScroll}
      >
        <List
          dataSource={displayedNotifications}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                !item.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
              onClick={() =>
                handleNotificationClick(item.id, item.type, item.contractId)
              }
            >
              <List.Item.Meta
                title={
                  <div className="flex justify-between items-start">
                    <span className={`${!item.isRead ? "font-semibold" : ""}`}>
                      {item.type === "booking_success" &&
                        "Đặt phòng thành công"}
                      {item.type === "request_success" && "Yêu cầu thành công"}
                      {item.type === "resident_success" && "Tạm trú thành công"}
                      {item.type === "payment_success" && "Thanh toán hóa đơn"}
                    </span>
                    {!item.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                    )}
                  </div>
                }
                description={
                  <div>
                    <div className="text-gray-600 dark:text-gray-300 mb-1">
                      {item.message}
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
        {isLoadingMore && (
          <div className="text-center p-3">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">Tải thêm...</span>
          </div>
        )}
      </div>
      {displayedNotifications.length < notifications.length &&
        !isLoadingMore && (
          <div className="text-center p-3 border-t">
            <Typography.Link onClick={loadMoreNotifications}>
              Tải thêm thông báo (
              {notifications.length - displayedNotifications.length} còn lại)
            </Typography.Link>
          </div>
        )}
      {displayedNotifications.length >= notifications.length &&
        notifications.length > notificationsPerPage && (
          <div className="text-center p-3 border-t">
            <span className="text-sm text-gray-500">
              Tất cả thông báo đã được tải
            </span>
          </div>
        )}
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
          <IoIosLogOut className="text-2xl" /> Đăng xuất
        </button>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
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

          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar src="https://i.pravatar.cc/40" alt="User Avatar" />
              <span className="font-semibold dark:text-white">
                Xin chào, {userName}
              </span>
            </div>
          </Dropdown>
        </div>
      </header>
    </>
  );
}

export default AppHeader;
