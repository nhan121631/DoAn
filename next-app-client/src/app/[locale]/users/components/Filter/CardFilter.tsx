/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useFilterStore } from "@/stores/FilterStore";
import { useRouter } from "next/navigation";
import FilterLoadingOverlay from "./FilterLoadingOverlay";

export default function CardFilter() {
  const { item, isLoading, applyFilters, setLoading } = useFilterStore(
    (state) => state
  );
  const router = useRouter();

  // Helper: convert filter object to query params
  const filterToQuery = (filter: any) => {
    const query: Record<string, string> = {};
    if (filter.minPrice !== undefined && filter.minPrice !== 0)
      query.minPrice = String(filter.minPrice);
    if (filter.maxPrice !== undefined && filter.maxPrice !== 0)
      query.maxPrice = String(filter.maxPrice);
    if (filter.minArea !== undefined && filter.minArea !== 0)
      query.minArea = String(filter.minArea);
    if (filter.maxArea !== undefined && filter.maxArea !== 0)
      query.maxArea = String(filter.maxArea);
    if (filter.provinceId && filter.provinceId !== 0)
      query.provinceId = String(filter.provinceId);
    if (filter.districtId && filter.districtId !== 0)
      query.districtId = String(filter.districtId);
    if (filter.wardId && filter.wardId !== 0)
      query.wardId = String(filter.wardId);
    if (filter.listConvenientIds && filter.listConvenientIds.length > 0)
      query.listConvenientIds = filter.listConvenientIds.join(",");
    return query;
  };
  // Price and area filter options
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
  return (
    <FilterLoadingOverlay isVisible={isLoading}>
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 backdrop-blur-lg border border-blue-100/50 rounded-2xl p-6 flex flex-col gap-6 w-[320px] transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
        {/* Header with gradient */}
        <div className="text-center pb-2 border-b border-gradient-to-r from-transparent via-blue-200/50 to-transparent">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-wide">
            Advanced Filters
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Refine your search results
          </p>
        </div>

        {/* Price Range Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            <h3 className="font-bold text-base text-gray-800 tracking-wide">
              Price Range
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {priceRanges.map((range) => {
              const isActive =
                item.minPrice === range.min && item.maxPrice === range.max;
              return (
                <button
                  key={range.label}
                  className={`group relative overflow-hidden px-3 py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-lg shadow-orange-500/25"
                      : "bg-white/70 text-gray-700 border-gray-200/50 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-700"
                  }`}
                  onClick={async (e) => {
                    e.preventDefault();

                    // Set loading state
                    setLoading(true);

                    try {
                      let filter;
                      if (isActive) {
                        filter = {
                          ...item,
                          minPrice: undefined,
                          maxPrice: undefined,
                        };
                      } else {
                        filter = {
                          ...item,
                          minPrice: range.min,
                          maxPrice: range.max,
                        };
                      }

                      applyFilters(filter);
                      const queryObj = filterToQuery(filter);
                      const queryString = new URLSearchParams(
                        queryObj
                      ).toString();

                      // Simulate network delay for better UX
                      await new Promise((resolve) => setTimeout(resolve, 500));

                      router.push(
                        `/users${queryString ? "?" + queryString : ""}`
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-full transition-all duration-700"></div>
                  </div>

                  <span className="relative flex items-center gap-1 text-left w-full">
                    {!isActive && (
                      <span className="text-orange-500 text-xs">₫</span>
                    )}
                    {range.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Area Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            <h3 className="font-bold text-base text-gray-800 tracking-wide">
              Area Range
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {areaRanges.map((range) => {
              const isActive =
                item.minArea === range.min && item.maxArea === range.max;
              return (
                <button
                  key={range.label}
                  className={`group relative overflow-hidden px-3 py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-lg shadow-orange-500/25"
                      : "bg-white/70 text-gray-700 border-gray-200/50 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-700"
                  }`}
                  onClick={async (e) => {
                    e.preventDefault();

                    // Set loading state
                    setLoading(true);

                    try {
                      let filter;
                      if (isActive) {
                        filter = {
                          ...item,
                          minArea: undefined,
                          maxArea: undefined,
                        };
                      } else {
                        filter = {
                          ...item,
                          minArea: range.min,
                          maxArea: range.max,
                        };
                      }

                      applyFilters(filter);
                      const queryObj = filterToQuery(filter);
                      const queryString = new URLSearchParams(
                        queryObj
                      ).toString();

                      // Simulate network delay for better UX
                      await new Promise((resolve) => setTimeout(resolve, 500));

                      router.push(
                        `/users${queryString ? "?" + queryString : ""}`
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-full transition-all duration-700"></div>
                  </div>

                  <span className="relative flex items-center gap-1 text-left w-full">
                    {!isActive && (
                      <span className="text-orange-500 text-xs">◘</span>
                    )}
                    {range.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer gradient line */}
        <div className="h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-full opacity-20"></div>
      </div>
    </FilterLoadingOverlay>
  );
}
