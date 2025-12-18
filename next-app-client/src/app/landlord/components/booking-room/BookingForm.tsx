"use client";

import React, { useState } from "react";
import { Button, Form, InputNumber, Modal, message, Select } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { createBooking } from "@/services/BookingService";
import dayjs, { Dayjs } from "dayjs";
import { redirect, useRouter } from "next/navigation";
// import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { createBookingNotification } from "@/services/NotificationService";

interface BookingFormProps {
  roomId: string;
  roomTitle: string;
  priceMonth: number;
  onBookingSuccess?: () => void;
}

interface BookingFormData {
  rentalMonths: number;
  tenantCount: number;
}

export default function BookingForm({
  roomId,
  roomTitle,
  priceMonth,
  onBookingSuccess,
}: BookingFormProps) {
  const { data: session } = useSession();

  const [form] = Form.useForm<BookingFormData>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rentalEndDate, setRentalEndDate] = useState<Dayjs | null>(
    dayjs().add(1, "month")
  );
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const showModal = () => {
    if (!session) {
      redirect("/auth/login");
    } else {
      setIsModalVisible(true);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setRentalEndDate(dayjs().add(1, "month"));
  };

  const handleConfirmModalClose = () => {
    setIsConfirmModalVisible(false);
  };

  const handleViewRentalHistory = () => {
    setIsConfirmModalVisible(false);
    router.push("/user-dashboard/rental-history");
  };

  const handleStayHere = () => {
    setIsConfirmModalVisible(false);
  };

  // Tính ngày kết thúc khi thay đổi số tháng
  const calculateEndDate = (months: number) => {
    if (months) {
      const startDate = dayjs(); // Sử dụng ngày hiện tại
      const endDate = startDate.add(months, "month");
      setRentalEndDate(endDate);
      return endDate;
    }
    setRentalEndDate(null);
    return null;
  };

  const handleSubmit = async (values: BookingFormData) => {
    // Sử dụng giá trị mặc định nếu người dùng không chọn
    const rentalMonths = values.rentalMonths || 1;

    console.log("Form values received:", values);
    console.log("Rental months:", rentalMonths);

    setLoading(true);
    try {
      const startDate = dayjs(); // Ngày bắt đầu thuê là ngày hiện tại
      const endDate = startDate.add(rentalMonths, "month");

      const bookingData = {
        roomId,
        rentalDate: startDate.toISOString(),
        rentalExpires: endDate.toISOString(),
        tenantCount: values.tenantCount,
      };

      console.log("Booking data to be sent:", bookingData);
      console.log("Room ID type:", typeof roomId, "Value:", roomId);
      console.log(
        "Tenant count type:",
        typeof values.tenantCount,
        "Value:",
        values.tenantCount
      );

      await createBooking(bookingData);
      await createBookingNotification(
        roomId,
        session?.user.id,
        "Bạn có một đặt phòng mới từ người thuê cho phòng: " + roomTitle
      );

      // Hiển thị thông báo thành công
      messageApi.success({
        content: "Đặt phòng thành công!",
        duration: 2,
      });

      // Đóng modal booking trước
      handleCancel();
      onBookingSuccess?.();

      // Hiển thị modal xác nhận sau khi đóng modal booking
      setTimeout(() => {
        setIsConfirmModalVisible(true);
      }, 300);
    } catch (error: unknown) {
      console.error("BookingForm - Error occurred:", error);

      let errorMessage = "Đặt phòng thất bại. Vui lòng thử lại.";

      if (error instanceof Error) {
        console.error("BookingForm - Error message:", error.message);

        try {
          const errorData = JSON.parse(error.message);
          if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }

      messageApi.error({
        content: errorMessage,
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Button
        type="primary"
        size="large"
        className="w-full font-semibold bg-blue-600 border-blue-600 hover:bg-blue-700"
        onClick={showModal}
      >
        Đặt phòng ngay
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-blue-600" />
            <span className="text-lg font-semibold">Đặt phòng</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        centered
      >
        <div className="p-4 mb-4 rounded-lg bg-gray-50">
          <h3 className="mb-2 font-semibold text-gray-800">{roomTitle}</h3>
          <p className="font-bold text-green-600">
            {priceMonth?.toLocaleString("vi-VN")} VND/tháng
          </p>
        </div>
        {isModalVisible && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              tenantCount: 1,
              rentalMonths: 1,
            }}
          >
            <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarOutlined className="text-blue-600" />
                <span className="font-medium text-gray-700">
                  Thời gian thuê
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Ngày bắt đầu:</strong> {dayjs().format("DD/MM/YYYY")}{" "}
                  (Hôm nay)
                </p>
                {rentalEndDate && (
                  <p>
                    <strong>Ngày kết thúc:</strong>{" "}
                    {rentalEndDate.format("DD/MM/YYYY")}
                  </p>
                )}
              </div>
            </div>

            <Form.Item
              name="rentalMonths"
              label="Thời gian thuê (Tháng)"
              rules={[
                {
                  type: "number",
                  min: 1,
                  message: "At least 1 month required",
                },
              ]}
            >
              <Select
                className="w-full"
                placeholder="Chọn số tháng (Mặc định: 1 tháng)"
                onChange={(value) => calculateEndDate(value)}
                suffixIcon={<ClockCircleOutlined />}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                  <Select.Option key={month} value={month}>
                    {month} {month === 1 ? "Tháng" : "Tháng"}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {rentalEndDate && (
              <div className="p-3 mb-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarOutlined className="text-green-600" />
                  <span className="font-medium text-gray-700">
                    Tổng chi phí
                  </span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {(
                    priceMonth * (form.getFieldValue("rentalMonths") || 1)
                  ).toLocaleString("vi-VN")}{" "}
                  VND
                </p>
                <p className="text-sm text-gray-600">
                  {form.getFieldValue("rentalMonths") || 1} tháng ×{" "}
                  {priceMonth.toLocaleString("vi-VN")} VND/tháng
                </p>
              </div>
            )}

            <Form.Item
              name="tenantCount"
              label="Số lượng người thuê"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số lượng người thuê",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Ít nhất 1 người thuê",
                },
              ]}
            >
              <InputNumber
                className="w-full"
                min={1}
                max={10}
                prefix={<UserOutlined />}
                placeholder="Nhập số lượng người thuê"
              />
            </Form.Item>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleCancel} className="flex-1">
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Xác nhận đặt phòng
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* Modal xác nhận chuyển trang */}
      <Modal
        title="Đặt phòng thành công!"
        open={isConfirmModalVisible}
        onCancel={handleConfirmModalClose}
        footer={[
          <Button key="stay" onClick={handleStayHere}>
            Ở lại đây
          </Button>,
          <Button
            key="history"
            type="primary"
            onClick={handleViewRentalHistory}
          >
            Xem Lịch Sử Thuê
          </Button>,
        ]}
        centered
        width={400}
      >
        <p>Bạn muốn xem lịch sử thuê hay ở lại trang này?</p>
      </Modal>
    </>
  );
}
