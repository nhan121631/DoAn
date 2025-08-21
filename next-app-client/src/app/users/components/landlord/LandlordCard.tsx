import React from "react";
import Image from "next/image";
import { LandLordInfo } from "@/app/landlord/types";
import LandlordActionsWrapper from "./LandlordActionsWrapper";

interface LandLordInfoProps {
  landlord: LandLordInfo;
}

export default function LandlordCard({ landlord }: LandLordInfoProps) {
  return (
    <LandlordActionsWrapper landlord={landlord}>
      <div className="group relative w-[400px] overflow-hidden rounded-3xl bg-gradient-to-br from-white via-gray-50 to-white p-6 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:shadow-gray-900/50">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Glassmorphism border effect */}
        <div className="absolute inset-0 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm dark:border-gray-700/50" />

        <div className="relative flex items-center space-x-5">
          {/* Avatar with glow effect */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-75" />
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700">
              <Image
                src={landlord.avatar || "/images/nhann.png"}
                alt={`${landlord.name}'s avatar`}
                width={80}
                height={80}
                className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
              />
            </div>
            {/* Online status indicator */}
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-3 border-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg dark:border-gray-900">
              <div className="h-full w-full animate-pulse rounded-full bg-green-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-3">
              <h3 className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-xl font-bold text-transparent transition-all duration-300 group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 dark:from-gray-100 dark:via-white dark:to-gray-100">
                {landlord.name || "Landlord Name"}
              </h3>
              {/* Verified badge */}
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <svg
                className="h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-purple-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {landlord.address || "Property Address"}
              </p>
            </div>

            {/* Rating stars */}
            {/* <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 transition-all duration-300 ${
                    i < 4
                      ? "text-yellow-400 group-hover:text-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  } group-hover:scale-110`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200">
                4.8 (124 reviews)
              </span>
            </div> */}
          </div>

          {/* Arrow indicator */}
          <div className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div
            className="absolute -top-2 -left-2 h-2 w-2 animate-bounce rounded-full bg-blue-400/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-1/2 -right-1 h-1 w-1 animate-bounce rounded-full bg-purple-400/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute -bottom-1 left-1/3 h-1.5 w-1.5 animate-bounce rounded-full bg-pink-400/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
    </LandlordActionsWrapper>
  );
}
