import React, { useEffect, useState } from "react";
import { Modal, Popconfirm, Button, message, Upload } from "antd";
import { BankOutlined, UploadOutlined } from "@ant-design/icons";
import Image from "next/image";
import {
  updateBookingStatus,
  getLandlordPaymentInfo,
  uploadBillTransferImage,
} from "@/services/BookingService";
import { LandlordPaymentInfo } from "@/types/types";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";

interface ModalPaymentProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
  bookingId: string;
}

function ModalPayment({
  open,
  onCancel,
  onConfirm,
  confirmLoading,
  bookingId,
}: ModalPaymentProps) {
  const [paymentInfo, setPaymentInfo] = useState<LandlordPaymentInfo | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadFile | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch landlord payment info when modal opens
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!open || !bookingId) return;

      setLoading(true);
      try {
        const info = await getLandlordPaymentInfo(bookingId);
        setPaymentInfo(info);
      } catch (error) {
        console.error("Failed to fetch payment info:", error);
        messageApi.error("Failed to load payment information");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [open, bookingId]);

  // Handle confirm payment
  const handleConfirmPayment = async () => {
    if (!transferConfirmed) {
      messageApi.warning("Vui lòng xác nhận bạn đã chuyển khoản");
      return;
    }

    // if (!uploadedImage) {
    //   messageApi.warning("Vui lòng tải lên ảnh hóa đơn chuyển khoản trước");
    //   return;
    // }

    try {
      await updateBookingStatus(bookingId, 3); // Set status to "waiting for deposit confirmation"
      messageApi.success("Xác nhận thanh toán thành công!");
      onConfirm();
      setTransferConfirmed(false);
      setUploadedImage(null);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      messageApi.error("Xác nhận thanh toán thất bại");
    }
  };

  const handleCancel = () => {
    setTransferConfirmed(false);
    setUploadedImage(null);
    onCancel();
  };

  // Handle file upload
  const handleUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const result = await uploadBillTransferImage(bookingId, file);
      messageApi.success("Hóa đơn chuyển khoản đã được tải lên thành công!");

      // Create upload file object for display
      const uploadFile: UploadFile = {
        uid: Date.now().toString(),
        name: file.name,
        status: "done",
        url: result.imageUrl,
      };
      setUploadedImage(uploadFile);

      return false; // Prevent default upload
    } catch (error) {
      console.error("Failed to upload image:", error);
      messageApi.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
      return false;
    } finally {
      setImageUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    accept: "image/*",
    beforeUpload: handleUpload,
    fileList: uploadedImage ? [uploadedImage] : [],
    onRemove: () => {
      setUploadedImage(null);
      return true;
    },
    maxCount: 1,
  };

  const copyBankNumber = () => {
    if (paymentInfo?.bankNumber) {
      navigator.clipboard.writeText(paymentInfo.bankNumber);
      messageApi.success("Đã sao chép số tài khoản ngân hàng");
    }
  };

  if (loading) {
    return (
      <Modal open={open} onCancel={handleCancel} footer={null} centered>
        <div className="text-center py-8">Đang tải thông tin thanh toán...</div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      title={
        <div className="flex items-center gap-2">
          <BankOutlined className="text-blue-600" />
          <span>Thông tin thanh toán</span>
        </div>
      }
      width={500}
    >
      {contextHolder}
      {paymentInfo ? (
        <div className="flex flex-col gap-4 p-4">
          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Chi tiết chuyển khoản
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ngân hàng:</span>
                <span className="font-semibold">{paymentInfo.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chủ tài khoản:</span>
                <span className="font-semibold">
                  {paymentInfo.accountHolderName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-blue-700">
                    {paymentInfo.bankNumber}
                  </span>
                  <Button size="small" onClick={copyBankNumber}>
                    Sao chép
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg p-4">
            <Image
              src={`https://img.vietqr.io/image/${paymentInfo.binCode}-${paymentInfo.bankNumber}-qr_only.png?amount=${paymentInfo.depositAmount}&addInfo=Dat coc phong ${bookingId}`}
              alt="QR Code for Payment"
              width={200}
              height={200}
              className="border border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-600 mt-2 text-center">
              Quét mã QR để thanh toán tiền cọc
            </p>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-gray-800 mb-2">
              Liên hệ chủ nhà:
            </h4>
            <div className="text-sm space-y-1">
              <div>
                📞 SĐT:{" "}
                <a
                  href={`tel:${paymentInfo.phoneNumber}`}
                  className="text-blue-600"
                >
                  {paymentInfo.phoneNumber}
                </a>
              </div>
              <div>
                📧 Email:{" "}
                <a
                  href={`mailto:${paymentInfo.email}`}
                  className="text-blue-600"
                >
                  {paymentInfo.email}
                </a>
              </div>
            </div>
          </div>

          {/* Upload Bill Transfer Image */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-700 mb-3">
              Tải lên ảnh hóa đơn chuyển khoản
            </h4>
            <p className="text-sm text-blue-600 mb-3">
              Vui lòng tải lên ảnh chụp màn hình hoặc ảnh hóa đơn chuyển khoản
              ngân hàng để xác nhận thanh toán.
            </p>
            <Upload {...uploadProps}>
              <Button
                icon={<UploadOutlined />}
                loading={imageUploading}
                className="w-full"
              >
                {imageUploading ? "Đang tải lên..." : "Chọn ảnh"}
              </Button>
            </Upload>
            {/* {!uploadedImage && (
              <p className="text-xs text-red-600 mt-1">
                * Trường này là bắt buộc để xác nhận thanh toán
              </p>
            )} */}
          </div>

          {/* Transfer Confirmation */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="transferConfirmed"
                checked={transferConfirmed}
                onChange={(e) => setTransferConfirmed(e.target.checked)}
                className="mt-1"
              />
              <label
                htmlFor="transferConfirmed"
                className="text-sm text-gray-700"
              >
                <strong>Tôi xác nhận rằng:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Tôi đã hoàn thành chuyển khoản ngân hàng</li>
                  <li>
                    Tôi đã ghi rõ mã đặt phòng trong nội dung chuyển khoản
                  </li>
                  <li>Tôi sẽ liên hệ chủ nhà nếu cần thiết</li>
                </ul>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCancel} className="flex-1">
              Hủy
            </Button>
            <Popconfirm
              title="Xác nhận đã chuyển khoản"
              description="Bạn chắc chắn đã hoàn thành chuyển khoản? Thao tác này sẽ thông báo cho chủ nhà xác nhận."
              onConfirm={handleConfirmPayment}
              okText="Đã chuyển khoản"
              cancelText="Chưa chuyển"
              okButtonProps={{ loading: confirmLoading }}
              disabled={!transferConfirmed}
            >
              <Button
                type="primary"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                loading={confirmLoading}
                // disabled={!transferConfirmed || !uploadedImage}
                disabled={!transferConfirmed}
              >
                Xác nhận đã chuyển khoản
              </Button>
            </Popconfirm>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Không có thông tin thanh toán
        </div>
      )}
    </Modal>
  );
}

export default ModalPayment;
