/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Button, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
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
    ward: string;
    avatar?: File[] | null;
  }) => void;
  avatarUrl: string;
  onAvatarChange: (info: UploadChangeParam<UploadFile<any>>) => void;
  form: FormInstance;
  userProfile?: any;
}
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
}: ModalProfileProps) {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [provinces, setProvinces] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [wards, setWards] = useState<SelectOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
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
      });

      // Reset preview URL khi mở modal
      setPreviewUrl(undefined);

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

  const handleCancel = () => {
    setPreviewUrl(undefined);
    form.resetFields();
    onCancel();
  };
  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      width={560}
      title={
        <span className="font-bold text-lg">Chỉnh sửa thông tin cá nhân</span>
      }
      styles={{ body: { paddingTop: 24, paddingBottom: 8 } }}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-24 h-24 mb-2 rounded-full overflow-hidden border-2 border-blue-500">
            <Image
              src={previewUrl || avatarUrl || "/images/default/avatar.jpg"}
              alt="Avatar"
              fill
              className="object-cover"
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
                  window?.alert("Chỉ cho phép tải lên tệp hình ảnh!");
                }
                return isImage ? false : Upload.LIST_IGNORE;
              }}
              maxCount={1}
              accept="image/*"
              onChange={handleAvatarChange}
            >
              <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
          </Form.Item>
        </div>

        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input prefix={<FaUser />} placeholder="Họ và tên" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            // { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              pattern: /^\d{10,15}$/,
              message: "Số điện thoại phải từ 10-15 số",
            },
          ]}
        >
          <Input prefix={<IoIosPhonePortrait />} placeholder="Số điện thoại" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Định dạng email không hợp lệ" },
          ]}
        >
          <Input prefix={<MdOutlineMail />} placeholder="Email" />
        </Form.Item>

        <div className="flex gap-2">
          <Form.Item
            label="Tỉnh/Thành phố"
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
                    ? Promise.reject("Vui lòng chọn tỉnh/thành phố")
                    : Promise.resolve();
                },
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Chọn tỉnh/thành phố"
              options={provinces}
              onChange={handleProvinceChange}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="Quận/Huyện"
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
                    ? Promise.reject("Vui lòng chọn quận/huyện")
                    : Promise.resolve();
                },
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Chọn quận/huyện"
              options={districts}
              loading={loadingDistricts}
              disabled={!selectedProvince}
              onChange={handleDistrictChange}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="Phường/Xã"
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
                    ? Promise.reject("Vui lòng chọn phường/xã")
                    : Promise.resolve();
                },
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Chọn phường/xã"
              options={wards}
              loading={loadingWards}
              disabled={!selectedDistrict}
              optionFilterProp="label"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Địa chỉ cụ thể"
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
                  ? Promise.reject("Vui lòng nhập địa chỉ cụ thể")
                  : Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Nhập địa chỉ cụ thể" />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
