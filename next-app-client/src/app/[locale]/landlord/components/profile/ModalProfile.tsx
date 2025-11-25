/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import { getBanks } from "@/services/ProfileService";
import { District, Province, Ward } from "@/types/types";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Upload } from "antd";
import type { FormInstance } from "antd/es/form";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { IoIosPhonePortrait } from "react-icons/io";
import { MdOutlineMail } from "react-icons/md";

interface ModalProfileProps {
  open: boolean;
  onCancel: () => void;
  onSave: (values: {
    name: string;
    phone: string;
    email: string;
    address: string;
    ward: string;
    bank: string;
    binCode: string;
    accountNumber: string;
    accountHolder: string;
    avatar?: File[] | null;
  }) => void;
  avatarUrl: string;
  onAvatarChange: (info: UploadChangeParam<UploadFile<any>>) => void;
  form: FormInstance;
  userProfile?: any;
}

type BankOption = {
  bin: string;
  short_name: string;
};

type SelectOption = {
  label: string;
  value: string;
};

export default function ModalProfile({
  open,
  onCancel,
  onSave,
  avatarUrl,
  form,
  userProfile,
  loading,
}: ModalProfileProps & { loading?: boolean }) {
  // const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [provinces, setProvinces] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [wards, setWards] = useState<SelectOption[]>([]);
  const [banks, setBanks] = useState<SelectOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Lấy giá trị mặc định từ session
  useEffect(() => {
    if (userProfile && open) {
      const provinceId = userProfile.address?.ward?.district?.province?.id;
      const districtId = userProfile.address?.ward?.district?.id;
      const wardId = userProfile.address?.ward?.id;
      form.setFieldsValue({
        name: userProfile.fullName,
        phone: userProfile.phoneNumber,
        email: userProfile.email,
        address: userProfile.address?.street,
        province: provinceId,
        district: districtId,
        ward: wardId,
        bank: userProfile.bankName,
        binCode: userProfile.binCode,
        accountNumber: userProfile.bankNumber,
        accountHolder: userProfile.accoutHolderName,
      });

      // Tự động fetch lại districts và wards để Select hiển thị label
      if (provinceId) {
        setSelectedProvince(provinceId);
        setLoadingDistricts(true);
        getDistricts(provinceId).then((districtData) => {
          const districtOptions = districtData.map((item: District) => ({
            label: item.name,
            value: item.id,
          }));
          setDistricts(districtOptions);
          setLoadingDistricts(false);
        });
      }
      if (districtId) {
        setSelectedDistrict(districtId);
        setLoadingWards(true);
        getWards(districtId).then((wardData) => {
          const wardOptions = wardData.map((item: Ward) => ({
            label: item.name,
            value: item.id,
          }));
          setWards(wardOptions);
          setLoadingWards(false);
        });
      }
    }
  }, [userProfile, form, open]);

  const handleBankChange = (_: string, option: any) => {
    form.setFieldsValue({ binCode: option.bin });
  };

  const handleAvatarChange = (info: UploadChangeParam<UploadFile<unknown>>) => {
    // setFileList(info.fileList);
    const file = info.fileList?.[0]?.originFileObj;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(undefined);
    }
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        const options = data.map((item: Province) => ({
          label: item.name,
          value: item.id,
        }));
        setProvinces(options);
      } catch (err) {
        console.error("Error fetching provinces", err);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const data = await getBanks();
        const arr = Array.isArray(data) ? data : [];
        const options = arr.map((item: BankOption) => ({
          label: item.short_name,
          value: item.short_name,
          bin: item.bin,
        }));
        setBanks(options);
      } catch (err) {
        console.error("Error fetching banks", err);
        setBanks([]);
      }
    };
    fetchBanks();
  }, []);

  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(undefined);
    setDistricts([]);
    setWards([]);
    form.setFieldsValue({ district: undefined, ward: undefined });

    setLoadingDistricts(true);
    try {
      const data = await getDistricts(provinceId);
      const options = data.map((item: District) => ({
        label: item.name,
        value: item.id,
      }));
      setDistricts(options);
    } catch (err) {
      console.error("Error fetching districts", err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrict(districtId);
    setWards([]);
    form.setFieldsValue({ ward: undefined });

    setLoadingWards(true);
    try {
      const data = await getWards(districtId);
      const options = data.map((item: Ward) => ({
        label: item.name,
        value: item.id,
      }));
      setWards(options);
    } catch (err) {
      console.error("Error fetching wards", err);
    } finally {
      setLoadingWards(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={560}
      title={
        <span className="text-lg font-bold">Edit Personal Information</span>
      }
      styles={{ body: { paddingTop: 24, paddingBottom: 8 } }}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-24 h-24 mb-2 overflow-hidden border-2 border-blue-500 rounded-full">
          <Image
            src={previewUrl || avatarUrl}
            alt="Avatar"
            width={100}
            height={100}
            className="mb-2 border-2 border-blue-500 rounded-full"
          />
           </div>
          <Form.Item
            name="avatar"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            style={{ marginBottom: 0 }}
          >
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                if (!isImage) {
                  window?.alert("Only image files are allowed!");
                }
                return isImage ? false : Upload.LIST_IGNORE;
              }}
              maxCount={1}
              accept="image/*"
              onChange={handleAvatarChange}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
        </div>

        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input prefix={<FaUser />} placeholder="Full Name" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            // { required: true, message: "Please enter your phone number" },
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
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input prefix={<MdOutlineMail />} placeholder="Email" />
        </Form.Item>

        <div className="flex gap-2">
          <Form.Item
            label="Province"
            name="province"
            className="flex-1"
            rules={[
              {
                validator: (_, value) => {
                  const anyFilled =
                    value ||
                    form.getFieldValue("district") ||
                    form.getFieldValue("ward") ||
                    form.getFieldValue("address");
                  return anyFilled && !value
                    ? Promise.reject("Please select province")
                    : Promise.resolve();
                },
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Select province"
              options={provinces}
              onChange={handleProvinceChange}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="District"
            name="district"
            className="flex-1"
            rules={[
              {
                validator: (_, value) => {
                  const anyFilled =
                    value ||
                    form.getFieldValue("province") ||
                    form.getFieldValue("ward") ||
                    form.getFieldValue("address");
                  return anyFilled && !value
                    ? Promise.reject("Please select district")
                    : Promise.resolve();
                },
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Select district"
              options={districts}
              loading={loadingDistricts}
              disabled={!selectedProvince}
              onChange={handleDistrictChange}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="Ward"
            name="ward"
            className="flex-1"
            rules={[
              {
                validator: (_, value) => {
                  const anyFilled =
                    value ||
                    form.getFieldValue("province") ||
                    form.getFieldValue("district") ||
                    form.getFieldValue("address");
                  return anyFilled && !value
                    ? Promise.reject("Please select ward")
                    : Promise.resolve();
                },
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Select ward"
              options={wards}
              loading={loadingWards}
              disabled={!selectedDistrict}
              optionFilterProp="label"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Address"
          name="address"
          rules={[
            {
              validator: (_, value) => {
                const anyFilled =
                  value ||
                  form.getFieldValue("province") ||
                  form.getFieldValue("district") ||
                  form.getFieldValue("ward");
                return anyFilled && !value
                  ? Promise.reject("Please enter address")
                  : Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Enter your address" />
        </Form.Item>

        <Form.Item
          name="bank"
          label="Bank"
          rules={[
            {
              validator: (_, value) => {
                const anyFilled =
                  value ||
                  form.getFieldValue("accountNumber") ||
                  form.getFieldValue("accountHolder");
                return anyFilled && !value
                  ? Promise.reject("Please select a bank")
                  : Promise.resolve();
              },
            },
          ]}
        >
          <Select
            placeholder="Select bank"
            options={banks}
            showSearch
            onChange={handleBankChange}
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item name="binCode" style={{ display: "none" }}>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item
          name="accountNumber"
          label="Account Number"
          rules={[
            {
              validator: (_, value) => {
                const anyFilled =
                  value ||
                  form.getFieldValue("bank") ||
                  form.getFieldValue("accountHolder");
                return anyFilled && !value
                  ? Promise.reject("Please enter account number")
                  : Promise.resolve();
              },
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
                const anyFilled =
                  value ||
                  form.getFieldValue("bank") ||
                  form.getFieldValue("accountNumber");
                return anyFilled && !value
                  ? Promise.reject("Please enter the account holder name")
                  : Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Account Holder Name" />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
          >
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
