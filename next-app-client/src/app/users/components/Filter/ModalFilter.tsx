/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterRequest, useFilterStore } from "@/stores/FilterStore";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import { getConvenients } from "@/services/Convenients";
import { Convenient, District, Province, Ward } from "@/types/types";
import { Button, Form, Modal, Select } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SelectOption = {
  label: string;
  value: string;
};

export default function ModalFilter({
  handleClose,
}: {
  handleClose: () => void;
}) {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [wards, setWards] = useState<SelectOption[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [convenients, setConvenients] = useState<Convenient[]>([]);
  const { applyFilters, resetFilters, item } = useFilterStore((state) => state);
  const router = useRouter();

  useEffect(() => {
    const fetchInit = async () => {
      // Nếu đã có provinceId thì load districts
      if (item.provinceId) {
        const data = await getDistricts(String(item.provinceId));
        const options = data.map((d: District) => ({
          label: d.name,
          value: String(d.id),
        }));
        setDistricts(options);
      }
      // Nếu đã có districtId thì load wards
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
    // Map lại dữ liệu từ store sang key của form, convert id to string for Select
    const formValues: any = {
      province: item.provinceId ? String(item.provinceId) : undefined,
      district: item.districtId ? String(item.districtId) : undefined,
      ward: item.wardId ? String(item.wardId) : undefined,
      convenients: item.listConvenientIds
        ? item.listConvenientIds.map(String)
        : [],
    };
    // Map lại priceRange
    if (item.minPrice === 0 && item.maxPrice === 1000000)
      formValues.priceRange = "under1m";
    else if (item.minPrice === 1000000 && item.maxPrice === 2000000)
      formValues.priceRange = "1m-2m";
    else if (item.minPrice === 2000000 && item.maxPrice === 3000000)
      formValues.priceRange = "2m-3m";
    else if (item.minPrice === 3000000 && item.maxPrice === 5000000)
      formValues.priceRange = "3m-5m";
    else if (item.minPrice === 5000000 && item.maxPrice === 7000000)
      formValues.priceRange = "5m-7m";
    else if (item.minPrice === 7000000 && item.maxPrice === 10000000)
      formValues.priceRange = "7m-10m";
    else if (item.minPrice === 10000000 && item.maxPrice === 15000000)
      formValues.priceRange = "10m-15m";
    else if (item.minPrice === 15000000 && item.maxPrice === undefined)
      formValues.priceRange = "over15m";
    else formValues.priceRange = "all";
    // Map lại areaRange
    if (item.minArea === 0 && item.maxArea === 20)
      formValues.areaRange = "under20";
    else if (item.minArea === 20 && item.maxArea === 30)
      formValues.areaRange = "20-30";
    else if (item.minArea === 30 && item.maxArea === 50)
      formValues.areaRange = "30-50";
    else if (item.minArea === 50 && item.maxArea === 70)
      formValues.areaRange = "50-70";
    else if (item.minArea === 70 && item.maxArea === 90)
      formValues.areaRange = "70-90";
    else if (item.minArea === 90 && item.maxArea === undefined)
      formValues.areaRange = "over90";
    else formValues.areaRange = "all";
    form.setFieldsValue(formValues);
  }, [form, item]);

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
        // Nếu form đã có provinceId thì set lại để hiển thị label
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

  const handleProvinceChange = async (provinceId: string | undefined) => {
    form.setFieldsValue({ district: undefined, ward: undefined });
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
      // Nếu form đã có districtId thì set lại để hiển thị label
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
  };

  const handleDistrictChange = async (districtId: string | undefined) => {
    form.setFieldsValue({ ward: undefined });
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
      // Nếu form đã có wardId thì set lại để hiển thị label
      const wardValue = form.getFieldValue("ward");
      if (wardValue && options.some((opt: any) => opt.value === wardValue)) {
        form.setFieldsValue({ ward: wardValue });
      }
    } catch (err) {
      console.error("Error fetching wards", err);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      let minPrice, maxPrice;
      switch (values.priceRange) {
        case "under1m":
          minPrice = 0;
          maxPrice = 1000000;
          break;
        case "1m-2m":
          minPrice = 1000000;
          maxPrice = 2000000;
          break;
        case "2m-3m":
          minPrice = 2000000;
          maxPrice = 3000000;
          break;
        case "3m-5m":
          minPrice = 3000000;
          maxPrice = 5000000;
          break;
        case "5m-7m":
          minPrice = 5000000;
          maxPrice = 7000000;
          break;
        case "7m-10m":
          minPrice = 7000000;
          maxPrice = 10000000;
          break;
        case "10m-15m":
          minPrice = 10000000;
          maxPrice = 15000000;
          break;
        case "over15m":
          minPrice = 15000000;
          maxPrice = undefined;
          break;
        default:
          minPrice = undefined;
          maxPrice = undefined;
      }
      // Area Range
      let minArea, maxArea;
      switch (values.areaRange) {
        case "under20":
          minArea = 0;
          maxArea = 20;
          break;
        case "20-30":
          minArea = 20;
          maxArea = 30;
          break;
        case "30-50":
          minArea = 30;
          maxArea = 50;
          break;
        case "50-70":
          minArea = 50;
          maxArea = 70;
          break;
        case "70-90":
          minArea = 70;
          maxArea = 90;
          break;
        case "over90":
          minArea = 90;
          maxArea = undefined;
          break;
        default:
          minArea = undefined;
          maxArea = undefined;
      }
      const payload: FilterRequest = {
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        provinceId: values.province ? Number(values.province) : undefined,
        districtId: values.district ? Number(values.district) : undefined,
        wardId: values.ward ? Number(values.ward) : undefined,
        listConvenientIds: values.convenients
          ? values.convenients.map(Number)
          : undefined,
      };
      console.log("Payload gửi lên server:", payload);
      applyFilters(payload);

      // Convert payload to query object with string values
      const filterToQuery = (filter: FilterRequest) => {
        const query: Record<string, string> = {};
        if (filter.provinceId !== undefined)
          query.provinceId = String(filter.provinceId);
        if (filter.districtId !== undefined)
          query.districtId = String(filter.districtId);
        if (filter.wardId !== undefined) query.wardId = String(filter.wardId);
        if (filter.minPrice !== undefined)
          query.minPrice = String(filter.minPrice);
        if (filter.maxPrice !== undefined)
          query.maxPrice = String(filter.maxPrice);
        if (filter.minArea !== undefined)
          query.minArea = String(filter.minArea);
        if (filter.maxArea !== undefined)
          query.maxArea = String(filter.maxArea);
        if (filter.listConvenientIds && filter.listConvenientIds.length > 0)
          query.listConvenientIds = filter.listConvenientIds.join(",");
        return query;
      };

      const queryObj = filterToQuery(payload);
      const queryString = new URLSearchParams(queryObj).toString();
      router.push(`/users${queryString ? "?" + queryString : ""}`);
      handleClose();
    });
  };

  return (
    <Modal
      open={true}
      onCancel={handleClose}
      onOk={handleOk}
      title="Filters"
      footer={null}
      width={600}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto", padding: 24 } }}
      centered
    >
      <Form form={form} layout="vertical">
        <div className="flex gap-4 justify-between">
          <Form.Item label="Province" name="province">
            <Select
              options={provinces}
              placeholder="All Provinces"
              onChange={handleProvinceChange}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="District" name="district">
            <Select
              options={districts}
              placeholder="All Districts"
              onChange={handleDistrictChange}
              loading={loadingDistricts}
              allowClear
              showSearch
              optionFilterProp="label"
              disabled={districts.length === 0}
              fieldNames={{ label: "label", value: "value" }}
            />
          </Form.Item>
          <Form.Item label="Ward" name="ward">
            <Select
              options={wards}
              placeholder="All Wards"
              loading={loadingWards}
              allowClear
              showSearch
              optionFilterProp="label"
              disabled={wards.length === 0}
              fieldNames={{ label: "label", value: "value" }}
            />
          </Form.Item>
        </div>
        {/* Price Range */}
        <Form.Item label="Price Range" name="priceRange">
          <Select
            options={[
              { label: "All", value: "all" },
              { label: "Under 1M", value: "under1m" },
              { label: "1M - 2M", value: "1m-2m" },
              { label: "2M - 3M", value: "2m-3m" },
              { label: "3M - 5M", value: "3m-5m" },
              { label: "5M - 7M", value: "5m-7m" },
              { label: "7M - 10M", value: "7m-10m" },
              { label: "10M - 15M", value: "10m-15m" },
              { label: "Over 15M", value: "over15m" },
            ]}
            placeholder="All"
            allowClear
          />
        </Form.Item>
        {/* Area Range */}
        <Form.Item label="Area Range" name="areaRange">
          <Select
            options={[
              { label: "All", value: "all" },
              { label: "Under 20m²", value: "under20" },
              { label: "20m² - 30m²", value: "20-30" },
              { label: "30m² - 50m²", value: "30-50" },
              { label: "50m² - 70m²", value: "50-70" },
              { label: "70m² - 90m²", value: "70-90" },
              { label: "Over 90m²", value: "over90" },
            ]}
            placeholder="All"
            allowClear
          />
        </Form.Item>
        {/* Special Features */}
        <Form.Item label="Convenients" name="convenients">
          <Select
            mode="multiple"
            placeholder="Select convenients"
            options={convenients.map((c) => ({
              label: c.name,
              value: String(c.id),
            }))}
            style={{ width: "100%" }}
            optionLabelProp="label"
            tagRender={(props) => {
              const { label, closable, onClose } = props;
              return (
                <span style={{ marginRight: 3 }}>
                  {label}
                  {closable && (
                    <span
                      style={{ cursor: "pointer", marginLeft: 2 }}
                      onClick={onClose}
                    >
                      ×
                    </span>
                  )}
                </span>
              );
            }}
          />
        </Form.Item>
        <div className="flex gap-4 justify-center">
          <Form.Item>
            <Button type="primary" htmlType="submit" block onClick={handleOk}>
              Apply
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="default" block onClick={resetFilters}>
              Reset
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
