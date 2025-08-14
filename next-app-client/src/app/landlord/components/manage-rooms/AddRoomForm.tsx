/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { Form, Input, InputNumber, Button, Upload, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { RoomData } from "../../types";
import { Convenient, District, Province, TypePost, Ward } from "@/types/types";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import { getPostTypes } from "@/services/TypePostService";
import { getConvenients } from "@/services/Convenients";
import { createRoom } from "@/services/RoomService";
import { message } from "antd";

type ProvinceOption = {
  label: string;
  value: string;
};
// districts sẽ được load động theo tỉnh
const initialDistricts: ProvinceOption[] = [];
// wards sẽ được load động theo quận/huyện
const initialWards: ProvinceOption[] = [];

const AddRoomForm: React.FC<{ onFinish?: (values: RoomData) => void }> = (
  {
    //   onFinish,
  }
) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

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
  const [typeposts, setTypeposts] = React.useState<TypePost[]>([]);
  const [selectedTypePostId, setSelectedTypePostId] = React.useState<
    string | undefined
  >(undefined);
  const [startDate, setStartDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [totalPrice, setTotalPrice] = React.useState<number>(0);
  const [convenients, setConvenients] = React.useState<Convenient[]>([]);

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

  // Tính giá khi thay đổi ngày hoặc loại bài đăng
  useEffect(() => {
    if (!selectedTypePostId || !startDate || !endDate) {
      setTotalPrice(0);
      return;
    }
    const typepost = typeposts.find((tp) => tp.id === selectedTypePostId);
    if (!typepost) {
      setTotalPrice(0);
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    setTotalPrice(diffDays * typepost.pricePerDay);
  }, [selectedTypePostId, startDate, endDate, typeposts]);
  useEffect(() => {
    const fetchTypePosts = async () => {
      try {
        const data = await getPostTypes();
        setTypeposts(data);
      } catch (error) {
        console.error("Failed to fetch type posts:", error);
      }
    };
    fetchTypePosts();
  }, []);

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

  //   const handleOnSubmit = (values: RoomData) => {
  //
  //     message.success("Đã gửi thông tin phòng mới!");
  //     if (onFinish) onFinish({ ...values, images: fileList });
  //     form.resetFields();
  //     setFileList([]);
  //   };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Build address object
      const address = {
        street: values.address,
        wardId: values.ward,
      };

      // Build convenientIds array
      const convenientIds = values.convenients;

      // Build final room data
      const roomData = {
        title: values.name,
        description: values.description,
        priceMonth: values.priceMonth,
        priceDeposit: values.priceDeposit,
        area: values.area,
        postStartDate: startDate,
        postEndDate: endDate,
        typepostId: selectedTypePostId,
        // userId: "44256067-6f69-11f0-8622-b42e993f445f", // đã handled trong server action api next
        address,
        convenientIds,
        // images: fileList.map((file) => file.originFileObj as File), // nếu cần gửi ảnh
      };

      const images = fileList
        .map((file) => file.originFileObj)
        .filter(Boolean) as File[];

      const result = await createRoom(images, JSON.stringify(roomData));
      messageApi.success({
        content: "Room information submitted successfully!",
        duration: 1.5,
      });
      console.log("Kết quả:", result);

      console.log("Submitted Room Data:", roomData);
      form.resetFields();
      setFileList([]);
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate(new Date().toISOString().split("T")[0]);
      setSelectedTypePostId(undefined);
    } catch (error: any) {
      messageApi.error({
        content:
          error.message ||
          "An error occurred while submitting room information",
        duration: 1.5,
      });
      // console.error("Validation failed:", error.message);
    }
  };

  return (
    <>
      {contextHolder}

      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#171f2f] dark:text-white p-0 m-0">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ area: 20, price: 1000000 }}
          className="w-full h-full bg-white dark:bg-[#232b3b] rounded-none shadow-none p-0"
        >
          <div className="flex flex-col md:flex-row gap-6 w-full h-full">
            {/* Vùng thông tin phòng */}
            <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
              <h3 className="font-semibold text-base mb-2">Room Infomation</h3>
              <Form.Item label="Room Images" required>
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList: newList }) => setFileList(newList)}
                  beforeUpload={() => false}
                  multiple
                >
                  {fileList.length >= 8 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Form.Item
                label="Room Name"
                name="name"
                rules={[{ required: true, message: "Please enter room name" }]}
              >
                <Input placeholder="Enter room name" />
              </Form.Item>
              <div className="flex gap-2 justify-between">
                <Form.Item
                  label="Province/City"
                  name="province"
                  rules={[{ required: true, message: "Select province/city" }]}
                >
                  <Select
                    showSearch
                    placeholder="Select province/city"
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
                  rules={[{ required: true, message: "Select district" }]}
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
                  rules={[{ required: true, message: "Select ward" }]}
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
                rules={[{ required: true, message: "Enter address" }]}
              >
                <Input placeholder="Enter address" />
              </Form.Item>

              <div className="flex gap-2">
                <Form.Item
                  label="Area (m²)"
                  name="area"
                  className="flex-1"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      min: 1,
                      message: "Enter area",
                    },
                  ]}
                >
                  <InputNumber min={1} max={200} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  label="Monthly Price"
                  name="priceMonth"
                  className="flex-1"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      min: 1000,
                      message: "Enter monthly price",
                    },
                  ]}
                >
                  <InputNumber
                    min={1000}
                    step={100000}
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    addonAfter="₫"
                  />
                </Form.Item>
                <Form.Item
                  label="Deposit Price"
                  name="priceDeposit"
                  className="flex-1"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      min: 1000,
                      message: "Enter deposit price",
                    },
                  ]}
                >
                  <InputNumber
                    min={1000}
                    step={10000}
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    addonAfter="₫"
                  />
                </Form.Item>
              </div>
            </div>
            {/* Vùng thông tin liên hệ */}
            <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
              {/* <h3 className="font-semibold text-base mb-2">
              Thông tin liên hệ người đăng
            </h3>
            <Form.Item
              label="Tên chủ phòng"
              name="landlordName"
              rules={[{ required: true, message: "Nhập tên chủ phòng" }]}
            >
              <Input placeholder="Nhập tên chủ phòng" />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  pattern: /^\d{9,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" maxLength={11} />
            </Form.Item> */}

              {/* Phần tiện nghi (convenient) */}
              <h3 className="font-semibold text-base mb-2">Convenient Part</h3>
              <Form.Item
                label="Convenients"
                name="convenients"
                rules={[{ required: true, message: "Select convenients" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select convenients"
                  options={convenients.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <h3 className="font-semibold text-base mb-2">
                Post Price Information
              </h3>
              <Form.Item
                label="Post Type"
                name="typepostId"
                rules={[{ required: true, message: "Select post type" }]}
              >
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-[#232b3b]">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">
                          Post Type
                        </th>
                        <th className="px-4 py-2 text-left font-semibold">
                          Price/Day (₫)
                        </th>
                        <th className="px-4 py-2 text-left font-semibold">
                          Description
                        </th>
                        <th className="px-4 py-2 text-center font-semibold">
                          Select
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#232b3b]">
                      {typeposts.map((typepost) => (
                        <tr
                          key={typepost.id}
                          className="hover:bg-gray-50 dark:hover:bg-[#1a2233] transition"
                        >
                          <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            {typepost.name}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            {typepost.pricePerDay.toLocaleString("vi-VN")}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            {typepost.description || "Không có mô tả"}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                            <input
                              type="radio"
                              name="typepostId"
                              value={typepost.id}
                              checked={selectedTypePostId === typepost.id}
                              onChange={() =>
                                setSelectedTypePostId(typepost.id)
                              }
                              className="accent-blue-600 scale-125 cursor-pointer"
                              style={{ margin: 0 }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Form.Item>
              {/* Start Date: always today, disabled input */}
              <Form.Item
                label="Start Date"
                name="startDate"
                initialValue={startDate}
                rules={[]}
              >
                <Input
                  type="date"
                  value={startDate}
                  disabled
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                label="End Date"
                name="endDate"
                rules={[
                  {
                    required: true,
                    message: "Select end date",
                  },
                ]}
              >
                <Input
                  type="date"
                  value={endDate}
                  min={(() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().split("T")[0];
                  })()}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </Form.Item>
              {/* Hiển thị tổng giá */}
              <div className="mb-2">
                <label className="font-semibold">Total Post Price:</label>
                <div className="text-lg text-blue-600 font-bold">
                  {totalPrice.toLocaleString("vi-VN")} ₫
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={10} placeholder="Description (optional)" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                onClick={() => handleSubmit()}
              >
                Add Room
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </>
  );
};

export default AddRoomForm;
