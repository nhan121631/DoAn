import React from "react";
import { MdBlock } from "react-icons/md";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 dark:from-[#232946] dark:via-[#1a1a2e] dark:to-[#0f3460] text-gray-900 dark:text-white">
      <div className="flex flex-col items-center p-8 rounded-xl shadow-lg bg-white/80 dark:bg-[#232946]/80">
        <MdBlock className="text-red-500 dark:text-red-400" size={80} />
        <h1 className="mt-4 text-3xl font-bold">Access Denied</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          You do not have permission to view this page.
        </p>
        <div className="flex gap-4 mt-6">
          <Link
            href="/auth/login"
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Login
          </Link>
          <Link
            href="/"
            className="px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
