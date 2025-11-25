/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import {
  updatePreferences,
  getUserPreferences,
  getEmailNotifications,
  setEmailNotifications,
  getUserProfile,
} from "@/services/ProfileService";
import {
  getRoomVipWithLocation,
  getRoomNormalWithLocation,
} from "@/services/RoomService";
import { Province, District, Ward } from "@/types/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocationContext } from "@/context/LocationContext";

type SelectOption = {
  label: string;
  value: string;
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
  width?: string;
  showSaveButton?: boolean;
  onSaveSuccess?: () => void;
}

// Custom Select Component with search functionality
interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  error = "",
  loading = false,
}) => {
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-11 px-4 pr-10 text-left text-sm font-medium bg-white/90 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md focus:ring-4 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
          error
            ? "border-red-300 focus:border-red-500"
            : "border-gray-200/60 focus:border-blue-500 hover:border-blue-300"
        }`}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {loading ? "Loading..." : selectedOption?.label || placeholder}
        </span>
        <svg
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300 text-gray-400 ${
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

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

function SuggestAddressBar({
  initialValue,
  showSaveButton = false,
  width,
  onSaveSuccess,
}: SuggestAddressBarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { setLocation, setIsSearching, setGuestRooms, setUserRooms } =
    useLocationContext();

  // Hide bar when #why-choose-us is in viewport
  const [hideBar, setHideBar] = useState(false);

  useEffect(() => {
    const section = document.getElementById("why-choose-us");
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHideBar(true);
          } else {
            setHideBar(false);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

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
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  // Email notifications state
  const [emailNotifications, setEmailNotificationsState] =
    useState<boolean>(false);
  const [loadingEmailNotifications, setLoadingEmailNotifications] =
    useState(false);

  // Scroll effect - Simple approach
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check after a delay
    const timer = setTimeout(handleScroll, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Auto-hide tooltip
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // Auto-hide email tooltip
  useEffect(() => {
    if (showEmailTooltip) {
      const timer = setTimeout(() => setShowEmailTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showEmailTooltip]);

  // Close tooltips on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".tooltip-container") &&
        !target.closest('button[title="Information"]') &&
        !target.closest('button[title="Email Notifications"]')
      ) {
        setShowTooltip(false);
        setShowEmailTooltip(false);
      }
    };

    if (showTooltip || showEmailTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTooltip, showEmailTooltip]);

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
      loadEmailNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Load email notifications
  const loadEmailNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      setLoadingEmailNotifications(true);

      // First check if user has a profile
      const profile = await getUserProfile(session);
      if (!profile) {
        console.log(
          "User profile not found, skipping email notifications load"
        );
        setEmailNotificationsState(false);
        return;
      }

      const result = await getEmailNotifications(session.user.id);
      console.log(
        "loadEmailNotifications - Result from getEmailNotifications:",
        result
      );
      console.log(
        "loadEmailNotifications - Setting emailNotifications to:",
        result.emailNotifications
      );
      setEmailNotificationsState(result.emailNotifications);
    } catch (error) {
      console.error("Error loading email notifications:", error);
      // Set default value on error
      setEmailNotificationsState(false);
    } finally {
      setLoadingEmailNotifications(false);
    }
  };

  const showMessage = (type: "success" | "error" | "warning", text: string) => {
    setMessage({ type, text });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.province)
      newErrors.province = "Please select a province/city";
    if (!formData.district) newErrors.district = "Please select a district";
    if (!formData.ward) newErrors.ward = "Please select a ward";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    // If updating specificAddress, keep only the first segment (street/name) before comma
    if (field === "specificAddress") {
      const streetOnly = value ? value.split(",")[0].trim() : "";
      setFormData((prev) => ({ ...prev, specificAddress: streetOnly }));
      if (errors.specificAddress) {
        setErrors((prev) => ({ ...prev, specificAddress: "" }));
      }
      return;
    }

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

  // Unified function to fetch rooms by location for both guest and logged-in users
  const fetchRoomsByLocation = async (
    lat: number,
    lng: number,
    address: string,
    context: "search" | "current"
  ) => {
    const userId = session?.user?.userProfile?.id;

    // Clear previous data
    setGuestRooms(null);
    setUserRooms(null);

    try {
      console.log("🌍 Fetching rooms by location:");
      console.log("- Address:", address);
      console.log("- Coordinates:", { lat, lng });
      console.log("- User ID:", userId);
      console.log("- Context:", context);

      // Update location context
      setLocation({ lat, lng, address });

      // Fetch rooms using location-based APIs
      const [vipResponse, normalResponse] = await Promise.all([
        getRoomVipWithLocation(0, 4, lat, lng),
        getRoomNormalWithLocation(0, 6, lat, lng),
      ]);

      if (vipResponse && normalResponse) {
        const newRoomsData = {
          vipRooms: { ...vipResponse },
          normalRooms: { ...normalResponse },
        };

        // Set rooms data based on user type
        if (userId) {
          setUserRooms(newRoomsData);
        } else {
          setGuestRooms(newRoomsData);
        }

        const totalRooms =
          vipResponse.totalRecords + normalResponse.totalRecords;
        const locationText =
          context === "current"
            ? userId
              ? "bạn"
              : "vị trí của bạn"
            : `"${address}"`;

        showMessage(
          "success",
          `🎯 Đã ${
            userId && context === "current" ? "lưu vị trí và " : ""
          }tìm thấy ${totalRooms} phòng gần ${locationText} - Đã sắp xếp theo khoảng cách!`
        );
      } else {
        showMessage("error", "Không thể tải danh sách phòng!");
      }
    } catch (error) {
      console.error("Error fetching rooms by location:", error);
      showMessage("error", "Có lỗi xảy ra khi tìm kiếm phòng!");
    }
  };

  // Fetch rooms based on address location - works for both guest and logged-in users
  const fetchRoomsByAddress = async (searchAddress: string) => {
    setIsSearching(true);

    try {
      // Use Goong API to get coordinates from address
      const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY;
      if (!GOONG_API_KEY) {
        showMessage("error", "Thiếu API key cho dịch vụ bản đồ!");
        return;
      }

      const geoResponse = await fetch(
        `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(
          searchAddress
        )}&api_key=${GOONG_API_KEY}`
      );

      if (!geoResponse.ok) {
        throw new Error("Không thể tìm thấy tọa độ của địa chỉ này");
      }

      const geoData = await geoResponse.json();

      if (geoData.results && geoData.results.length > 0) {
        const location = geoData.results[0].geometry.location;
        const { lat, lng } = location;

        // Use unified function to fetch rooms
        await fetchRoomsByLocation(lat, lng, searchAddress, "search");
      } else {
        showMessage("error", "Không tìm thấy địa chỉ này!");
      }
    } catch (error) {
      console.error("Error fetching rooms by address:", error);
      showMessage("error", "Có lỗi xảy ra khi tìm kiếm phòng!");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showMessage("error", "Please fill in all address information!");
      return;
    }

    setIsSaving(true);

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

      // If user is logged in, save preferences first
      if (userId) {
        await updatePreferences(
          userId,
          { searchAddress: searchAddress || undefined },
          session
        );

        await loadUserPreferences();
        setCurrentPreferences(searchAddress);

        if (onSaveSuccess) onSaveSuccess();
        setShowTooltip(true);
      }

      // Fetch rooms for both guest and logged-in users
      if (searchAddress) {
        await fetchRoomsByAddress(searchAddress);
      }

      if (userId) {
        showMessage("success", "Find room by your address successfully!");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showMessage("error", "An error occurred while saving the address!");
    } finally {
      setIsSaving(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      if (session?.user?.userProfile?.id) {
        setLoadingPreferences(true);
        const preferences = await getUserPreferences();
        setUserPreferences(preferences);
        console.log("Loaded user preferences:", preferences);
        if (preferences?.searchAddress) {
          setCurrentPreferences(preferences.searchAddress);
        } else {
          setCurrentPreferences(null);
        }
      }
    } catch (error) {
      console.log("Could not load preferences:", error);
      setCurrentPreferences(null);
      setUserPreferences(null);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showMessage("error", "Your browser does not support geolocation!");
      return;
    }

    if (
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      window.location.hostname !== "localhost"
    ) {
      showMessage(
        "error",
        "Geolocation feature only works on HTTPS or localhost!"
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
        showMessage("error", "Missing API key for map service!");
        return;
      }

      const response = await fetch(
        `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(
          `Unable to get address information (Status: ${response.status})`
        );
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const formattedAddress = result.formatted_address || "";

        // Update the specific address field with the formatted address
        handleInputChange("specificAddress", formattedAddress);

        const userId = session?.user?.userProfile?.id;

        // If user is logged in, save preferences
        if (userId && formattedAddress) {
          await updatePreferences(
            userId,
            { searchAddress: formattedAddress },
            session
          );
          setCurrentPreferences(formattedAddress);

          if (onSaveSuccess) onSaveSuccess();
          setShowTooltip(true);
        }

        // Use unified function to fetch rooms by current location
        await fetchRoomsByLocation(
          latitude,
          longitude,
          formattedAddress,
          "current"
        );
      } else {
        showMessage(
          "warning",
          "Unable to determine exact address from current location"
        );
      }
    } catch (error: any) {
      console.error("Error getting location:", error);

      if (
        error.code === 1 ||
        error.code === GeolocationPositionError.PERMISSION_DENIED
      ) {
        showMessage("error", "You have denied location access permission.");
      } else if (
        error.code === 2 ||
        error.code === GeolocationPositionError.POSITION_UNAVAILABLE
      ) {
        showMessage("error", "Unable to determine current location.");
      } else if (
        error.code === 3 ||
        error.code === GeolocationPositionError.TIMEOUT
      ) {
        showMessage("error", "Timeout while getting location.");
      } else {
        showMessage("error", "An error occurred while getting location.");
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle email notifications toggle
  const handleEmailNotificationsToggle = async (enabled: boolean) => {
    if (!session?.user?.id) {
      console.warn(
        "handleEmailNotificationsToggle: no session user id, aborting toggle"
      );
      return;
    }

    try {
      console.log(
        "handleEmailNotificationsToggle - requested enabled:",
        enabled
      );
      setLoadingEmailNotifications(true);

      const response = await setEmailNotifications(enabled);
      console.log(
        "handleEmailNotificationsToggle - setEmailNotifications response:",
        response
      );

      // Prefer backend-confirmed value if provided
      const respValue =
        response?.emailNotifications ?? response?.enabled ?? null;

      if (typeof respValue === "boolean") {
        setEmailNotificationsState(respValue);
        console.log(
          "handleEmailNotificationsToggle - applied from response:",
          respValue
        );
      } else if (typeof respValue === "number") {
        setEmailNotificationsState(respValue === 1);
        console.log(
          "handleEmailNotificationsToggle - applied from numeric response:",
          respValue
        );
      } else {
        // Fallback to requested value
        setEmailNotificationsState(enabled);
        console.log(
          "handleEmailNotificationsToggle - no explicit response value, applied requested value:",
          enabled
        );
      }

      showMessage(
        "success",
        `Email notifications ${enabled ? "enabled" : "disabled"} successfully!`
      );
    } catch (error) {
      console.error("Error updating email notifications:", error);
      showMessage("error", "Failed to update email notifications");
    } finally {
      setLoadingEmailNotifications(false);
    }
  };

  return (
    <div
      className={`sticky ${
        width ? `w-[100%]` : `lg:w-[80%] md:w-[800px] w-full`
      }  top-0 z-40 bg-gradient-to-r from-white/95 via-blue-50/80 to-indigo-50/80 backdrop-blur-xl border-b border-blue-200/30 transition-all duration-300 ${
        hideBar ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl border-l-4 animate-slideIn backdrop-blur-lg ${
            message.type === "success"
              ? "bg-emerald-50/95 border-emerald-400 text-emerald-800"
              : message.type === "error"
              ? "bg-red-50/95 border-red-400 text-red-800"
              : "bg-amber-50/95 border-amber-400 text-amber-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === "success" && (
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
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
            )}
            {message.type === "error" && (
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {message.type === "warning" && (
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <span className="font-semibold text-sm">{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 py-4">
        {/* Current Location Display - hides when scrolling */}
        {currentPreferences && !loadingPreferences && (
          <div
            className={`mb-4 p-4 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-sm border border-blue-200/40 rounded-2xl transition-all duration-500 shadow-md hover:shadow-lg ${
              isScrolled
                ? "opacity-0 max-h-0 overflow-hidden mb-0 py-0"
                : "opacity-100 max-h-24"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-blue-800">
                  Current Search Area:
                </span>
                <p className="text-sm text-blue-700 font-medium mt-0.5 leading-relaxed">
                  {currentPreferences}
                </p>
              </div>
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-500"
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
            </div>
          </div>
        )}

        {/* Main Form - always visible */}
        <div className="space-y-5">
          {/* Row 1: Address Input with Location Button Inside */}
          <div className="w-full flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter specific address (house number, street name)..."
                value={formData.specificAddress}
                onChange={(e) =>
                  handleInputChange("specificAddress", e.target.value)
                }
                className="w-full h-12 px-6 pl-14 pr-16 text-sm font-medium bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400 shadow-lg hover:shadow-xl hover:border-blue-300"
              />
              {/* Home Icon */}
              <div className="absolute left-5 top-1/2 -translate-y-1/2">
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
              {/* Location Button Inside Input */}
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group active:scale-95 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
                }}
                title="Get Current Location"
              >
                {isGettingLocation ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-4.5 h-4.5 group-hover:scale-110 transition-transform duration-300"
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
            {!width && (
              <div className="flex-shrink-0">
                {/* Map Button */}
                <button
                  type="button"
                  onClick={() => router.push("/testmap")}
                  className="h-12 px-6 text-white font-semibold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
                    e.currentTarget.style.boxShadow =
                      "0 15px 35px -5px rgba(59, 130, 246, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 25px -5px rgba(59, 130, 246, 0.25)";
                  }}
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <span>View Map</span>
                </button>
              </div>
            )}
          </div>

          {/* Row 2: Location Selects and Action Buttons */}
          <div className="flex flex-wrap gap-4 items-start">
            {/* Province Select */}
            <div className="flex-1 min-w-[160px] max-w-[220px]">
              <CustomSelect
                options={provinces}
                value={formData.province}
                onChange={handleProvinceChange}
                placeholder="Select Province/City"
                error={errors.province}
              />
            </div>

            {/* District Select */}
            <div className="flex-1 min-w-[140px] max-w-[200px]">
              <CustomSelect
                options={districts}
                value={formData.district}
                onChange={handleDistrictChange}
                placeholder="Select District"
                disabled={districts.length === 0}
                loading={loadingDistricts}
                error={errors.district}
              />
            </div>

            {/* Ward Select */}
            <div className="flex-1 min-w-[140px] max-w-[200px]">
              <CustomSelect
                options={wards}
                value={formData.ward}
                onChange={(value) => handleInputChange("ward", value)}
                placeholder="Select Ward"
                disabled={wards.length === 0}
                loading={loadingWards}
                error={errors.ward}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 relative ml-auto">
              {/* Save/Search Button */}
              {showSaveButton && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-11 px-8 text-white font-semibold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
                      e.currentTarget.style.boxShadow =
                        "0 15px 35px -5px rgba(59, 130, 246, 0.35)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 25px -5px rgba(59, 130, 246, 0.25)";
                  }}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Searching...</span>
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
                      <span>Search</span>
                    </>
                  )}
                </button>
              )}

              {/* Info Button */}
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="h-11 w-11 bg-gray-50/90 hover:bg-gray-100/90 text-gray-500 hover:text-gray-700 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg backdrop-blur-sm active:scale-95 border border-gray-200/50"
                title="Information"
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

              {/* Email Notifications Button */}
              {session?.user && (
                <button
                  type="button"
                  onClick={() => setShowEmailTooltip(!showEmailTooltip)}
                  className="h-11 w-11 bg-gray-50/90 hover:bg-gray-100/90 text-gray-500 hover:text-gray-700 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg backdrop-blur-sm active:scale-95 border border-gray-200/50"
                  title="Email Notifications"
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
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              )}

              {/* Enhanced Tooltip */}
              {showTooltip && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80 tooltip-container">
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="text-sm text-gray-700">
                    <h4 className="font-semibold mb-2">Current Search Area</h4>
                    <p className="mb-2">
                      <strong>Your Search Address:</strong>{" "}
                      {userPreferences?.searchAddress || "Not set"}
                    </p>
                  </div>
                </div>
              )}

              {/* Email Notifications Tooltip */}
              {showEmailTooltip && session?.user && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80 tooltip-container">
                  <button
                    onClick={() => setShowEmailTooltip(false)}
                    className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="text-sm text-gray-700">
                    <h4 className="font-semibold mb-2">Email Notifications</h4>
                    <p className="mb-3">
                      Receive room suggestions via email when new rooms match
                      your preferences.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {emailNotifications ? "Enabled" : "Disabled"}
                      </span>
                      <div className="flex items-center gap-3">
                        {loadingEmailNotifications && (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) =>
                              handleEmailNotificationsToggle(e.target.checked)
                            }
                            disabled={loadingEmailNotifications}
                            className="sr-only peer"
                          />
                          <div
                            className={`w-12 h-6 rounded-full transition-all duration-300 ${
                              emailNotifications
                                ? "bg-gradient-to-r from-green-400 to-green-500"
                                : "bg-gray-300"
                            } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 peer-disabled:opacity-50`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                                emailNotifications
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
        </div>
      </div>

      <style jsx>{`
        .animate-slideIn {
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default SuggestAddressBar;
