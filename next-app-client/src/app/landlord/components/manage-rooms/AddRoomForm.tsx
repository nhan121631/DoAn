import React, { useEffect } from "react";
import { Form, Input, InputNumber, Button, Upload, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { RoomData } from "../../types";
import { District, Province, Ward } from "@/types/types";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";

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

  return (
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
                name="price"
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
            <h3 className="font-semibold text-base mb-2">
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
            </Form.Item>

            {/* Phần tiện nghi (convinient) */}
            <h3 className="font-semibold text-base mb-2">
              Thông tin tiện nghi
            </h3>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={2} placeholder="Mô tả (không bắt buộc)" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Thêm phòng
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default AddRoomForm;
