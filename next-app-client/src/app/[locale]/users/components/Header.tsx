/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { Avatar, Dropdown } from "antd";
import { signOut, useSession } from "next-auth/react";
import { IoIosLogOut } from "react-icons/io";
import { URL_IMAGE } from "@/services/Constant";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState("");

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

    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, []);

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
          className="flex items-center justify-center gap-3 w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
          onClick={() => {
            signOut({ callbackUrl: "/auth/login" });
          }}
        >
          <IoIosLogOut className="text-lg" />
          Logout
        </button>
      ),
    },
  ];

  return (
    <header className="h-20 fixed top-0 left-0 w-full flex items-center justify-between px-6 lg:px-12 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 overflow-hidden md:gap-4">
        <Image
          src="/images/logo-ant.png"
          alt="JustHome"
          width={100}
          height={40}
          priority
          className="object-contain w-auto max-h-full brightness-20"
          style={{ width: "auto" }} // Đảm bảo giữ đúng tỷ lệ khi height thay đổi
        />
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block">
        <ul className="flex items-center gap-1">
          <li>
            <Link
              href="#home"
              onClick={(e) => handleSmoothScroll(e, "home")}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="#rental-rooms"
              onClick={(e) => handleSmoothScroll(e, "rental-rooms")}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            >
              Rental rooms
            </Link>
          </li>
          <li>
            <Link
              href="#landlords"
              onClick={(e) => handleSmoothScroll(e, "landlords")}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            >
              Landlords
            </Link>
          </li>
          <li>
            <Link
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, "contact")}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        {session ? (
          <>
            {/* Dashboard Link */}
            <Link
              href="/user-dashboard"
              className="hidden md:flex items-center px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            >
              Dashboard
            </Link>

            {/* User Dropdown */}
            <Dropdown
              menu={{ items }}
              trigger={["click"]}
              placement="bottomRight"
              overlayClassName="mt-2"
            >
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <Avatar
                  src={currentAvatarUrl}

                  size={36}
                  className="border border-gray-200"
                />
                <span className="hidden md:block font-medium text-gray-700 max-w-32 truncate">
                  {session.user?.userProfile?.fullName || "User"}
                </span>
              </div>
            </Dropdown>
          </>
        ) : (
          <>
            {/* Register Link */}
            <Link
              href="/auth/register"
              className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            >
              <AiOutlineUserAdd className="w-4 h-4" />
              Register
            </Link>

            {/* Login Link */}
            <Link
              href="/auth/login"
              className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            >
              <IoLogInOutline className="w-4 h-4" />
              Login
            </Link>

            {/* Create Post Button */}
            <Link
              href="/users/register"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
            >
              <FaRegEdit className="w-4 h-4" />
              <span className="hidden md:inline">Create Post</span>
              <span className="md:hidden">Post</span>
            </Link>
          </>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle navigation menu"
        >
          <RxHamburgerMenu className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-sm lg:hidden bg-white shadow-xl z-40 transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close navigation menu"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="p-6">
          {/* Navigation Links */}
          <nav className="mb-8">
            <ul className="space-y-2">
              <li>
                <Link
                  href="#home"
                  onClick={(e) => {
                    handleSmoothScroll(e, "home");
                    toggleMobileMenu();
                  }}
                  className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#rental-rooms"
                  onClick={(e) => {
                    handleSmoothScroll(e, "rental-rooms");
                    toggleMobileMenu();
                  }}
                  className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Rental rooms
                </Link>
              </li>
              <li>
                <Link
                  href="#landlords"
                  onClick={(e) => {
                    handleSmoothScroll(e, "landlords");
                    toggleMobileMenu();
                  }}
                  className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Landlords
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  onClick={(e) => {
                    handleSmoothScroll(e, "contact");
                    toggleMobileMenu();
                  }}
                  className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile User Actions */}
          {session ? (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Link
                href="/user-dashboard"
                onClick={toggleMobileMenu}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar
                  src={currentAvatarUrl}
                  size={32}
                  className="border border-gray-200"
                />
                <span className="font-medium text-gray-700 truncate">
                  {session.user?.userProfile?.fullName || "User"}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Link
                href="/auth/register"
                onClick={toggleMobileMenu}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <AiOutlineUserAdd className="w-4 h-4" />
                Register
              </Link>
              <Link
                href="/auth/login"
                onClick={toggleMobileMenu}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <IoLogInOutline className="w-4 h-4" />
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
