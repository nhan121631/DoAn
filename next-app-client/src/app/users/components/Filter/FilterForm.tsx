/* eslint-disable react-hooks/exhaustive-deps */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterRequest, useFilterStore } from "@/stores/FilterStore";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import { getConvenients } from "@/services/Convenients";
import { Convenient, District, Province, Ward } from "@/types/types";
import { Form, Select, Checkbox } from "antd";
import styles from "./FilterForm.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaStar, FaFilter, FaSpinner } from "react-icons/fa";

type SelectOption = {
  label: string;
  value: string;
};

export default function FilterForm() {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [wards, setWards] = useState<SelectOption[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [convenients, setConvenients] = useState<Convenient[]>([]);
  const { applyFilters, item } = useFilterStore((state) => state);
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
    const formValues: any = {
      province: item.provinceId ? String(item.provinceId) : undefined,
      district: item.districtId ? String(item.districtId) : undefined,
      ward: item.wardId ? String(item.wardId) : undefined,
      convenients: item.listConvenientIds
        ? item.listConvenientIds.map(String)
        : [],
    };
    const current = form.getFieldsValue();
    let changed = false;
    for (const key in formValues) {
      if (formValues[key] !== current[key]) {
        changed = true;
        break;
      }
    }
    if (changed) {
      form.setFieldsValue(formValues);
    }
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
        const provinceValue = form.getFieldValue("province");
        if (
          provinceValue &&
          options.some((opt: any) => opt.value === provinceValue)
        ) {
          form.setFieldsValue({ province: provinceValue });
        }
      } catch (err) {
        console.error("Error fetching provinces", err);
      }
    };
    fetchProvinces();
  }, []);

  const triggerFilter = (checkedValues?: any) => {
    const values = {
      ...form.getFieldsValue(),
      convenients: checkedValues ?? form.getFieldValue("convenients"),
    };
    const payload: FilterRequest = {
      provinceId: values.province ? Number(values.province) : undefined,
      districtId: values.district ? Number(values.district) : undefined,
      wardId: values.ward ? Number(values.ward) : undefined,
      listConvenientIds: values.convenients
        ? values.convenients.map(Number)
        : undefined,
    };
    applyFilters(payload);

    const query: Record<string, string> = {};
    if (payload.provinceId !== undefined)
      query.provinceId = String(payload.provinceId);
    if (payload.districtId !== undefined)
      query.districtId = String(payload.districtId);
    if (payload.wardId !== undefined) query.wardId = String(payload.wardId);
    if (payload.listConvenientIds && payload.listConvenientIds.length > 0)
      query.listConvenientIds = payload.listConvenientIds.join(",");
    const queryString = new URLSearchParams(query).toString();
    router.replace(`/users${queryString ? "?" + queryString : ""}`, {
      scroll: false,
    });
  };

  const handleProvinceChange = async (provinceId: string | undefined) => {
    form.setFieldsValue({ district: undefined, ward: undefined });
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
        const districtValue = form.getFieldValue("district");
        if (
          districtValue &&
          options.some((opt: any) => opt.value === districtValue)
        ) {
          form.setFieldsValue({ district: districtValue });
        }
      } catch (err) {
        console.error("Error fetching districts", err);
      } finally {
        setLoadingDistricts(false);
      }
    }
    triggerFilter();
  };

  const handleDistrictChange = async (districtId: string | undefined) => {
    form.setFieldsValue({ ward: undefined });
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
        const wardValue = form.getFieldValue("ward");
        if (wardValue && options.some((opt: any) => opt.value === wardValue)) {
          form.setFieldsValue({ ward: wardValue });
        }
      } catch (err) {
        console.error("Error fetching wards", err);
      } finally {
        setLoadingWards(false);
      }
    }
    triggerFilter();
  };

  const getConvenientIcon = (name: string) => {
    const iconName = name.toLowerCase();
    if (iconName.includes("wifi") || iconName.includes("internet")) return "📶";
    if (iconName.includes("parking")) return "🅿️";
    if (iconName.includes("air") || iconName.includes("ac")) return "❄️";
    if (iconName.includes("kitchen")) return "🍳";
    if (iconName.includes("washing")) return "🧺";
    if (iconName.includes("balcony")) return "🏡";
    if (iconName.includes("security")) return "🔒";
    if (iconName.includes("elevator")) return "🛗";
    return "⭐";
  };

  return (
    <div className={`w-[320px] space-y-4 ${styles.animateFadeIn}`}>
      {/* Advanced Filters Section */}
      <div
        className={`bg-white rounded-2xl shadow-lg p-6 ${styles.animateSlideInUp}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <FaFilter className="text-white text-sm" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Advanced Filters</h2>
        </div>

        {/* Location Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-teal-400 to-green-500 rounded-full flex items-center justify-center">
              <FaMapMarkerAlt className="text-white text-xs" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">Location</h3>
          </div>

          <Form form={form} layout="vertical" className="space-y-4">
            {/* Province */}
            <div className={styles.animateFadeInScale}>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Province
              </label>
              <Form.Item name="province" className="mb-0">
                <div className="relative">
                  <Select
                    options={provinces}
                    placeholder="Select Province"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    className={`w-full ${styles.simpleSelect}`}
                    onChange={handleProvinceChange}
                  />
                </div>
              </Form.Item>
            </div>

            {/* District */}
            <div
              className={`${styles.animateFadeInScale} ${styles.animationDelay200}`}
            >
              <label className="block text-sm font-medium text-gray-600 mb-2">
                District
              </label>
              <Form.Item name="district" className="mb-0">
                <div className="relative">
                  {loadingDistricts && (
                    <FaSpinner className="absolute right-8 top-1/2 transform -translate-y-1/2 text-purple-400 animate-spin z-10" />
                  )}
                  <Select
                    options={districts}
                    placeholder="Select District"
                    loading={loadingDistricts}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    disabled={districts.length === 0}
                    className={`w-full ${styles.simpleSelect}`}
                    onChange={handleDistrictChange}
                  />
                </div>
              </Form.Item>
            </div>

            {/* Ward */}
            <div
              className={`${styles.animateFadeInScale} ${styles.animationDelay400}`}
            >
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Ward
              </label>
              <Form.Item name="ward" className="mb-0">
                <div className="relative">
                  {loadingWards && (
                    <FaSpinner className="absolute right-8 top-1/2 transform -translate-y-1/2 text-pink-400 animate-spin z-10" />
                  )}
                  <Select
                    options={wards}
                    placeholder="Select Ward"
                    loading={loadingWards}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    disabled={wards.length === 0}
                    className={`w-full ${styles.simpleSelect}`}
                    onChange={triggerFilter}
                  />
                </div>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>

      {/* Amenities Section */}
      <div
        className={`bg-white rounded-2xl shadow-lg p-6 ${styles.animateSlideInUp} ${styles.animationDelay600}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <FaStar className="text-white text-xs" />
          </div>
          <h3 className="text-base font-semibold text-gray-700">Amenities</h3>
        </div>

        <div className={`max-h-64 overflow-y-auto ${styles.customScrollbar}`}>
          <Form form={form}>
            <Form.Item name="convenients" className="mb-0">
              <Checkbox.Group
                className="w-full space-y-2"
                onChange={triggerFilter}
              >
                {convenients.map((c, index) => (
                  <div
                    key={c.id}
                    className={`${styles.animateFadeInScale} hover:bg-gray-50 rounded-lg transition-all duration-200`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Checkbox value={String(c.id)} className="w-full p-2">
                      <div className="flex items-center gap-3">
                        <span className="text-base">
                          {getConvenientIcon(c.name)}
                        </span>
                        <span className="capitalize text-sm text-gray-700">
                          {c.name.replace(/_/g, " ")}
                        </span>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {(item.provinceId ||
        item.districtId ||
        item.wardId ||
        (item.listConvenientIds && item.listConvenientIds.length > 0)) && (
        <div className={`flex justify-center ${styles.animateBounceIn}`}>
          <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white text-sm font-medium shadow-lg">
            {
              [
                item.provinceId,
                item.districtId,
                item.wardId,
                ...(item.listConvenientIds || []),
              ].filter(Boolean).length
            }{" "}
            filter(s) active
          </div>
        </div>
      )}
    </div>
  );
}
