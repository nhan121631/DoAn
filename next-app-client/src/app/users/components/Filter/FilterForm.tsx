"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import { getConvenients } from "@/services/Convenients";
import { FilterRequest, useFilterStore } from "@/stores/FilterStore";
import { Convenient, District, Province, Ward } from "@/types/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import FilterLoadingOverlay from "./FilterLoadingOverlay";
import LoadingSpinner from "./LoadingSpinner";
import { useDebounce } from "@/hooks/useDebounce";

type SelectOption = {
  label: string;
  value: string;
};

// Custom Select Component
interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
}

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  loading = false,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] =
    useState<SelectOption[]>(options);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange(undefined);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`w-full h-11 px-4 pr-10 text-left text-sm font-medium bg-white/90 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md focus:ring-4 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
          isOpen
            ? "border-blue-500 ring-4 ring-blue-500/20"
            : "border-gray-200/60 hover:border-blue-300"
        }`}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {loading ? "Loading..." : selectedOption?.label || placeholder}
        </span>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedOption && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 transition-all duration-300 text-gray-400 ${
              isOpen ? "rotate-180 text-blue-500" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-xl z-50 max-h-64 overflow-hidden animate-fadeIn">
          <div className="p-3 border-b border-gray-100/70">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 text-sm border border-gray-200/60 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-white/80"
                autoFocus
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-50 last:border-0 ${
                    option.value === value
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:text-blue-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {option.value === value && (
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-8 h-8 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6M7 8a3 3 0 016 0M7 8H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2h-2"
                    />
                  </svg>
                  <span>No results found</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default function FilterForm() {
  const [provinces, setProvinces] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [wards, setWards] = useState<SelectOption[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [convenients, setConvenients] = useState<Convenient[]>([]);
  const [selectedConvenients, setSelectedConvenients] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    province: "",
    district: "",
    ward: "",
  });

  const { applyFilters, item, isLoading, setLoading } = useFilterStore(
    (state) => state
  );
  const router = useRouter();

  useEffect(() => {
    const fetchInit = async () => {
      if (item.provinceId) {
        const data = await getDistricts(String(item.provinceId));
        const options = data.map((d: District) => ({
          label: d.name,
          value: String(d.id),
        }));
        setDistricts(options);
      }
      if (item.districtId) {
        const data = await getWards(String(item.districtId));
        const options = data.map((w: Ward) => ({
          label: w.name,
          value: String(w.id),
        }));
        setWards(options);
      }
    };
    fetchInit();
  }, [item.provinceId, item.districtId]);

  useEffect(() => {
    // Update form state from store
    setFormData({
      province: item.provinceId ? String(item.provinceId) : "",
      district: item.districtId ? String(item.districtId) : "",
      ward: item.wardId ? String(item.wardId) : "",
    });
    setSelectedConvenients(
      item.listConvenientIds ? item.listConvenientIds.map(String) : []
    );
  }, [item]);

  useEffect(() => {
    const fetchConvenients = async () => {
      try {
        const data = await getConvenients();
        setConvenients(data);
      } catch (error) {
        console.error("Failed to fetch convenients:", error);
      }
    };
    fetchConvenients();
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        const options = data.map((item: Province) => ({
          label: item.name,
          value: String(item.id),
        }));
        setProvinces(options);
      } catch (err) {
        console.error("Error fetching provinces", err);
      }
    };
    fetchProvinces();
  }, []);

  // Trigger filter and update URL param without reload
  const triggerFilterImmediate = async (
    updatedFormData?: any,
    updatedConvenients?: string[]
  ) => {
    setLoading(true);

    try {
      const currentFormData = updatedFormData || formData;
      const currentConvenients =
        updatedConvenients !== undefined
          ? updatedConvenients
          : selectedConvenients;

      const payload: FilterRequest = {
        // Preserve existing price and area filters
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        minArea: item.minArea,
        maxArea: item.maxArea,
        // Update address filters
        provinceId: currentFormData.province
          ? Number(currentFormData.province)
          : undefined,
        districtId: currentFormData.district
          ? Number(currentFormData.district)
          : undefined,
        wardId: currentFormData.ward ? Number(currentFormData.ward) : undefined,
        listConvenientIds:
          currentConvenients.length > 0
            ? currentConvenients.map(Number)
            : undefined,
      };

      applyFilters(payload);

      // Build query string
      const query: Record<string, string> = {};
      if (payload.minPrice !== undefined && payload.minPrice !== 0)
        query.minPrice = String(payload.minPrice);
      if (payload.maxPrice !== undefined && payload.maxPrice !== 0)
        query.maxPrice = String(payload.maxPrice);
      if (payload.minArea !== undefined && payload.minArea !== 0)
        query.minArea = String(payload.minArea);
      if (payload.maxArea !== undefined && payload.maxArea !== 0)
        query.maxArea = String(payload.maxArea);
      if (payload.provinceId !== undefined && payload.provinceId !== 0)
        query.provinceId = String(payload.provinceId);
      if (payload.districtId !== undefined && payload.districtId !== 0)
        query.districtId = String(payload.districtId);
      if (payload.wardId !== undefined && payload.wardId !== 0)
        query.wardId = String(payload.wardId);
      if (payload.listConvenientIds && payload.listConvenientIds.length > 0)
        query.listConvenientIds = payload.listConvenientIds.join(",");

      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      const queryString = new URLSearchParams(query).toString();
      router.replace(`/users${queryString ? "?" + queryString : ""}`, {
        scroll: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounced version for convenients
  const triggerFilter = useDebounce(triggerFilterImmediate, 300);

  const handleProvinceChange = async (provinceId: string | undefined) => {
    const updatedFormData = {
      ...formData,
      province: provinceId || "",
      district: "",
      ward: "",
    };
    setFormData(updatedFormData);
    setDistricts([]);
    setWards([]);

    if (provinceId) {
      setLoadingDistricts(true);
      try {
        const data = await getDistricts(provinceId);
        const options = data.map((item: District) => ({
          label: item.name,
          value: String(item.id),
        }));
        setDistricts(options);
      } catch (err) {
        console.error("Error fetching districts", err);
      } finally {
        setLoadingDistricts(false);
      }
    }
    triggerFilterImmediate(updatedFormData);
  };

  const handleDistrictChange = async (districtId: string | undefined) => {
    const updatedFormData = {
      ...formData,
      district: districtId || "",
      ward: "",
    };
    setFormData(updatedFormData);
    setWards([]);

    if (districtId) {
      setLoadingWards(true);
      try {
        const data = await getWards(districtId);
        const options = data.map((item: Ward) => ({
          label: item.name,
          value: String(item.id),
        }));
        setWards(options);
      } catch (err) {
        console.error("Error fetching wards", err);
      } finally {
        setLoadingWards(false);
      }
    }
    triggerFilterImmediate(updatedFormData);
  };

  const handleWardChange = (wardId: string | undefined) => {
    const updatedFormData = { ...formData, ward: wardId || "" };
    setFormData(updatedFormData);
    triggerFilterImmediate(updatedFormData);
  };

  const handleConvenientToggle = async (convenientId: string) => {
    const updated = selectedConvenients.includes(convenientId)
      ? selectedConvenients.filter((id) => id !== convenientId)
      : [...selectedConvenients, convenientId];

    setSelectedConvenients(updated);
    // Use debounced version for convenients to avoid too many rapid calls
    triggerFilter(undefined, updated);
  };

  return (
    <FilterLoadingOverlay isVisible={isLoading}>
      <div className="w-[320px] bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-lg border border-blue-100/50 rounded-3xl p-6 flex flex-col gap-6">
        {/* Header with gradient */}
        <div className="text-center pb-4 border-b  border-gradient-to-r from-transparent via-blue-200/50 to-transparent">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-wide">
            Advanced Filters
          </h2>
          <p className="text-sm text-gray-500 mt-1">Find your perfect room</p>
        </div>

        {/*
      Address Section
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-base text-gray-800">Location</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Province/City
            </label>
            <CustomSelect
              options={provinces}
              value={formData.province}
              onChange={handleProvinceChange}
              placeholder="All Provinces"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              District
            </label>
            <CustomSelect
              options={districts}
              value={formData.district}
              onChange={handleDistrictChange}
              placeholder="All Districts"
              disabled={districts.length === 0}
              loading={loadingDistricts}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Ward
            </label>
            <CustomSelect
              options={wards}
              value={formData.ward}
              onChange={handleWardChange}
              placeholder="All Wards"
              disabled={wards.length === 0}
              loading={loadingWards}
            />
          </div>
        </div>
      </div>
      */}

        {/* Convenients Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-base text-gray-800">Convenients</h3>
            </div>

            {selectedConvenients.length > 0 && (
              <div className="px-2 py-1 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-xs font-semibold rounded-full border border-violet-200">
                {selectedConvenients.length}
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {convenients.map((convenient) => {
              const isSelected = selectedConvenients.includes(
                String(convenient.id)
              );
              return (
                <button
                  key={convenient.id}
                  type="button"
                  onClick={() => handleConvenientToggle(String(convenient.id))}
                  disabled={isLoading}
                  className={`group w-full p-3 text-left rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    isSelected
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-400 shadow-lg shadow-violet-500/25"
                      : "bg-white/80 text-gray-700 border-gray-200/60 hover:border-violet-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:text-violet-700 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {convenient.name.replace(/_/g, " ")}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? "bg-white/20 border-white/40"
                          : "border-gray-300 group-hover:border-violet-300"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedConvenients.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                setSelectedConvenients([]);
                await triggerFilterImmediate(undefined, []);
              }}
              className="w-full text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors duration-200 hover:bg-violet-50 px-3 py-2 rounded-lg border border-violet-200/50 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" text="Clearing..." />
              ) : (
                "Clear all selections"
              )}
            </button>
          )}
        </div>

        {/* Footer gradient line */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 rounded-full opacity-30"></div>

        {/* styles moved to filterform.module.css */}
      </div>
    </FilterLoadingOverlay>
  );
}
