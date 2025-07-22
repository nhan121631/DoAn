"use client";

import React, { useState } from 'react';
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
        <ul className="flex gap-4 lg:gap-8 text-lg">
          <li>
            <Link
              href="/home"
              className="hover:text-yellow-400 transition text-white"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/users/settings"
              className="hover:text-yellow-400 transition text-white"
            >
              Rental rooms
            </Link>
          </li>
          <li>
            <Link
              href="/users/profile"
              className="hover:text-yellow-400 transition text-white"
            >
              Landlords
            </Link>
          </li>
          <li>
            <Link
              href="/users/notifications"
              className="hover:text-yellow-400 transition text-white"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex items-center gap-2 md:gap-6"> 
        <button className="text-white p-2 md:px-4 md:py-2 rounded-full font-semibold shadow flex items-center gap-1 md:gap-2 hover:bg-white/30 transition duration-300 cursor-pointer">
          <AiOutlineUserAdd className="h-5 w-5" />
          <span className="hidden md:inline">Register</span> 
        </button>
        <button className="text-white p-2 md:px-4 md:py-2 rounded-full font-semibold shadow flex items-center gap-1 md:gap-2 hover:bg-white/30 transition duration-300 cursor-pointer">
          <IoLogInOutline className="h-5 w-5" />
          <span className="hidden md:inline">Login</span> 



        </button>
        <button className="bg-amber-600 hover:bg-amber-700 text-white p-2 md:px-4 md:py-2 rounded-full font-semibold shadow flex items-center gap-1 md:gap-2 transition duration-300 cursor-pointer">
          <FaRegEdit className="h-5 w-5" />
          <span className="hidden md:inline">Create Post</span>
        </button>

        <div className="md:hidden">
            <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Toggle navigation menu"
            >
            <RxHamburgerMenu className="h-6 w-6 text-white" />
            </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-opacity-0 z-30 md:hidden" 
          onClick={toggleMobileMenu} 
        ></div>
      )}

      
      <div className={`fixed top-0 right-0 h-full w-1/2 md:hidden shadow-lg py-4 z-40 bg-white bg-opacity-70 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-end px-4 py-2">
            <button
                onClick={toggleMobileMenu}
                className="text-gray-700 text-2xl hover:text-yellow-400"
                aria-label="Close navigation menu"
            >
                &times; {/* Close icon */}
            </button>
        </div>
        <ul className="flex flex-col items-start gap-4 text-lg px-4">
          <li className="w-full">
            <Link href="/home" className="block px-4 py-2 hover:bg-amber-100 rounded-md w-full text-left" onClick={toggleMobileMenu}>
              Home
            </Link>
          </li>
          <li className="w-full">
            <Link href="/users/settings" className="block px-4 py-2 hover:bg-amber-100 rounded-md w-full text-left" onClick={toggleMobileMenu}>
              Rental rooms
            </Link>
          </li>
          <li className="w-full">

            <Link href="/users/profile" className="block px-4 py-2 hover:bg-amber-100 rounded-md w-full text-left" onClick={toggleMobileMenu}>
              Landlords
            </Link>
          </li>
          <li className="w-full">

            <Link href="/users/notifications" className="block px-4 py-2 hover:bg-amber-100 rounded-md w-full text-left" onClick={toggleMobileMenu}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}