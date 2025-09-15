//
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import { updatePreferences } from "@/services/ProfileService";
import { useSession } from "next-auth/react";

import { District, Province, Ward } from "@/types/types";
import { Button, Form, Modal, Select, message, Input } from "antd";
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
  const { data: session } = useSession();
  const [provinces, setProvinces] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [wards, setWards] = useState<SelectOption[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Remove old filter initialization logic, only need to load provinces initially

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
    } catch (err) {
      console.error("Error fetching wards", err);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Create full address string from selections
      let searchAddress = "";
      const selectedProvince = provinces.find(
        (p) => p.value === values.province
      );
      const selectedDistrict = districts.find(
        (d) => d.value === values.district
      );
      const selectedWard = wards.find((w) => w.value === values.ward);

      // Start with specific address (if any)
      const addressParts = [];
      if (values.specificAddress) {
        addressParts.push(values.specificAddress);
      }
      if (selectedWard) {
        addressParts.push(selectedWard.label);
      }
      if (selectedDistrict) {
        addressParts.push(selectedDistrict.label);
      }
      if (selectedProvince) {
        addressParts.push(selectedProvince.label);
      }

      searchAddress = addressParts.join(", ");

      const userId = session?.user?.userProfile?.id;
      if (userId) {
        await updatePreferences(
          userId,
          {
            searchAddress: searchAddress || undefined,
          },
          session
        );
        messageApi.success("Update successful!");
        handleClose();
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error("Update failed! " + error.message);
        // If response has JSON error body, log details
        if ((error as any).response) {
          try {
            const errJson = await (error as any).response.json();
            console.error("API error:", errJson);
          } catch {
            // ignore
          }
        }
      } else {
        messageApi.error("Update failed!");
      }
      console.error("Error updating user preferences:", error);
    }
  };

  return (
    <Modal
      open={true}
      onCancel={handleClose}
      // onOk removed, only using custom button
      title="Update Address"
      footer={null}
      width={600}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto", padding: 24 } }}
      centered
    >
      {contextHolder}
      <Form form={form} layout="vertical">
        <Form.Item label="Specific Address" name="specificAddress">
          <Input
            placeholder="Enter specific address (house number, street name, etc.)"
            allowClear
          />
        </Form.Item>
        <div className="flex gap-4 justify-between">
          <Form.Item
            label="Province/City"
            name="province"
            rules={[
              { required: true, message: "Please select province/city!" },
            ]}
          >
            <Select
              options={provinces}
              placeholder="Select Province/City"
              onChange={handleProvinceChange}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            label="District"
            name="district"
            rules={[{ required: true, message: "Please select district!" }]}
          >
            <Select
              options={districts}
              placeholder="Select District"
              onChange={handleDistrictChange}
              loading={loadingDistricts}
              allowClear
              showSearch
              optionFilterProp="label"
              disabled={districts.length === 0}
              fieldNames={{ label: "label", value: "value" }}
            />
          </Form.Item>
          <Form.Item
            label="Ward"
            name="ward"
            rules={[{ required: true, message: "Please select ward!" }]}
          >
            <Select
              options={wards}
              placeholder="Select Ward"
              loading={loadingWards}
              allowClear
              showSearch
              optionFilterProp="label"
              disabled={wards.length === 0}
              fieldNames={{ label: "label", value: "value" }}
            />
          </Form.Item>
        </div>
        <div className="flex gap-4 justify-center">
          <Form.Item>
            <Button type="primary" block onClick={handleSave}>
              Save
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="default" block onClick={handleClose}>
              Close
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
