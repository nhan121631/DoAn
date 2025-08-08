"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { Avatar, Dropdown } from "antd";
import { signOut, useSession } from "next-auth/react";
import { IoIosLogOut } from "react-icons/io";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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
    <header className="h-[80px] absolute top-0 left-0 w-full flex items-center justify-between px-4 md:px-8 shadow-md z-50">
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
              href="#home"
              onClick={(e) => handleSmoothScroll(e, "home")}
              className="flex items-center gap-1 p-2 text-white transition duration-300 rounded-full cursor-pointer md:px-4 md:py-2 md:gap-2 hover:bg-white/30"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="#rental-rooms"
              onClick={(e) => handleSmoothScroll(e, "rental-rooms")}
              className="flex items-center gap-1 p-2 text-white transition duration-300 rounded-full cursor-pointer md:px-4 md:py-2 md:gap-2 hover:bg-white/30"
            >
              Rental rooms
            </Link>
          </li>
          <li>
            <Link
              href="#landlords"
              onClick={(e) => handleSmoothScroll(e, "landlords")}
              className="flex items-center gap-1 p-2 text-white transition duration-300 rounded-full cursor-pointer md:px-4 md:py-2 md:gap-2 hover:bg-white/30"
            >
              Landlords
            </Link>
          </li>
          <li>
            <Link
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, "contact")}
              className="flex items-center gap-1 p-2 text-white transition duration-300 rounded-full cursor-pointer md:px-4 md:py-2 md:gap-2 hover:bg-white/30"
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
                <Avatar src="https://i.pravatar.cc/40" />
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
              href="#home"
              onClick={(e) => handleSmoothScroll(e, "home")}
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
            >
              Home
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="#rental-rooms"
              onClick={(e) => handleSmoothScroll(e, "rental-rooms")}
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
            >
              Rental rooms
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="#landlords"
              onClick={(e) => handleSmoothScroll(e, "landlords")}
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
            >
              Landlords
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, "contact")}
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
