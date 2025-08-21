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
} from "@/services/ProfileService";
import { Select, Input, Button, Form, message } from "antd";
import { Province, District, Ward } from "@/types/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Search } from "lucide-react";

type SelectOption = {
  label: string;
  value: string;
};

// interface GoongGeocodeResponse {
//   results: Array<{
//     formatted_address: string;
//     address_components: Array<{
//       types: string[];
//       long_name: string;
//       short_name: string;
//     }>;
//   }>;
// }

// const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY;

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
  // const [loadingLocation, setLoadingLocation] = useState(false);

  console.log(
    "Show tooltip:",
    showTooltip,
    "Current preferences:",
    currentPreferences
  );
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
        messageApi.success("Đã lưu thành công!");

        await loadUserPreferences();

        if (onSaveSuccess) onSaveSuccess();

        setShowTooltip(true);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("validation")) {
        messageApi.error("Vui lòng điền đầy đủ tỉnh, quận/huyện, phường/xã!");
      } else if (error instanceof Error) {
        messageApi.error("Lưu thất bại! " + error.message);
      } else {
        messageApi.error("Vui lòng điền đầy đủ tỉnh, quận/huyện, phường/xã!");
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

  useEffect(() => {
    if (session) {
      loadUserPreferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // // Function to get current location and reverse geocode
  // const getCurrentLocation = async () => {
  //   if (!navigator.geolocation) {
  //     messageApi.error("Trình duyệt không hỗ trợ định vị!");
  //     return;
  //   }

  //   setLoadingLocation(true);
  //   try {
  //     const position = await new Promise<GeolocationPosition>(
  //       (resolve, reject) => {
  //         navigator.geolocation.getCurrentPosition(resolve, reject, {
  //           enableHighAccuracy: true,
  //           timeout: 10000,
  //           maximumAge: 60000,
  //         });
  //       }
  //     );

  //     const { latitude, longitude } = position.coords;

  //     // Use Goong reverse geocoding API
  //     const response = await fetch(
  //       `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`
  //     );

  //     if (!response.ok) {
  //       throw new Error("Không thể lấy địa chỉ từ tọa độ");
  //     }

  //     const data: GoongGeocodeResponse = await response.json();
  //     if (data.results && data.results.length > 0) {
  //       const result = data.results[0];
  //       const addressComponents = result.address_components;

  //       // Extract address components
  //       let provinceName = "";
  //       let districtName = "";
  //       let wardName = "";
  //       let specificAddress = "";

  //       addressComponents.forEach(
  //         (component: {
  //           types: string[];
  //           long_name: string;
  //           short_name: string;
  //         }) => {
  //           const types = component.types;
  //           if (types.includes("administrative_area_level_1")) {
  //             provinceName = component.long_name;
  //           } else if (types.includes("administrative_area_level_2")) {
  //             districtName = component.long_name;
  //           } else if (
  //             types.includes("administrative_area_level_3") ||
  //             types.includes("sublocality_level_1")
  //           ) {
  //             wardName = component.long_name;
  //           } else if (
  //             types.includes("street_number") ||
  //             types.includes("route")
  //           ) {
  //             if (specificAddress) {
  //               specificAddress = component.long_name + " " + specificAddress;
  //             } else {
  //               specificAddress = component.long_name;
  //             }
  //           }
  //         }
  //       );

  //       // Find matching province, district, ward IDs
  //       const matchedProvince = provinces.find(
  //         (p) =>
  //           p.label.toLowerCase().includes(provinceName.toLowerCase()) ||
  //           provinceName.toLowerCase().includes(p.label.toLowerCase())
  //       );

  //       if (matchedProvince) {
  //         // Load districts for the province
  //         await handleProvinceChange(matchedProvince.value, false);

  //         // Wait a bit for districts to load
  //         setTimeout(async () => {
  //           const districtData = await getDistricts(matchedProvince.value);
  //           const districtOptions = districtData.map((item: District) => ({
  //             label: item.name,
  //             value: String(item.id),
  //           }));

  //           const matchedDistrict = districtOptions.find(
  //             (d: SelectOption) =>
  //               d.label.toLowerCase().includes(districtName.toLowerCase()) ||
  //               districtName.toLowerCase().includes(d.label.toLowerCase())
  //           );

  //           if (matchedDistrict) {
  //             // Load wards for the district
  //             setTimeout(async () => {
  //               const wardData = await getWards(matchedDistrict.value);
  //               const wardOptions = wardData.map((item: Ward) => ({
  //                 label: item.name,
  //                 value: String(item.id),
  //               }));

  //               const matchedWard = wardOptions.find(
  //                 (w: SelectOption) =>
  //                   w.label.toLowerCase().includes(wardName.toLowerCase()) ||
  //                   wardName.toLowerCase().includes(w.label.toLowerCase())
  //               );

  //               // Set form values
  //               form.setFieldsValue({
  //                 specificAddress:
  //                   specificAddress || result.formatted_address.split(",")[0],
  //                 province: matchedProvince.value,
  //                 district: matchedDistrict.value,
  //                 ward: matchedWard?.value || null,
  //               });

  //               messageApi.success("Đã lấy vị trí hiện tại thành công!");
  //             }, 500);
  //           } else {
  //             // Set only province and district
  //             form.setFieldsValue({
  //               specificAddress: result.formatted_address.split(",")[0],
  //               province: matchedProvince.value,
  //               district: null,
  //               ward: null,
  //             });
  //             messageApi.warning(
  //               "Chỉ tìm thấy tỉnh/thành phố, vui lòng chọn quận/huyện và phường/xã!"
  //             );
  //           }
  //         }, 500);
  //       } else {
  //         // Just set the formatted address
  //         form.setFieldsValue({
  //           specificAddress: result.formatted_address,
  //           province: null,
  //           district: null,
  //           ward: null,
  //         });
  //         messageApi.warning(
  //           "Không tìm thấy thông tin hành chính, vui lòng chọn thủ công!"
  //         );
  //       }
  //     } else {
  //       throw new Error("Không tìm thấy địa chỉ");
  //     }
  //   } catch (error) {
  //     console.error("Error getting location:", error);
  //     if (error instanceof GeolocationPositionError) {
  //       switch (error.code) {
  //         case error.PERMISSION_DENIED:
  //           messageApi.error(
  //             "Vui lòng cho phép truy cập vị trí trong trình duyệt!"
  //           );
  //           break;
  //         case error.POSITION_UNAVAILABLE:
  //           messageApi.error("Không thể xác định vị trí hiện tại!");
  //           break;
  //         case error.TIMEOUT:
  //           messageApi.error("Hết thời gian chờ lấy vị trí!");
  //           break;
  //         default:
  //           messageApi.error("Lỗi không xác định khi lấy vị trí!");
  //           break;
  //       }
  //     } else {
  //       messageApi.error("Không thể lấy thông tin địa chỉ từ vị trí hiện tại!");
  //     }
  //   } finally {
  //     setLoadingLocation(false);
  return (
    <div
      className="w-full bg-white/95 shadow-lg border-b border-gray-200/50 z-40"
      style={{ position: "sticky", top: 0 }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 pt-2 pb-2">
        {contextHolder}

      {/* Current search area display */}
      {currentPreferences && !loadingPreferences && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg">
          <p className="text-sm text-blue-800 font-medium">
            Khu vực tìm kiếm hiện tại:{" "}
            <span className="font-normal">{currentPreferences}</span>
          </p>
        </div>
      )}

        {/* Main search bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
          <Form
            form={form}
            layout="inline"
            className="w-full"
            initialValues={initialValue}
          >
            <div className="flex items-center gap-3 w-full flex-wrap lg:flex-nowrap">
              {/* Address Input - takes remaining space */}
              <div className="flex-1 min-w-[200px]">
                <Form.Item name="specificAddress" className="mb-0">
                  <Input
                    placeholder="Nhập địa chỉ cụ thể..."
                    allowClear
                    className="h-10 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                    size="middle"
                  />
                </Form.Item>
              </div>

              {/* Province - fixed width */}
              <div className="w-44">
                <Form.Item
                  name="province"
                  className="mb-0"
                  rules={[{ required: true, message: "Chọn tỉnh/thành!" }]}
                >
                  <Select
                    options={provinces}
                    placeholder="Tỉnh/Thành phố"
                    onChange={(v) => handleProvinceChange(v)}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    className="h-10"
                    size="middle"
                  />
                </Form.Item>
              </div>

              {/* District - fixed width */}
              <div className="w-40">
                <Form.Item
                  name="district"
                  className="mb-0"
                  rules={[{ required: true, message: "Chọn quận/huyện!" }]}
                >
                  <Select
                    options={districts}
                    placeholder="Quận/Huyện"
                    onChange={(v) => handleDistrictChange(v)}
                    loading={loadingDistricts}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    disabled={districts.length === 0}
                    className="h-10"
                    size="middle"
                  />
                </Form.Item>
              </div>

              {/* Ward - fixed width */}
              <div className="w-36">
                <Form.Item
                  name="ward"
                  className="mb-0"
                  rules={[{ required: true, message: "Chọn phường/xã!" }]}
                >
                  <Select
                    options={wards}
                    placeholder="Phường/Xã"
                    loading={loadingWards}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    disabled={wards.length === 0}
                    className="h-10"
                    size="middle"
                  />
                </Form.Item>
              </div>

              {/* Action buttons container */}
              <div className="flex items-center gap-2 relative">
                {/* Current location button
                <Button
                  type="default"
                  onClick={getCurrentLocation}
                  loading={loadingLocation}
                  className="h-10 px-3 border-orange-300 hover:border-orange-400 text-orange-600 hover:text-orange-700 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                  icon={<AimOutlined />}
                  title="Lấy vị trí hiện tại"
                /> */}

                {/* Save button */}
                {showSaveButton && (
                  <Button
                    type="primary"
                    onClick={handleSave}
                    loading={isSaving}
                    className="h-10 px-4 bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200"
                    icon={<SaveOutlined />}
                  >
                    Tìm kiếm
                  </Button>
                )}

                {/* Info button */}
                <Button
                  type="default"
                  className="h-10 px-3 border-gray-300 hover:border-blue-400 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                  onClick={() => setShowTooltip(true)}
                  icon={<InfoCircleOutlined className="text-blue-500" />}
                  title="Thông tin khu vực"
                />

                {/* Map button */}
                <Button
                  type="primary"
                  onClick={handleSave}
                  loading={isSaving}
                  className="h-10 px-4 bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200"
                  icon={<Search />}
                >
                  Search
                </Button>

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
