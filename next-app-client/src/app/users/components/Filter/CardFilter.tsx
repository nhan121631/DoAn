/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useFilterStore } from "@/stores/FilterStore";
import { useRouter } from "next/navigation";

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
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-4 w-[300px]">
      <div>
        <h3 className="font-semibold text-[15px] mb-2 text-gray-800">
          Price Range
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {priceRanges.map((range) => {
            const isActive =
              item.minPrice === range.min && item.maxPrice === range.max;
            return (
              <a
                key={range.label}
                href="#"
                className={`flex items-center gap-1 text-[14px] ${
                  isActive
                    ? "text-orange-500 font-bold"
                    : "text-sky-700 hover:text-orange-500"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  let filter;
                  if (isActive) {
                    // Bỏ filter nếu đang active: set về 0 để đồng bộ với store
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
                  const queryString = new URLSearchParams(queryObj).toString();
                  router.push(`/users${queryString ? "?" + queryString : ""}`);
                }}
              >
                <span className="text-orange-500">&gt;</span> {range.label}
              </a>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-[15px] mb-2 text-gray-800">Area</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {areaRanges.map((range) => {
            const isActive =
              item.minArea === range.min && item.maxArea === range.max;
            return (
              <a
                key={range.label}
                href="#"
                className={`flex items-center gap-1 text-[14px] ${
                  isActive
                    ? "text-orange-500 font-bold"
                    : "text-sky-700 hover:text-orange-500"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  let filter;
                  if (isActive) {
                    // Bỏ filter nếu đang active: set về 0 để đồng bộ với store
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
                  const queryString = new URLSearchParams(queryObj).toString();
                  router.push(`/users${queryString ? "?" + queryString : ""}`);
                }}
              >
                <span className="text-orange-500">&gt;</span> {range.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
