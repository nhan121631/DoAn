/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import styles from "./SuggestAddressBar.module.css";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import {
  updatePreferences,
  getUserPreferences,
} from "@/services/ProfileService";
import { Select, Input, Button, Form, message } from "antd";
import { Province, District, Ward } from "@/types/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  HomeOutlined,
  AimOutlined,
} from "@ant-design/icons";

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
  showSaveButton?: boolean;
  onSaveSuccess?: () => void;
}

function SuggestAddressBar({
  initialValue,
  showSaveButton = false,
  onSaveSuccess,
}: SuggestAddressBarProps) {
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [provinces, setProvinces] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [wards, setWards] = useState<SelectOption[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPreferences, setCurrentPreferences] = useState<string | null>(
    null
  );
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Scroll states
  const [isScrolled, setIsScrolled] = useState(false);
  const [barTop, setBarTop] = useState(90);

  // Handle scroll effects with dynamic top
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const newTop = Math.max(0, 90 - scrollTop);
      setBarTop(newTop);
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        const options = data.map((item: Province) => ({
          label: item.name,
          value: String(item.id),
        }));
        setProvinces(options);
      } catch {
        //
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (initialValue?.province) {
      handleProvinceChange(initialValue.province, false);
    }
    // eslint-disable-next-line
  }, [provinces]);

  useEffect(() => {
    if (initialValue?.district) {
      handleDistrictChange(initialValue.district, false);
    }
    // eslint-disable-next-line
  }, [districts]);

  useEffect(() => {
    if (initialValue) {
      form.setFieldsValue(initialValue);
    }
    // eslint-disable-next-line
  }, [wards]);

  const handleProvinceChange = async (provinceId?: string, reset = true) => {
    if (reset) {
      form.setFieldsValue({ district: undefined, ward: undefined });
      setDistricts([]);
      setWards([]);
    }
    if (!provinceId) return;
    setLoadingDistricts(true);
    try {
      const data = await getDistricts(provinceId);
      const options = data.map((item: District) => ({
        label: item.name,
        value: String(item.id),
      }));
      setDistricts(options);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtId?: string, reset = true) => {
    if (reset) {
      form.setFieldsValue({ ward: undefined });
      setWards([]);
    }
    if (!districtId) return;
    setLoadingWards(true);
    try {
      const data = await getWards(districtId);
      const options = data.map((item: Ward) => ({
        label: item.name,
        value: String(item.id),
      }));
      setWards(options);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleSave = async () => {
    try {
      await form.validateFields(["province", "district", "ward"]);

      const values = form.getFieldsValue();

      if (!values.province || !values.district || !values.ward) {
        messageApi.error("Vui lòng điền đầy đủ tỉnh, quận/huyện, phường/xã!");
        return;
      }

      const selectedProvince = provinces.find(
        (p) => p.value === values.province
      );
      const selectedDistrict = districts.find(
        (d) => d.value === values.district
      );
      const selectedWard = wards.find((w) => w.value === values.ward);

      const addressParts = [];
      if (values.specificAddress) addressParts.push(values.specificAddress);
      if (selectedWard) addressParts.push(selectedWard.label);
      if (selectedDistrict) addressParts.push(selectedDistrict.label);
      if (selectedProvince) addressParts.push(selectedProvince.label);
      const searchAddress = addressParts.join(", ");

      const userId = session?.user?.userProfile?.id;
      if (userId) {
        setIsSaving(true);
        await updatePreferences(
          userId,
          {
            searchAddress: searchAddress || undefined,
          },
          session
        );
        messageApi.success("Đã lưu thành công!", 3);

        await loadUserPreferences();

        if (onSaveSuccess) onSaveSuccess();

        setShowTooltip(true);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("validation")) {
        messageApi.error("Vui lòng điền đầy đủ tỉnh, quận/huyện, phường/xã!", 3);
      } else if (error instanceof Error) {
        messageApi.error("Lưu thất bại! " + error.message, 3);
      } else {
        messageApi.error("Vui lòng điền đầy đủ tỉnh, quận/huyện, phường/xã!", 3);
      }
      console.error("Error saving address:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      if (session?.user?.userProfile?.id) {
        setLoadingPreferences(true);
        const preferences = await getUserPreferences();
        console.log("Loaded preferences:", preferences);
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

  // Get current location and reverse geocode
  const getCurrentLocation = async () => {
    console.log("getCurrentLocation called");
    
    if (!navigator.geolocation) {
      messageApi.error("Trình duyệt không hỗ trợ định vị!");
      return;
    }

    // Check if running on secure context
    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
      messageApi.error("Chức năng định vị chỉ hoạt động trên HTTPS hoặc localhost!");
      return;
    }

    setIsGettingLocation(true);
    
    try {
      console.log("Requesting geolocation permission...");
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log("Geolocation success:", pos);
            resolve(pos);
          },
          (err) => {
            console.error("Geolocation error:", err);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log("Current position:", latitude, longitude);
      
      // Reverse geocoding using Goong API
      const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY;
      console.log("GOONG_API_KEY available:", !!GOONG_API_KEY);
      
      if (!GOONG_API_KEY) {
        messageApi.error("Thiếu API key cho dịch vụ bản đồ!", 3);
        return;
      }
      
      const response = await fetch(
        `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`
      );
      
      console.log("Goong API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Không thể lấy thông tin địa chỉ (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log("Goong API response data:", data);
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const formattedAddress = result.formatted_address || "";
        
        // Save location to database directly
        const userId = session?.user?.userProfile?.id;
        if (userId && formattedAddress) {
          await updatePreferences(
            userId,
            {
              searchAddress: formattedAddress,
            },
            session
          );
          
          // Update current preferences
          setCurrentPreferences(formattedAddress);
          
          messageApi.success("Đã cập nhật vị trí hiện tại thành công!", 3);
          
          if (onSaveSuccess) onSaveSuccess();
          setShowTooltip(true);
        } else {
          messageApi.success("Đã lấy vị trí hiện tại thành công!", 3);
        }
      } else {
        messageApi.warning("Không thể xác định địa chỉ chính xác từ vị trí hiện tại", 3);
      }
    } catch (error: any) {
      console.error("Error getting location:", error);
      
      if (error.code === 1 || error.code === GeolocationPositionError.PERMISSION_DENIED) {
        messageApi.error("Bạn đã từ chối cấp quyền truy cập vị trí. Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.", 4);
      } else if (error.code === 2 || error.code === GeolocationPositionError.POSITION_UNAVAILABLE) {
        messageApi.error("Không thể xác định vị trí hiện tại. Vui lòng kiểm tra GPS/Wi-Fi.", 4);
      } else if (error.code === 3 || error.code === GeolocationPositionError.TIMEOUT) {
        messageApi.error("Hết thời gian chờ khi lấy vị trí. Vui lòng thử lại.", 4);
      } else {
        messageApi.error("Có lỗi xảy ra khi lấy vị trí: " + (error.message || "Lỗi không xác định"), 4);
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadUserPreferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50"
          : "bg-gradient-to-b from-white via-white to-white/90"
      }`}
      style={{
        top: barTop,
        transition: "top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      {contextHolder}
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Current search area display - Enhanced design */}
        {currentPreferences && !loadingPreferences && isScrolled && (
          <div className="my-1 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg">
            <p className="text-sm text-blue-800 font-medium">
              <EnvironmentOutlined className="text-indigo-600 text-sm" /> Khu
              vực tìm kiếm hiện tại:{" "}
              <span className="font-normal">{currentPreferences}</span>
            </p>
          </div>
        )}

        {/* Main search bar - Compact redesign */}
        <div className="py-2.5">
          <Form
            form={form}
            layout="inline"
            className="w-full"
            initialValues={initialValue}
          >
            <div className="flex items-stretch gap-2 w-full">
              {/* Address Input - Compact */}
              <div className="flex-1 min-w-[180px]">
                <Form.Item name="specificAddress" className="mb-0">
                  <Input
                    placeholder="Nhập địa chỉ cụ thể..."
                    allowClear
                    prefix={<HomeOutlined className="text-gray-400 text-sm" />}
                    className="h-9 rounded-lg border border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200"
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  />
                </Form.Item>
              </div>

              {/* Province - Compact */}
              <div className="w-36">
                <Form.Item
                  name="province"
                  className="mb-0"
                  rules={[{ required: true, message: "Chọn tỉnh!" }]}
                >
                  <Select
                    options={provinces}
                    placeholder="Tỉnh/TP"
                    onChange={(v) => handleProvinceChange(v)}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    className={styles.provinceSelect}
                    style={{ height: "36px" }}
                  />
                </Form.Item>
              </div>

              {/* District - Compact */}
              <div className="w-32">
                <Form.Item
                  name="district"
                  className="mb-0"
                  rules={[{ required: true, message: "Chọn quận!" }]}
                >
                  <Select
                    options={districts}
                    placeholder="Q/Huyện"
                    onChange={(v) => handleDistrictChange(v)}
                    loading={loadingDistricts}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    disabled={districts.length === 0}
                    className={styles.districtSelect}
                    style={{ height: "36px" }}
                    size="small"
                  />
                </Form.Item>
              </div>

              {/* Ward - Compact */}
              <div className="w-28">
                <Form.Item
                  name="ward"
                  className="mb-0"
                  rules={[{ required: true, message: "Chọn xã!" }]}
                >
                  <Select
                    options={wards}
                    placeholder="P/Xã"
                    loading={loadingWards}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    disabled={wards.length === 0}
                    className={styles.wardSelect}
                    style={{ height: "36px" }}
                    size="small"
                  />
                </Form.Item>
              </div>

              {/* Action buttons - Compact design */}
              <div className="flex items-center gap-1.5 relative">
                {/* Get Current Location button */}
                <Button
                  type="default"
                  onClick={getCurrentLocation}
                  loading={isGettingLocation}
                  className="h-9 w-9 border border-gray-300 hover:border-blue-400 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center p-0"
                  icon={<AimOutlined className="text-gray-600 hover:text-blue-500 text-sm transition-colors duration-200" />}
                  title="Lấy vị trí hiện tại"
                />

                {/* Search/Save button */}
                {showSaveButton && (
                  <Button
                    type="primary"
                    onClick={handleSave}
                    loading={isSaving}
                    className="h-9 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 rounded-lg font-medium text-xs shadow-sm hover:shadow-md transition-all duration-200"
                    icon={<SearchOutlined className="text-sm" />}
                  >
                    Tìm kiếm
                  </Button>
                )}

                {/* Info button */}
                <Button
                  type="text"
                  className="h-9 w-9 border-0 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center p-0"
                  onClick={() => setShowTooltip(!showTooltip)}
                  icon={
                    <InfoCircleOutlined className="text-gray-500 hover:text-blue-500 text-sm transition-colors duration-200" />
                  }
                />

                {/* Map button */}
                <Button
                  type="primary"
                  onClick={() => router.push("/testmap")}
                  className="h-9 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 rounded-lg font-medium text-xs shadow-sm hover:shadow-md transition-all duration-200"
                  icon={<EnvironmentOutlined className="text-sm" />}
                >
                  Bản đồ
                </Button>

                {/* Enhanced Tooltip */}
                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute top-full right-0 mt-2 z-50 p-4 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 min-w-[320px] max-w-sm animate-fadeIn">
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      onClick={() => setShowTooltip(false)}
                    >
                      ×
                    </button>
                    <div className="font-semibold mb-2 text-blue-700">
                      {currentPreferences ? "Khu vực hiện tại:" : "Xin chào!"}
                    </div>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {currentPreferences ||
                        "Bạn chưa chọn khu vực tìm trọ. Vui lòng chọn để nhận đề xuất phù hợp."}
                    </div>
                    {/* Arrow */}
                    <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default SuggestAddressBar;
