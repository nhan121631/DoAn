/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, Upload, Button, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Image from "next/image";
import { FaUser, FaMapMarkerAlt } from "react-icons/fa";
import { IoIosPhonePortrait } from "react-icons/io";
import { MdOutlineMail } from "react-icons/md";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import type { FormInstance } from "antd/es/form";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import { District, Province, Ward } from "@/types/types";

interface ModalProfileProps {
  open: boolean;
  onCancel: () => void;
  onSave: (values: {
    name: string;
    phone: string;
    email: string;
    address: string;
  }) => void;
  avatarUrl: string;
  onAvatarChange: (info: UploadChangeParam<UploadFile<any>>) => void;
  form: FormInstance;
}
type ProvinceOption = {
  label: string;
  value: string;
};
// districts sẽ được load động theo tỉnh
const initialDistricts: ProvinceOption[] = [];
// wards sẽ được load động theo quận/huyện
const initialWards: ProvinceOption[] = [];

export default function ModalProfile({
  open,
  onCancel,
  onSave,
  avatarUrl,
  // onAvatarChange,
  form,
}: ModalProfileProps) {
  // const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(
    undefined
  );

  const [provinces, setProvinces] = React.useState<ProvinceOption[]>([]);
  const [districts, setDistricts] =
    React.useState<ProvinceOption[]>(initialDistricts);
  const [wards, setWards] = React.useState<ProvinceOption[]>(initialWards);
  const [selectedProvince, setSelectedProvince] = React.useState<
    string | undefined
  >(undefined);
  const [selectedDistrict, setSelectedDistrict] = React.useState<
    string | undefined
  >(undefined);
  const [loadingDistricts, setLoadingDistricts] = React.useState(false);
  const [loadingWards, setLoadingWards] = React.useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        const options = data.map((province: Province) => ({
          label: province.name,
          value: province.id,
        }));
        setProvinces(options);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Khi chọn tỉnh, load lại danh sách quận/huyện
  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(undefined);
    form.setFieldsValue({ district: undefined, ward: undefined }); // reset district, ward khi đổi tỉnh
    setDistricts([]); // clear districts khi loading
    setWards([]); // clear wards khi loading
    setLoadingDistricts(true);
    try {
      if (typeof window !== "undefined" && provinceId) {
        const data = await getDistricts(provinceId);
        const options = data.map((district: District) => ({
          label: district.name,
          value: district.id,
        }));
        setDistricts(options);
      }
    } catch (error) {
      console.error("Failed to fetch districts:", error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Khi chọn quận/huyện, load lại danh sách xã/phường
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrict(districtId);
    form.setFieldsValue({ ward: undefined }); // reset ward khi đổi quận/huyện
    setWards([]); // clear wards khi loading
    setLoadingWards(true);
    try {
      if (typeof window !== "undefined" && districtId) {
        const data = await getWards(districtId);
        const options = data.map((ward: Ward) => ({
          label: ward.name,
          value: ward.id,
        }));
        setWards(options);
      }
    } catch (error) {
      console.error("Failed to fetch wards:", error);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  // Xử lý preview khi chọn ảnh mới
  const handleAvatarChange = (info: UploadChangeParam<UploadFile<any>>) => {
    setFileList(info.fileList);
    if (info.fileList && info.fileList[0] && info.fileList[0].originFileObj) {
      const url = URL.createObjectURL(info.fileList[0].originFileObj);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(undefined);
    }
  };
  return (
    <Modal
      title={
        <span className="font-bold text-lg">Edit Personal Information</span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={480}
      styles={{ body: { paddingTop: 24, paddingBottom: 8 } }}
    >
      <div className="flex flex-col items-center mb-4">
        <Image
          src={previewUrl || avatarUrl}
          alt="Avatar"
          width={100}
          height={100}
          className="rounded-full border-2 border-blue-500 mb-2"
        />
        <div className="flex justify-center mt-2 w-full">
          <Form.Item
            name="avatar"
            label=""
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            style={{ marginBottom: 0 }}
          >
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              onChange={handleAvatarChange}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
        </div>
      </div>
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item name="name" label="Full Name">
          <Input prefix={<FaUser />} placeholder="Full Name" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: "Please enter your phone number" },
            {
              pattern: /^\d{10,15}$/,
              message: "Phone number must be 10-15 digits",
            },
          ]}
        >
          <Input prefix={<IoIosPhonePortrait />} placeholder="Phone Number" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input prefix={<MdOutlineMail />} placeholder="Email" />
        </Form.Item>
        <div className="flex gap-2 justify-between">
          <Form.Item
            label="Province"
            name="province"
            className="flex-1"
            rules={[
              {
                validator: (_, value) => {
                  const district = form.getFieldValue("district");
                  const ward = form.getFieldValue("ward");
                  const address = form.getFieldValue("address");
                  const anyFilled = value || district || ward || address;
                  if (anyFilled && !value) {
                    return Promise.reject("Please select province");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Select province"
              options={provinces}
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={handleProvinceChange}
            />
          </Form.Item>
          <Form.Item
            label="District"
            name="district"
            className="flex-1"
            rules={[
              {
                validator: (_, value) => {
                  const province = form.getFieldValue("province");
                  const ward = form.getFieldValue("ward");
                  const address = form.getFieldValue("address");
                  const anyFilled = province || value || ward || address;
                  if (anyFilled && !value) {
                    return Promise.reject("Please select district");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              placeholder="Select district"
              options={districts}
              disabled={!selectedProvince}
              loading={loadingDistricts}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={handleDistrictChange}
            />
          </Form.Item>
          <Form.Item
            label="Ward"
            name="ward"
            className="flex-1"
            rules={[
              {
                validator: (_, value) => {
                  const province = form.getFieldValue("province");
                  const district = form.getFieldValue("district");
                  const address = form.getFieldValue("address");
                  const anyFilled = province || district || value || address;
                  if (anyFilled && !value) {
                    return Promise.reject("Please select ward");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              placeholder="Select ward"
              options={wards}
              disabled={!selectedDistrict}
              loading={loadingWards}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </div>
        <Form.Item
          label="Address"
          name="address"
          rules={[
            {
              validator: (_, value) => {
                const province = form.getFieldValue("province");
                const district = form.getFieldValue("district");
                const ward = form.getFieldValue("ward");
                const anyFilled = province || district || ward || value;
                if (anyFilled && !value) {
                  return Promise.reject("Please enter address");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Enter your address" />
        </Form.Item>
        {/* Bank: only required if any field is filled, then all must be filled */}
        <Form.Item
          name="bank"
          label="Bank"
          rules={[
            {
              validator: (_, value) => {
                const accountNumber = form.getFieldValue("accountNumber");
                const accountHolder = form.getFieldValue("accountHolder");
                const anyFilled = value || accountNumber || accountHolder;
                if (anyFilled && !value) {
                  return Promise.reject("Please select a bank");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Select
            placeholder="Select bank"
            options={[
              { value: "Vietcombank", label: "Vietcombank" },
              { value: "VietinBank", label: "VietinBank" },
              { value: "BIDV", label: "BIDV" },
              { value: "MB Bank", label: "MB Bank" },
              { value: "Techcombank", label: "Techcombank" },
              { value: "ACB", label: "ACB" },
              { value: "Sacombank", label: "Sacombank" },
              { value: "Agribank", label: "Agribank" },
              { value: "TPBank", label: "TPBank" },
              { value: "VPBank", label: "VPBank" },
            ]}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item
          name="accountNumber"
          label="Account Number"
          rules={[
            {
              validator: (_, value) => {
                const bank = form.getFieldValue("bank");
                const accountHolder = form.getFieldValue("accountHolder");
                const anyFilled = bank || value || accountHolder;
                if (anyFilled && !value) {
                  return Promise.reject("Please enter your account number");
                }
                return Promise.resolve();
              },
            },
            {
              pattern: /^\d{8,20}$/,
              message: "Account number must be 8-20 digits",
            },
          ]}
        >
          <Input placeholder="Account Number" />
        </Form.Item>
        <Form.Item
          name="accountHolder"
          label="Account Holder Name"
          rules={[
            {
              validator: (_, value) => {
                const bank = form.getFieldValue("bank");
                const accountNumber = form.getFieldValue("accountNumber");
                const anyFilled = bank || accountNumber || value;
                if (anyFilled && !value) {
                  return Promise.reject("Please enter the account holder name");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Account Holder Name" />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
