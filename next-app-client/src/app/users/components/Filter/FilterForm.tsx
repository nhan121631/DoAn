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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    // Only update if values are different to avoid breaking user input
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

  // Trigger filter and update URL param without reload (like CardFilter)
  const triggerFilter = (checkedValues?: any) => {
    // Nếu là convenients thì lấy checkedValues, còn lại lấy từ form
    const values = {
      ...form.getFieldsValue(),
      convenients: checkedValues ?? form.getFieldValue('convenients'),
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
    // Build query string
    const query: Record<string, string> = {};
    if (payload.provinceId !== undefined)
      query.provinceId = String(payload.provinceId);
    if (payload.districtId !== undefined)
      query.districtId = String(payload.districtId);
    if (payload.wardId !== undefined) query.wardId = String(payload.wardId);
    if (payload.listConvenientIds && payload.listConvenientIds.length > 0)
      query.listConvenientIds = payload.listConvenientIds.join(",");
    const queryString = new URLSearchParams(query).toString();
    // Giữ vị trí scroll khi lọc
    router.replace(`/users${queryString ? "?" + queryString : ""}`, { scroll: false });
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

  return (
    <Form
      form={form}
      layout="vertical"
      className="w-[300px] bg-white shadow-md rounded-lg p-4 flex flex-col gap-4"
    >
      <span className="font-semibold text-[15px] my-2 mx-5 text-gray-800">
        Addresses
      </span>
      <div className="flex flex-wrap gap-2 justify-between mx-5">
        <Form.Item label="Province" name="province" className="flex-1 min-w-0">
          <Select
            options={provinces}
            placeholder="All Provinces"
            allowClear
            showSearch
            optionFilterProp="label"
            className="w-full"
            onChange={handleProvinceChange}
          />
        </Form.Item>
        <Form.Item label="District" name="district" className="flex-1 min-w-0">
          <Select
            options={districts}
            placeholder="All Districts"
            loading={loadingDistricts}
            allowClear
            showSearch
            optionFilterProp="label"
            disabled={districts.length === 0}
            fieldNames={{ label: "label", value: "value" }}
            className="w-full"
            onChange={handleDistrictChange}
          />
        </Form.Item>
        <Form.Item label="Ward" name="ward" className="flex-1 min-w-0">
          <Select
            options={wards}
            placeholder="All Wards"
            loading={loadingWards}
            allowClear
            showSearch
            optionFilterProp="label"
            disabled={wards.length === 0}
            fieldNames={{ label: "label", value: "value" }}
            className="w-full"
            onChange={triggerFilter}
          />
        </Form.Item>
      </div>
      {/* Special Features */}
      <Form.Item>
        <span className="font-semibold text-[15px] my-2 mx-5 text-gray-800">
          Convenients
        </span>
        <div className="bg-white rounded-lg overflow-y-auto mx-5">
          <Checkbox.Group
            className="w-full"
            onChange={triggerFilter}
            value={form.getFieldValue("convenients")}
          >
            {/* Không bọc div, chỉ render Checkbox trực tiếp */}
            {convenients.map((c) => (
              <Checkbox
                key={c.id}
                value={String(c.id)}
                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 transition cursor-pointer w-full"
              >
                <span className="capitalize text-[15px] text-gray-800">
                  {c.name.replace(/_/g, " ")}
                </span>
              </Checkbox>
            ))}
          </Checkbox.Group>
        </div>
      </Form.Item>
      {/* No Apply/Reset buttons, filter triggers on change */}
    </Form>
  );
}
