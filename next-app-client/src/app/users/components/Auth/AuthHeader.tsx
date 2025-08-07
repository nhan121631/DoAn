"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IoLogInOutline } from "react-icons/io5";
import { usePathname } from "next/navigation";

export default function AuthHeader() {
  const pathname = usePathname();
  const showLoginButton = pathname !== "/auth/login";
  return (
    <header className="absolute top-0 left-0 z-50 flex items-center justify-between w-full h-[80px] px-4 md:px-8 shadow-md">
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/users">
          <Image
            src="/images/logo-ant.png"
            alt="JustHome"
            width={100}
            height={40}
            priority
            style={{ width: "auto" }}
          />
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-6 ">
        {/* Conditionally render the Login button */}
        {showLoginButton && (
          <Link href="/auth/login" passHref>
            <button className="flex items-center gap-1 p-2 text-white transition duration-300 rounded-full shadow cursor-pointer md:px-4 md:py-2 md:gap-2 hover:bg-white/30">
              <IoLogInOutline className="w-5 h-5" />
              <span className="hidden md:inline">Login</span>
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
