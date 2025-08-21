/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useFilterStore } from "@/stores/FilterStore";
import { useRouter } from "next/navigation";
import { FaDollarSign, FaRuler, FaFilter } from "react-icons/fa";
import styles from "./CardFilter.module.css";

export default function CardFilter() {
  const { item, applyFilters } = useFilterStore((state) => state);
  const router = useRouter();

  // Helper: convert filter object to query params
  const filterToQuery = (filter: any) => {
    const query: Record<string, string> = {};
    if (filter.minPrice !== undefined) query.minPrice = String(filter.minPrice);
    if (filter.maxPrice !== undefined) query.maxPrice = String(filter.maxPrice);
    if (filter.minArea !== undefined) query.minArea = String(filter.minArea);
    if (filter.maxArea !== undefined) query.maxArea = String(filter.maxArea);
    if (filter.provinceId) query.provinceId = String(filter.provinceId);
    if (filter.districtId) query.districtId = String(filter.districtId);
    if (filter.wardId) query.wardId = String(filter.wardId);
    if (filter.listConvenientIds && filter.listConvenientIds.length > 0)
      query.listConvenientIds = filter.listConvenientIds.join(",");
    return query;
  };

  // Các giá trị filter mẫu
  const priceRanges = [
    { label: "Under 1M", min: 0, max: 1000000 },
    { label: "1-2M", min: 1000000, max: 2000000 },
    { label: "2-3M", min: 2000000, max: 3000000 },
    { label: "3-5M", min: 3000000, max: 5000000 },
    { label: "5-7M", min: 5000000, max: 7000000 },
    { label: "7-10M", min: 7000000, max: 10000000 },
    { label: "10-15M", min: 10000000, max: 15000000 },
    { label: "Above 15M", min: 15000000, max: undefined },
  ];

  const areaRanges = [
    { label: "Under 20m²", min: 0, max: 20 },
    { label: "20-30m²", min: 20, max: 30 },
    { label: "30-50m²", min: 30, max: 50 },
    { label: "50-70m²", min: 50, max: 70 },
    { label: "70-90m²", min: 70, max: 90 },
    { label: "Above 90m²", min: 90, max: undefined },
  ];

  const handleFilterClick = (type: "price" | "area", range: any) => {
    let filter;
    const isActive =
      type === "price"
        ? item.minPrice === range.min && item.maxPrice === range.max
        : item.minArea === range.min && item.maxArea === range.max;

    if (isActive) {
      // Bỏ filter nếu đang active
      filter = {
        ...item,
        ...(type === "price"
          ? { minPrice: undefined, maxPrice: undefined }
          : { minArea: undefined, maxArea: undefined }),
      };
    } else {
      filter = {
        ...item,
        ...(type === "price"
          ? { minPrice: range.min, maxPrice: range.max }
          : { minArea: range.min, maxArea: range.max }),
      };
    }

    applyFilters(filter);
    const queryObj = filterToQuery(filter);
    const queryString = new URLSearchParams(queryObj).toString();
    router.push(`/users${queryString ? "?" + queryString : ""}`);
  };

  return (
    <div
      className={`relative bg-white shadow-xl rounded-2xl p-6 w-[320px] overflow-hidden ${styles.animateFadeIn}`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60"></div>

      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
      <div
        className={`absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse ${styles.animationDelay2000}`}
      ></div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <FaFilter className="text-white text-sm" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Filter Options
          </h2>
        </div>

        {/* Price Range Section */}
        <div className={styles.animateSlideInUp}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg">
              <FaDollarSign className="text-white text-xs" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Price Range</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {priceRanges.map((range, index) => {
              const isActive =
                item.minPrice === range.min && item.maxPrice === range.max;
              return (
                <button
                  key={range.label}
                  className={`
                    relative overflow-hidden text-sm font-medium rounded-xl px-3 py-2.5 transition-all duration-300 transform hover:scale-105
                    ${styles.animateFadeInScale}
                    ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
                        : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-orange-100 hover:to-red-100 hover:text-orange-600 hover:shadow-md"
                    }
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleFilterClick("price", range)}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    <span
                      className={`text-xs ${
                        isActive ? "text-orange-200" : "text-orange-500"
                      }`}
                    >
                      ▶
                    </span>
                    {range.label}
                  </span>
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Area Range Section */}
        <div
          className={`${styles.animateSlideInUp} ${styles.animationDelay400}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg">
              <FaRuler className="text-white text-xs" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Area Range</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {areaRanges.map((range, index) => {
              const isActive =
                item.minArea === range.min && item.maxArea === range.max;
              return (
                <button
                  key={range.label}
                  className={`
                    relative overflow-hidden text-sm font-medium rounded-xl px-3 py-2.5 transition-all duration-300 transform hover:scale-105
                    ${styles.animateFadeInScale}
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                        : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-purple-100 hover:to-pink-100 hover:text-purple-600 hover:shadow-md"
                    }
                  `}
                  style={{ animationDelay: `${(index + 8) * 0.1}s` }}
                  onClick={() => handleFilterClick("area", range)}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    <span
                      className={`text-xs ${
                        isActive ? "text-purple-200" : "text-purple-500"
                      }`}
                    >
                      ▶
                    </span>
                    {range.label}
                  </span>
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Count */}
        {(item.minPrice !== undefined || item.minArea !== undefined) && (
          <div
            className={`flex items-center justify-center gap-2 pt-2 border-t border-gray-200 ${styles.animateBounceIn}`}
          >
            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full text-white text-xs font-medium shadow-lg">
              {
                [item.minPrice, item.minArea].filter((val) => val !== undefined)
                  .length
              }{" "}
              filter(s) active
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
