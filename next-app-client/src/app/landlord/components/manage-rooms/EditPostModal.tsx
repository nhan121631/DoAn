import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import { getConvenients } from "@/services/Convenients";
import { getRoomById, updateRoom } from "@/services/RoomService";
import { getPostTypes } from "@/services/TypePostService";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Upload,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useEffect, useState } from "react";

interface EditPostModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string | null;
  onSuccess?: () => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

type ProvinceOption = {
  label: string;
  value: string;
};

interface EditPostModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string | null;
  onSuccess?: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  open,
  onClose,
  roomId,
  onSuccess,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [formReady, setFormReady] = useState(false);

  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [districts, setDistricts] = useState<ProvinceOption[]>([]);
  const [wards, setWards] = useState<ProvinceOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(
    undefined
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(
    undefined
  );
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [typeposts, setTypeposts] = useState<any[]>([]);
  const [convenients, setConvenients] = useState<any[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!open) return;

      try {
        const [provincesData, convenientsData, typepostsData] =
          await Promise.all([getProvinces(), getConvenients(), getPostTypes()]);

        setProvinces(
          provincesData.map((p: any) => ({ label: p.name, value: p.id }))
        );
        setConvenients(convenientsData);
        setTypeposts(typepostsData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchInitialData();
  }, [open]);

  // Fetch room data when modal opens
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId || !open) return;

      setLoading(true);
      try {
        const data = await getRoomById(roomId);
        setRoomData(data);
        setFileList([]);
        setFormReady(true);
        // Không setFieldsValue ở đây nữa

        // Handle address data (chỉ set state, không setFieldsValue)
        if (data.address?.ward?.district?.province?.id) {
          const provinceId = data.address.ward.district.province.id;
          setSelectedProvince(provinceId);
          const districtsData = await getDistricts(provinceId);
          setDistricts(
            districtsData.map((d: any) => ({ label: d.name, value: d.id }))
          );
          if (data.address.ward.district.id) {
            const districtId = data.address.ward.district.id;
            setSelectedDistrict(districtId);
            const wardsData = await getWards(districtId);
            setWards(
              wardsData.map((w: any) => ({ label: w.name, value: w.id }))
            );
          }
        }
      } catch (error: any) {
        console.error("Error fetching room data:", error);
        messageApi.error({
          content: error.message || "Failed to load room data",
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, open, form, messageApi]);

  // Khi form đã render và dữ liệu đã sẵn sàng, mới setFieldsValue
  useEffect(() => {
    if (formReady && roomData) {
      form.setFieldsValue({
        name: roomData.title || "",
        description: roomData.description || "",
        priceMonth: roomData.priceMonth || 0,
        priceDeposit: roomData.priceDeposit || 0,
        area: roomData.area || 0,
        address: roomData.address?.street || "",
        convenients: roomData.convenients?.map((c: any) => c.id) || [],
        postStartDate: roomData.postStartDate
          ? new Date(roomData.postStartDate).toISOString().split("T")[0]
          : "",
        postEndDate: roomData.postEndDate
          ? new Date(roomData.postEndDate).toISOString().split("T")[0]
          : "",
        province: roomData.address?.ward?.district?.province?.id || undefined,
        district: roomData.address?.ward?.district?.id || undefined,
        ward: roomData.address?.ward?.id || undefined,
      });
      setFormReady(false);
    }
  }, [formReady, roomData, form]);

  // Handle province change
  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(undefined);
    form.setFieldsValue({ district: undefined, ward: undefined });
    setDistricts([]);
    setWards([]);
    setLoadingDistricts(true);

    try {
      const data = await getDistricts(provinceId);
      setDistricts(data.map((d: any) => ({ label: d.name, value: d.id })));
    } catch (error) {
      console.error("Failed to fetch districts:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Handle district change
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrict(districtId);
    form.setFieldsValue({ ward: undefined });
    setWards([]);
    setLoadingWards(true);

    try {
      const data = await getWards(districtId);
      setWards(data.map((w: any) => ({ label: w.name, value: w.id })));
    } catch (error) {
      console.error("Failed to fetch wards:", error);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Lấy danh sách URL ảnh gốc từ DB
      const originalImageUrls =
        roomData?.images?.map((img: any) => img.url) || [];
      // Ảnh mới upload
      const images = fileList
        .map((file) => file.originFileObj)
        .filter(Boolean) as File[];

      // Logic existingImages
      let existingImages: string[] | null = null;
      if (fileList && fileList.length > 0) {
        // Nếu có fileList thì existingImages là danh sách URL gốc từ DB
        existingImages = originalImageUrls;
      } else {
        // Nếu không có fileList thì existingImages là null
        existingImages = null;
      }

      const roomPayload = {
        title: values.name,
        description: values.description,
        priceMonth: values.priceMonth,
        priceDeposit: values.priceDeposit,
        area: values.area,
        address: {
          street: values.address,
          wardId: values.ward,
        },
        convenientIds: values.convenients,
        existingImages,
      };

      // Log dữ liệu gửi lên API
      console.log("--- PAYLOAD UPDATE ROOM ---");
      console.log("roomPayload:", roomPayload);
      console.log("images:", images);
      console.log("existingImages:", existingImages);
      console.log("fileList:", fileList);
      console.log("---------------------------");

      const formData = new FormData();
      if (images.length > 0) {
        images.forEach((file) => {
          formData.append("images", file);
        });
      }
      formData.append("room", JSON.stringify(roomPayload));
      await updateRoom(roomId!, formData);

      // Show success message and close modal
      messageApi.success({
        content: "Room updated successfully!",
        duration: 2,
      });
      handleClose();

      // Refresh parent page data
      if (onSuccess) onSuccess();

      // Dispatch custom event to refresh RoomDetail
      if (roomId) {
        window.dispatchEvent(
          new CustomEvent("room-updated", { detail: { roomId } })
        );
      }
    } catch (error: any) {
      messageApi.error({
        content: error.message || "Failed to update room",
        duration: 3,
      });
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    setSelectedProvince(undefined);
    setSelectedDistrict(undefined);
    setDistricts([]);
    setWards([]);
    setRoomData(null);
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={<span style={{ fontSize: 24, fontWeight: 700 }}>Edit Room</span>}
        open={open}
        onCancel={handleClose}
        footer={null}
        width={1200}
        destroyOnHidden
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div>Loading room data...</div>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            className="w-full h-full bg-white dark:bg-[#232b3b] rounded-none shadow-none p-0"
          >
            <div className="flex flex-col md:flex-row gap-6 w-full h-full">
              {/* Left Column - Room Information */}
              <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
                <h3 className="font-semibold text-base mb-2">
                  Room Information
                </h3>

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
                  rules={[
                    { required: true, message: "Please enter room name" },
                  ]}
                >
                  <Input placeholder="Enter room name" />
                </Form.Item>

                <div className="flex gap-2 justify-between">
                  <Form.Item
                    label="Province/City"
                    name="province"
                    rules={[
                      { required: true, message: "Select province/city" },
                    ]}
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

              {/* Right Column - Convenients & Post Info */}
              <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
                <h3 className="font-semibold text-base mb-2">
                  Convenient Part
                </h3>
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
                  Post Information (Read Only)
                </h3>

                {/* Post Type Information - Read Only */}
                <Form.Item label="Post Type">
                  <div className="flex items-center p-3 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <span className="text-white font-bold text-sm mr-2 bg-red-500 px-2 py-1 rounded">
                      {roomData?.typepost
                        ? roomData.typepost.charAt(0).toUpperCase() +
                          roomData.typepost.slice(1)
                        : ""}
                    </span>
                    <span className="text-gray-700 dark:text-gray-200">
                      {roomData?.typepost && typeposts.length > 0
                        ? (() => {
                            const matchingTypepost = typeposts.find(
                              (tp: any) => tp.name === roomData.typepost
                            );
                            return matchingTypepost
                              ? `${
                                  matchingTypepost.name
                                } - ${matchingTypepost.pricePerDay.toLocaleString(
                                  "vi-VN"
                                )}₫/day`
                              : roomData.typepost;
                          })()
                        : "Loading..."}
                    </span>
                  </div>
                </Form.Item>

                {/* Post Dates - Read Only */}
                <div className="flex gap-2">
                  <Form.Item
                    label="Start Date"
                    name="postStartDate"
                    className="flex-1"
                  >
                    <Input type="date" disabled className="w-full" />
                  </Form.Item>
                  <Form.Item
                    label="End Date"
                    name="postEndDate"
                    className="flex-1"
                  >
                    <Input type="date" disabled className="w-full" />
                  </Form.Item>
                </div>

                {/* Status Information */}
                {/* {roomData && (
                  <div className="bg-gray-50 p-3 rounded dark:bg-gray-700">
                    <h4 className="font-medium mb-2">Current Status:</h4>
                    <p>
                      <strong>Status:</strong> {roomData.status || "N/A"}
                    </p>
                    <p>
                      <strong>Approval Status:</strong>{" "}
                      {roomData.approvalStatus || "N/A"}
                    </p>
                    <p>
                      <strong>Hidden:</strong>{" "}
                      {roomData.isHidden ? "Yes" : "No"}
                    </p>
                  </div>
                )} */}
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
              <Form.Item label="Description" name="description">
                <Input.TextArea rows={4} placeholder="Description (optional)" />
              </Form.Item>

              {/* Footer Buttons */}
              <div className="flex gap-4 justify-end">
                <Button onClick={handleClose} size="large">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  size="large"
                  style={{ minWidth: "120px" }}
                >
                  Update Room
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default EditPostModal;
