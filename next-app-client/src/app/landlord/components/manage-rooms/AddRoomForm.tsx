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
      0,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
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
      content: "Đã gửi thông tin phòng mới!",
      duration: 1.5,
    });
    console.log("Kết quả:", result);

      console.log("Submitted Room Data:", roomData);
      // form.resetFields();
      // setFileList([]);
    } catch (error) {
      console.error("Validation failed:", error);
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
            <h3 className="font-semibold text-base mb-2">Thông tin phòng</h3>
            <Form.Item label="Hình ảnh phòng" required>
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
              label="Tên phòng"
              name="name"
              rules={[{ required: true, message: "Nhập tên phòng" }]}
            >
              <Input placeholder="Nhập tên phòng" />
            </Form.Item>
            <div className="flex gap-2 justify-between">
              <Form.Item
                label="Tỉnh/Thành phố"
                name="province"
                rules={[{ required: true, message: "Chọn tỉnh/thành phố" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn tỉnh/thành phố"
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
                label="Quận/Huyện"
                name="district"
                rules={[{ required: true, message: "Chọn quận/huyện" }]}
              >
                <Select
                  placeholder="Chọn quận/huyện"
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
                label="Phường/Xã"
                name="ward"
                rules={[{ required: true, message: "Chọn phường/xã" }]}
              >
                <Select
                  placeholder="Chọn phường/xã"
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
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Nhập địa chỉ" }]}
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>

            <div className="flex gap-2">
              <Form.Item
                label="Diện tích (m²)"
                name="area"
                className="flex-1"
                rules={[
                  {
                    required: true,
                    type: "number",
                    min: 1,
                    message: "Nhập diện tích",
                  },
                ]}
              >
                <InputNumber min={1} max={200} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Giá/tháng"
                name="priceMonth"
                className="flex-1"
                rules={[
                  {
                    required: true,
                    type: "number",
                    min: 1000,
                    message: "Nhập giá",
                  },
                ]}
              >
                <InputNumber min={1000} step={1000} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Giá đặt cọc"
                name="priceDeposit"
                className="flex-1"
                rules={[
                  {
                    required: true,
                    type: "number",
                    min: 1000,
                    message: "Nhập giá",
                  },
                ]}
              >
                <InputNumber min={1000} step={1000} style={{ width: "100%" }} />
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

            {/* Phần tiện nghi (convinient) */}
            <h3 className="font-semibold text-base mb-2">
              Thông tin tiện nghi
            </h3>
            <Form.Item
              label="Tiện nghi"
              name="convenients"
              rules={[{ required: true, message: "Chọn tiện nghi" }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn tiện nghi"
                options={convenients.map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <h3 className="font-semibold text-base mb-2">
              Thông tin giá bài đăng
            </h3>
            <Form.Item
              label="Chọn loại bài đăng"
              name="typepostId"
              rules={[
                { required: true, message: "Vui lòng chọn loại bài đăng" },
              ]}
            >
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-[#232b3b]">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">
                        Loại bài đăng
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Giá/ngày (₫)
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Mô tả
                      </th>
                      <th className="px-4 py-2 text-center font-semibold">
                        Chọn
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
                            onChange={() => setSelectedTypePostId(typepost.id)}
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
            <Form.Item
              label="Ngày bắt đầu đăng"
              name="startDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu" },
              ]}
            >
              <Input
                type="date"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              label="Ngày kết thúc đăng"
              name="endDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc đăng" },
              ]}
            >
              <Input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </Form.Item>
            {/* Hiển thị tổng giá */}
            <div className="mb-2">
              <label className="font-semibold">Tổng giá đăng bài:</label>
              <div className="text-lg text-blue-600 font-bold">
                {totalPrice.toLocaleString("vi-VN")} ₫
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={10} placeholder="Mô tả (không bắt buộc)" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              onClick={() => handleSubmit()}
            >
              Thêm phòng
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
    </>
  );
};

export default AddRoomForm;
