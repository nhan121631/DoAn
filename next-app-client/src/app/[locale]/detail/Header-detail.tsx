"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { signOut, useSession } from "next-auth/react";
import { Avatar, Dropdown } from "antd";
import { IoIosLogOut } from "react-icons/io";

export default function HeaderUserDashboard() {
  const { data: session } = useSession();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigateToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
    targetPage?: string
  ) => {
    e.preventDefault();

    if (targetPage) {
      // Navigate to different page with hash using Next.js router
      router.push(`${targetPage}#${targetId}`);

      // Wait for navigation then scroll to element
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
      // Scroll to element on current page
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  const items = [
    {
      key: "logout",
      label: (
        <button
          className="flex items-center justify-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => {
            signOut({ callbackUrl: "/auth/login" });
          }}
        >
          <IoIosLogOut className="text-2xl" /> Logout
        </button>
      ),
    },
  ];

  return (
    <header className="h-[80px] bg-gray-900 top-0 left-0 min-w-screen flex items-center justify-between px-4 md:px-8 shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2 overflow-hidden md:gap-4">
        <Image
          src="/images/logo-ant.png"
          alt="JustHome"
          width={100}
          height={40}
          priority
          className="object-contain w-auto max-h-full"
          style={{ width: "auto" }} // Đảm bảo giữ đúng tỷ lệ khi height thay đổi
        />
      </div>

      <nav className="hidden md:block">
        <ul className="flex gap-4 text-lg lg:gap-8">
          <li>
            <Link
              href="/users#home"
              onClick={(e) => handleNavigateToSection(e, "home", "/users")}
              className="flex items-center gap-1 p-2 !text-white transition duration-300 rounded-full cursor-pointer md:px-4 md:py-2 md:gap-2 hover:!bg-white/30"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/users#rental-rooms"
              onClick={(e) =>
                handleNavigateToSection(e, "rental-rooms", "/users")
              }
              className="flex items-center gap-1 p-2 !text-white transition duration-300 rounded-full cursor-pointer md:px-4 md:py-2 md:gap-2 hover:!bg-white/30"
            >
              Rental rooms
            </Link>
          </li>
          <li>
            <Link
              href="/users#landlords"
              onClick={(e) => handleNavigateToSection(e, "landlords", "/users")}
              className="flex items-center gap-1 p-2 !text-white transition duration-300 rounded-full cursor-pointer md:px-4 md:py-2 md:gap-2 hover:!bg-white/30"
            >
              Landlords
            </Link>
          </li>
          <li>
            <Link
              href="/users#contact"
              onClick={(e) => handleNavigateToSection(e, "contact", "/users")}
              className="flex items-center gap-1 p-2 !text-white transition duration-300 rounded-full cursor-pointer md:px-4 md:py-2 md:gap-2 hover:!bg-white/30"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex items-center gap-2 md:gap-6">
        {session ? (
          <>
            <Link
              href="/user-dashboard"
              className="flex items-center gap-1 p-2 text-white transition duration-300 rounded-full shadow cursor-pointer md:px-4 md:py-2 md:gap-2 hover:bg-white/30"
            >
              {/* <AiOutlineUserAdd className="w-5 h-5" /> */}
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <Dropdown
              menu={{ items }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar src="https://i.pravatar.cc/40" alt="User Avatar" />
                <span className="font-semibold text-white">
                  Hi, {session.user?.userProfile?.fullName || "User"}
                </span>
              </div>
            </Dropdown>
          </>
        ) : (
          <>
            <Link
              href="/auth/register"
              className="flex items-center gap-1 p-2 text-white transition duration-300 rounded-full shadow cursor-pointer md:px-4 md:py-2 md:gap-2 hover:bg-white/30"
            >
              <AiOutlineUserAdd className="w-5 h-5" />
              <span className="hidden md:inline">Register</span>
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-1 p-2 text-white transition duration-300 rounded-full shadow cursor-pointer md:px-4 md:py-2 md:gap-2 hover:bg-white/30"
            >
              <IoLogInOutline className="w-5 h-5" />
              <span className="hidden md:inline">Login</span>
            </Link>
            <Link
              href="/users/register"
              className="flex items-center gap-1 p-2 transition duration-300 bg-white rounded-full shadow cursor-pointer hover:bg-gray-300 text-stone-900 md:px-4 md:py-2 md:gap-2"
            >
              <FaRegEdit className="w-5 h-5" />
              <span className="hidden md:inline">Create Post</span>
            </Link>
          </>
        )}

        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Toggle navigation menu"
          >
            <RxHamburgerMenu className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-opacity-0 md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-1/2 md:hidden shadow-lg py-4 z-40 bg-white bg-opacity-70 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end px-4 py-2">
          <button
            onClick={toggleMobileMenu}
            className="text-2xl text-gray-700 hover:text-yellow-400"
            aria-label="Close navigation menu"
          >
            &times; {/* Close icon */}
          </button>
        </div>
        <ul className="flex flex-col items-start gap-4 px-4 text-lg">
          <li className="w-full">
            <Link
              href="/users#home"
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
              onClick={(e) => {
                handleNavigateToSection(e, "home", "/users");
                toggleMobileMenu();
              }}
            >
              Home
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="/users#rental-rooms"
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
              onClick={(e) => {
                handleNavigateToSection(e, "rental-rooms", "/users");
                toggleMobileMenu();
              }}
            >
              Rental rooms
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="/users#landlords"
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
              onClick={(e) => {
                handleNavigateToSection(e, "landlords", "/users");
                toggleMobileMenu();
              }}
            >
              Landlords
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="/users#contact"
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
              onClick={(e) => {
                handleNavigateToSection(e, "contact", "/users");
                toggleMobileMenu();
              }}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
