"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <header className="h-[80px] absolute top-0 left-0 w-full flex items-center justify-between px-4 md:px-8 shadow-md z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 md:gap-4">
        <Image
          src="/images/logo-ant.png"
          alt="JustHome"
          width={100}
          height={40}
          priority
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
        <button className="flex items-center gap-1 p-2 text-white transition duration-300 rounded-full shadow cursor-pointer md:px-4 md:py-2 md:gap-2 hover:bg-white/30">
          <AiOutlineUserAdd className="w-5 h-5" />
          <span className="hidden md:inline">Register</span>
        </button>
        <button className="flex items-center gap-1 p-2 text-white transition duration-300 rounded-full shadow cursor-pointer md:px-4 md:py-2 md:gap-2 hover:bg-white/30">
          <IoLogInOutline className="w-5 h-5" />
          <span className="hidden md:inline">Login</span>
        </button>
        <button className="flex items-center gap-1 p-2 transition duration-300 bg-white rounded-full shadow cursor-pointer hover:bg-gray-300 text-stone-900 md:px-4 md:py-2 md:gap-2">
          <FaRegEdit className="w-5 h-5" />
          <span className="hidden md:inline">Create Post</span>
        </button>

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
              href="/home"
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="/users/settings"
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
              onClick={toggleMobileMenu}
            >
              Rental rooms
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="/users/profile"
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
              onClick={toggleMobileMenu}
            >
              Landlords
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="/users/notifications"
              className="block w-full px-4 py-2 text-left rounded-md hover:bg-amber-100"
              onClick={toggleMobileMenu}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
