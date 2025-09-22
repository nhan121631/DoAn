/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Avatar,
  Dropdown,
  Badge,
  Popover,
  List,
  Typography,
  message,
} from "antd";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import {
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineUsers,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { IoIosLogOut } from "react-icons/io";
import { IoClose, IoLogInOutline } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { BellOutlined } from "@ant-design/icons";
import { URL_IMAGE } from "@/services/Constant";
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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";

type Notification = {
  id: string;
  receiverId: string;
  type: string;
  createdAt: any;
  contractId?: number | string | undefined;
  message: string;
  isRead: boolean;
};

export default function HeaderUserDashboard({
  fixed = true,
}: {
  fixed?: boolean;
}) {
  dayjs.extend(relativeTime);
  dayjs.locale("en");
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [isScrolled, setIsScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [displayedNotifications, setDisplayedNotifications] = useState<
    Notification[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const notificationsPerPage = 5;
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const userId = session?.user?.id || "";

  // Lắng nghe realtime notifications
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "notifications"),
      where("receiverId", "==", userId),
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
              content: "Notification: " + change.doc.data().message,
              duration: 3,
            });
          }
        });
      } else {
        console.log("Initial load, skipping notification popup");
        setIsInitialLoad(false);
      }

      setNotifications(data);
      // Reset pagination when new notifications come
      setCurrentPage(1);
      setDisplayedNotifications(data.slice(0, notificationsPerPage));
    });

    return () => unsub();
  }, [userId, messageApi, isInitialLoad]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      for (const n of unread) {
        await updateDoc(doc(db, "notifications", n.id), { isRead: true });
      }
      messageApi.success("Marked all notifications as read");
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
        router.push(`/user-dashboard/rental-history`);
      } else if (type === "request_success") {
        router.push(`/user-dashboard/request-status`);
      } else if (type === "resident_success") {
        router.push(`/user-dashboard/rental-history`);
      } else if (type === "payment_success") {
        router.push(`/user-dashboard/my-contracts/${contractId}`);
      }
      setNotificationOpen(false);
    } catch (err) {
      console.error("Error update notification:", err);
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
          Notifications
        </Typography.Title>
        <Typography.Link onClick={markAllAsRead}>
          Mark all as read
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
                      {item.type === "booking_success" && "Rental Booking"}
                      {item.type === "request_success" && "Rental Request"}
                      {item.type === "resident_success" && "Rental resident"}
                      {item.type === "payment_success" && "Payment request"}
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
            <span className="ml-2 text-sm text-gray-500">Loading more...</span>
          </div>
        )}
      </div>
      {displayedNotifications.length < notifications.length &&
        !isLoadingMore && (
          <div className="text-center p-3 border-t">
            <Typography.Link onClick={loadMoreNotifications}>
              Load more notifications (
              {notifications.length - displayedNotifications.length} remaining)
            </Typography.Link>
          </div>
        )}
      {displayedNotifications.length >= notifications.length &&
        notifications.length > notificationsPerPage && (
          <div className="text-center p-3 border-t">
            <span className="text-sm text-gray-500">
              All notifications loaded
            </span>
          </div>
        )}
    </div>
  );

  // Tạo avatar URL từ session data
  const getAvatarUrl = () => {
    const userProfile = session?.user?.userProfile;
    if (!userProfile?.avatar) {
      return "/images/default/avatar.jpg";
    }
    return userProfile.avatar.startsWith("http")
      ? userProfile.avatar
      : `${URL_IMAGE}${userProfile.avatar}`;
  };

  // Update avatar URL khi session thay đổi
  useEffect(() => {
    setCurrentAvatarUrl(getAvatarUrl());
  }, [session]);

  // Listen for avatar update events
  useEffect(() => {
    const handleAvatarUpdate = (event: any) => {
      if (event.detail?.newAvatarUrl) {
        setCurrentAvatarUrl(event.detail.newAvatarUrl);
      }
    };

    window.addEventListener("avatarUpdated", handleAvatarUpdate);

    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
    };
  }, []);

  // Handle scroll effect with enhanced animation
  // useEffect(() => {
  //   const handleScroll = () => {
  //     // const scrollY = window.scrollY;
  //     // setIsScrolled(scrollY > 20);
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigateToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
    targetPage?: string,
    isExternal?: boolean
  ) => {
    if (isExternal) {
      // For external pages like blogs, don't prevent default navigation
      return;
    }

    e.preventDefault();
    setActiveItem(targetId);

    if (targetPage) {
      router.push(`${targetPage}#${targetId}`);
      setTimeout(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } else {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  const navigationItems = [
    { href: "/users#home", label: "Home", icon: HiOutlineHome, id: "home" },
    {
      href: "/users#rental-rooms",
      label: "Rental Rooms",
      icon: HiOutlineOfficeBuilding,
      id: "rental-rooms",
    },
    {
      href: "/users#landlords",
      label: "Landlords",
      icon: HiOutlineUsers,
      id: "landlords",
    },
    {
      href: "/blogs",
      label: "Blogs",
      icon: HiOutlineDocumentText,
      id: "blogs",
      isExternal: true,
    },
    {
      href: "/users#contact",
      label: "Contact",
      icon: HiOutlinePhone,
      id: "contact",
    },
  ];

  const dropdownItems = [
    {
      key: "logout",
      label: (
        <button
          className="flex items-center justify-start gap-3 w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
          onClick={() => {
            signOut({ callbackUrl: "/auth/login" });
          }}
        >
          <IoIosLogOut className="text-xl transition-transform duration-200 hover:rotate-12" />
          <span className="!font-medium">Logout</span>
        </button>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <header
        className={` ${
          fixed ? "fixed" : "absolute"
        } top-0 left-0 w-full z-50 h-[85px] !bg-white/95 ${
          fixed ? "shadow-lg" : "shadow-xs"
        } border-b border-gray-200/50`}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 !bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 hover:opacity-100 transition-opacity duration-700"></div>

        <div className="relative max-w-7xl mx-auto h-full flex items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Logo with enhanced animation */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl p-2.5 !bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <div className="absolute inset-0 !bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <Image
                src="/images/logo-ant.png"
                alt="Ants"
                width={48}
                height={48}
                priority
                className="relative object-contain w-auto h-10 brightness-0 invert transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="!text-xl !font-bold !bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 !bg-clip-text !text-transparent transition-all duration-300 group-hover:scale-105 group-hover:tracking-wide">
                Ants
              </h1>
              <div className="h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-500"></div>
            </div>
          </div>

          {/* Desktop Navigation with enhanced animations */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <li
                    key={item.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Link
                      href={item.href}
                      onClick={(e) =>
                        handleNavigateToSection(e, item.id, "/users", item.isExternal)
                      }
                      className={`flex items-center gap-2 px-4 py-3 font-medium transition-all duration-300 rounded-xl group relative overflow-hidden border border-transparent hover:border-blue-200/50 ${
                        isActive
                          ? "text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl scale-0 group-hover:scale-100"></div>

                      {/* Floating particles effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div
                          className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="absolute bottom-2 left-2 w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: "200ms" }}
                        ></div>
                        <div
                          className="absolute top-3 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-bounce"
                          style={{ animationDelay: "400ms" }}
                        ></div>
                      </div>

                      <Icon className="relative w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                      <span className="relative transition-all duration-300 group-hover:tracking-wide">
                        {item.label}
                      </span>

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Actions with enhanced animations */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/user-dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:scale-105 group"
                >
                  <span className="hidden sm:inline transition-all duration-300 group-hover:tracking-wide">
                    Dashboard
                  </span>
                </Link>

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
                      className="text-xl cursor-pointer text-gray-700 hover:text-blue-500 transition-all duration-300 hover:scale-110"
                      onClick={() => setNotificationOpen(!notificationOpen)}
                    />
                  </Badge>
                </Popover>

                <Dropdown
                  menu={{ items: dropdownItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                  overlayClassName="user-dropdown"
                >
                  <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl cursor-pointer transition-all duration-300 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg hover:scale-105 group">
                    <div className="relative">
                      <Avatar
                        src={
                          currentAvatarUrl && currentAvatarUrl !== ""
                            ? currentAvatarUrl
                            : null
                        }
                        size={36}
                        className="border-2 border-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div className="hidden md:block">
                      <span className="!text-sm !font-medium opacity-90 transition-all duration-300 group-hover:text-blue-600">
                        Hi, {session.user?.userProfile?.fullName || "User"}
                      </span>
                    </div>
                  </div>
                </Dropdown>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/register"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:scale-105 group"
                >
                  <AiOutlineUserAdd className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span className="hidden sm:inline transition-all duration-300 group-hover:tracking-wide">
                    Register
                  </span>
                </Link>

                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:scale-105 group"
                >
                  <IoLogInOutline className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  <span className="hidden sm:inline transition-all duration-300 group-hover:tracking-wide">
                    Login
                  </span>
                </Link>

                <Link
                  href="/auth/register"
                  className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-full transition-all duration-700"></div>
                  </div>

                  <FaRegEdit className="relative w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                  <span className="relative hidden sm:inline transition-all duration-300 group-hover:tracking-wide">
                    Create Post
                  </span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button with animation */}
            <button
              onClick={toggleMobileMenu}
              className={`lg:hidden p-2.5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:bg-gray-100 group ${
                isMobileMenuOpen ? "rotate-90 bg-gray-100" : ""
              }`}
              aria-label="Toggle navigation menu"
            >
              <RxHamburgerMenu
                className={`w-6 h-6 text-gray-700 transition-all duration-300 ${
                  isMobileMenuOpen ? "scale-110" : "group-hover:scale-110"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay with animation */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Mobile Menu with enhanced animations */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl z-50 lg:hidden transform transition-all duration-500 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/80 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:rotate-90 group"
            aria-label="Close navigation menu"
          >
            <IoClose className="w-6 h-6 text-gray-600 transition-transform duration-300 group-hover:scale-110" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.id}
                  className="animate-slideInRight"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: isMobileMenuOpen ? 1 : 0,
                  }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300 text-gray-700 font-medium group hover:scale-105 hover:shadow-md border border-transparent hover:border-blue-200/30"
                    onClick={(e) => {
                      handleNavigateToSection(e, item.id, "/users", item.isExternal);
                      toggleMobileMenu();
                    }}
                  >
                    <Icon className="w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                    <span className="transition-all duration-300 group-hover:tracking-wide">
                      {item.label}
                    </span>

                    {/* Arrow indicator */}
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className="w-2 h-2 border-r-2 border-b-2 border-blue-500 transform rotate-45"></div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile menu footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50/80 to-transparent">
          <div className="text-center text-sm text-gray-500">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3"></div>
            Ants © 2025
          </div>
        </div>
      </div>

      {/* Spacer with smooth transition */}
      <div className="h-[85px]"></div>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
}
