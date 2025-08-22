/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import {
  updatePreferences,
  getUserPreferences,
} from "@/services/ProfileService";
import { Province, District, Ward } from "@/types/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type SelectOption = {
  label: string;
  value: string;
};

// Custom SearchableSelect Component
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  loading,
  error,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full h-11 px-3 text-sm font-medium bg-white border-2 rounded-lg transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-between ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
            : "hover:border-gray-300"
        } ${
          error
            ? "border-red-300 focus-within:border-red-500"
            : "border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
        } ${className}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {loading
            ? "Đang tải..."
            : selectedOption
            ? selectedOption.label
            : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
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

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors duration-150 ${
                    option.value === value
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700"
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export interface SuggestAddressBarProps {
  onChange?: (address: {
    specificAddress?: string;
    province?: string;
    district?: string;
    ward?: string;
    searchAddress: string;
  }) => void;
  initialValue?: {
    specificAddress?: string;
    province?: string;
    district?: string;
    ward?: string;
  };
  showSaveButton?: boolean;
  onSaveSuccess?: () => void;
}

function SuggestAddressBar({
  initialValue,
  showSaveButton = false,
  onSaveSuccess,
}: SuggestAddressBarProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    specificAddress: initialValue?.specificAddress || "",
    province: initialValue?.province || "",
    district: initialValue?.district || "",
    ward: initialValue?.ward || "",
  });

  // Data states
  const [provinces, setProvinces] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [wards, setWards] = useState<SelectOption[]>([]);

  // Loading states
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  // UI states
  const [currentPreferences, setCurrentPreferences] = useState<string | null>(
    null
  );
  const [showTooltip, setShowTooltip] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-hide tooltip
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // Auto-hide message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Load provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        const options = data.map((item: Province) => ({
          label: item.name,
          value: String(item.id),
        }));
        setProvinces(options);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Load user preferences
  useEffect(() => {
    if (session) {
      loadUserPreferences();
    }
  }, [session]);

  const showMessage = (type: "success" | "error" | "warning", text: string) => {
    setMessage({ type, text });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.province) newErrors.province = "Vui lòng chọn tỉnh/thành phố";
    if (!formData.district) newErrors.district = "Vui lòng chọn quận/huyện";
    if (!formData.ward) newErrors.ward = "Vui lòng chọn phường/xã";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProvinceChange = async (provinceId: string) => {
    handleInputChange("province", provinceId);
    setFormData((prev) => ({ ...prev, district: "", ward: "" }));
    setDistricts([]);
    setWards([]);

    if (!provinceId) return;

    setLoadingDistricts(true);
    try {
      const data = await getDistricts(provinceId);
      const options = data.map((item: District) => ({
        label: item.name,
        value: String(item.id),
      }));
      setDistricts(options);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    handleInputChange("district", districtId);
    setFormData((prev) => ({ ...prev, ward: "" }));
    setWards([]);

    if (!districtId) return;

    setLoadingWards(true);
    try {
      const data = await getWards(districtId);
      const options = data.map((item: Ward) => ({
        label: item.name,
        value: String(item.id),
      }));
      setWards(options);
    } catch (error) {
      console.error("Error fetching wards:", error);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showMessage("error", "Vui lòng điền đầy đủ thông tin địa chỉ!");
      return;
    }

    try {
      const selectedProvince = provinces.find(
        (p) => p.value === formData.province
      );
      const selectedDistrict = districts.find(
        (d) => d.value === formData.district
      );
      const selectedWard = wards.find((w) => w.value === formData.ward);

      const addressParts = [];
      if (formData.specificAddress) addressParts.push(formData.specificAddress);
      if (selectedWard) addressParts.push(selectedWard.label);
      if (selectedDistrict) addressParts.push(selectedDistrict.label);
      if (selectedProvince) addressParts.push(selectedProvince.label);
      const searchAddress = addressParts.join(", ");

      const userId = session?.user?.userProfile?.id;
      if (userId) {
        setIsSaving(true);
        await updatePreferences(
          userId,
          { searchAddress: searchAddress || undefined },
          session
        );

        showMessage("success", "Đã lưu địa chỉ thành công!");
        await loadUserPreferences();

        if (onSaveSuccess) onSaveSuccess();
        setShowTooltip(true);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showMessage("error", "Có lỗi xảy ra khi lưu địa chỉ!");
    } finally {
      setIsSaving(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      if (session?.user?.userProfile?.id) {
        setLoadingPreferences(true);
        const preferences = await getUserPreferences();
        if (preferences?.searchAddress) {
          setCurrentPreferences(preferences.searchAddress);
        } else {
          setCurrentPreferences(null);
        }
      }
    } catch (error) {
      console.log("Không thể tải preferences:", error);
      setCurrentPreferences(null);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showMessage("error", "Trình duyệt không hỗ trợ định vị!");
      return;
    }

    if (
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      window.location.hostname !== "localhost"
    ) {
      showMessage(
        "error",
        "Chức năng định vị chỉ hoạt động trên HTTPS hoặc localhost!"
      );
      return;
    }

    setIsGettingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY;

      if (!GOONG_API_KEY) {
        showMessage("error", "Thiếu API key cho dịch vụ bản đồ!");
        return;
      }

      const response = await fetch(
        `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(
          `Không thể lấy thông tin địa chỉ (Status: ${response.status})`
        );
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const formattedAddress = result.formatted_address || "";

        // Update the specific address input with the location
        setFormData((prev) => ({ ...prev, specificAddress: formattedAddress }));

        const userId = session?.user?.userProfile?.id;
        if (userId && formattedAddress) {
          await updatePreferences(
            userId,
            { searchAddress: formattedAddress },
            session
          );

          setCurrentPreferences(formattedAddress);
          showMessage("success", "Đã cập nhật vị trí hiện tại thành công!");

          if (onSaveSuccess) onSaveSuccess();
          setShowTooltip(true);
        } else {
          showMessage("success", "Đã lấy vị trí hiện tại thành công!");
        }
      } else {
        showMessage(
          "warning",
          "Không thể xác định địa chỉ chính xác từ vị trí hiện tại"
        );
      }
    } catch (error: any) {
      console.error("Error getting location:", error);

      if (
        error.code === 1 ||
        error.code === GeolocationPositionError.PERMISSION_DENIED
      ) {
        showMessage("error", "Bạn đã từ chối cấp quyền truy cập vị trí.");
      } else if (
        error.code === 2 ||
        error.code === GeolocationPositionError.POSITION_UNAVAILABLE
      ) {
        showMessage("error", "Không thể xác định vị trí hiện tại.");
      } else if (
        error.code === 3 ||
        error.code === GeolocationPositionError.TIMEOUT
      ) {
        showMessage("error", "Hết thời gian chờ khi lấy vị trí.");
      } else {
        showMessage("error", "Có lỗi xảy ra khi lấy vị trí.");
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="lg:w-[1200px] md:w-[800px] sm:w-full sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg transition-all duration-300">
      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border-l-4 animate-slideIn ${
            message.type === "success"
              ? "bg-green-50 border-green-400 text-green-800"
              : message.type === "error"
              ? "bg-red-50 border-red-400 text-red-800"
              : "bg-yellow-50 border-yellow-400 text-yellow-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {message.type === "error" && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 py-4">
        {/* Current Location Display - Always visible */}
        {currentPreferences && !loadingPreferences && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/50 rounded-xl transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">
                Khu vực tìm kiếm:
              </span>
              <span className="text-sm text-blue-600 font-normal">
                {currentPreferences}
              </span>
            </div>
          </div>
        )}

        {/* Main Form - 2 Rows Layout */}
        <div className="space-y-4">
          {/* Row 1: Address Input with Location Button */}
          <div className="w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường)..."
                value={formData.specificAddress}
                onChange={(e) =>
                  handleInputChange("specificAddress", e.target.value)
                }
                className="w-full h-12 px-4 pl-12 pr-16 text-sm font-medium bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder-gray-400 shadow-sm hover:border-gray-300"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              {/* Location Button inside input */}
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                title="Lấy vị trí hiện tại"
              >
                {isGettingLocation ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"
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
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Searchable Location Selects and Action Buttons */}
          <div className="flex flex-wrap gap-3 items-start">
            {/* Province Select */}
            <div className="flex-1 min-w-[140px] max-w-[200px]">
              <SearchableSelect
                options={provinces}
                value={formData.province}
                onChange={handleProvinceChange}
                placeholder="Chọn Tỉnh/TP"
                disabled={false}
                loading={false}
                error={errors.province}
              />
              {errors.province && (
                <p className="text-xs text-red-500 mt-1 ml-1">
                  {errors.province}
                </p>
              )}
            </div>

            {/* District Select */}
            <div className="flex-1 min-w-[120px] max-w-[180px]">
              <SearchableSelect
                options={districts}
                value={formData.district}
                onChange={handleDistrictChange}
                placeholder="Chọn Q/Huyện"
                disabled={loadingDistricts || districts.length === 0}
                loading={loadingDistricts}
                error={errors.district}
              />
              {errors.district && (
                <p className="text-xs text-red-500 mt-1 ml-1">
                  {errors.district}
                </p>
              )}
            </div>

            {/* Ward Select */}
            <div className="flex-1 min-w-[120px] max-w-[180px]">
              <SearchableSelect
                options={wards}
                value={formData.ward}
                onChange={(value: any) => handleInputChange("ward", value)}
                placeholder="Chọn P/Xã"
                disabled={loadingWards || wards.length === 0}
                loading={loadingWards}
                error={errors.ward}
              />
              {errors.ward && (
                <p className="text-xs text-red-500 mt-1 ml-1">{errors.ward}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 relative ml-auto">
              {/* Save/Search Button */}
              {showSaveButton && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
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
                      <span>Tìm kiếm</span>
                    </>
                  )}
                </button>
              )}

              {/* Info Button */}
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="h-11 w-11 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-all duration-200 flex items-center justify-center"
                title="Thông tin"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              {/* Map Button */}
              <button
                type="button"
                onClick={() => router.push("/testmap")}
                className="h-11 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <span>Bản đồ</span>
              </button>

              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute top-full right-0 mt-3 z-50 w-80 p-5 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-fadeIn">
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="absolute top-3 right-3 w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
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

                  <div className="mb-3">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {currentPreferences
                        ? "Khu vực hiện tại"
                        : "Chọn khu vực tìm kiếm"}
                    </h3>
                  </div>

                  <div className="text-sm text-gray-600 leading-relaxed">
                    {currentPreferences ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="font-medium text-blue-800">
                            {currentPreferences}
                          </p>
                        </div>
                        <p>Đây là khu vực bạn đang tìm kiếm phòng trọ.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>Bạn chưa chọn khu vực tìm kiếm.</p>
                        <p>
                          Hãy chọn tỉnh/thành phố, quận/huyện, phường/xã để nhận
                          được những gợi ý phù hợp nhất!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default SuggestAddressBar;
