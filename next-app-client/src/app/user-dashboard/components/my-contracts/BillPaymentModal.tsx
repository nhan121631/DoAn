import React, { useEffect, useState } from "react";
import { Modal, Popconfirm, Button, message, Upload } from "antd";
import { BankOutlined, UploadOutlined } from "@ant-design/icons";
import Image from "next/image";
import { BillData, ContractData, LandlordPaymentInfo } from "@/types/types";
import { BillService } from "@/services/BillService";
import { createPayment } from "@/services/PaymentServive";
import { paymentNotification } from "@/services/NotificationService";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";

interface BillPaymentModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
  bill: BillData | null;
  contract: ContractData;
}

function BillPaymentModal({
  open,
  onCancel,
  onConfirm,
  confirmLoading,
  bill,
  contract,
}: BillPaymentModalProps) {
  const [paymentInfo, setPaymentInfo] = useState<LandlordPaymentInfo | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadFile | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  // Fetch landlord payment info when modal opens
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!open || !contract) return;

      setLoading(true);
      try {
        // Use payment info from contract instead of separate API call
        if (contract.landlordPaymentInfo) {
          const info: LandlordPaymentInfo = {
            landlordId: contract.landlordId,
            landlordName: contract.landlordName,
            accountHolderName: contract.landlordPaymentInfo.accountHolderName,
            bankNumber: contract.landlordPaymentInfo.bankNumber,
            bankName: contract.landlordPaymentInfo.bankName,
            binCode: contract.landlordPaymentInfo.binCode,
            depositAmount: bill?.totalAmount || 0,
            phoneNumber: contract.landlordPaymentInfo.phoneNumber,
            email: "landlord@example.com", // Email not included in PaymentInfoDto
          };
          setPaymentInfo(info);
        } else {
          // Fallback to mock data if payment info not available
          const mockPaymentInfo: LandlordPaymentInfo = {
            landlordId: contract.landlordId || "landlord-1",
            landlordName: contract.landlordName || "Landlord Name",
            accountHolderName: contract.landlordName || "Landlord Name",
            bankNumber: "1234567890",
            bankName: "Vietcombank",
            binCode: "970436",
            depositAmount: bill?.totalAmount || 0,
            phoneNumber: "0123456789",
            email: "landlord@example.com",
          };
          setPaymentInfo(mockPaymentInfo);
        }
      } catch (error) {
        console.error("Failed to process payment info:", error);
        messageApi.error("Failed to load payment information");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [open, contract, bill]);

  // Handle VNPay payment
  const handleVNPayPayment = async () => {
    if (!bill || !contract) return;

    try {
      setPaymentLoading(true);

      const paymentPayload = {
        amount: bill.totalAmount,
        description: `Payment for bill ${bill.month} - Contract ${contract.id}`,
        userId: contract.tenantId || "user-id", // Get from current user context
      };

      const paymentResult = await createPayment(paymentPayload);

      if (paymentResult.paymentUrl) {
        // Redirect to VNPay
        window.location.href = paymentResult.paymentUrl;
      } else {
        messageApi.error("Failed to create payment URL");
      }
    } catch (error) {
      console.error("VNPay payment failed:", error);
      messageApi.error("Failed to initiate VNPay payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle confirm manual transfer
  const handleConfirmTransfer = async () => {
    if (!transferConfirmed) {
      messageApi.warning("Please confirm that you have completed the transfer");
      return;
    }

    if (!uploadedImage) {
      messageApi.warning("Please upload your bill payment image first");
      return;
    }

    if (!bill || !contract) return;

    try {
      // Update bill status to "CONFIRMING" using the new API
      await BillService.updateBillStatus(contract.id, bill.id, "CONFIRMING");

      messageApi.success("Transfer confirmation submitted successfully!");

      await paymentNotification(
        contract.tenantId,
        contract.landlordId,
        contract.id,
        "Transfer confirmation submitted successfully for room: " +
          contract.contractName +
          ". Please verify the payment."
      );
      onConfirm();
      setTransferConfirmed(false);
      setUploadedImage(null);
    } catch (error) {
      console.error("Failed to update bill status:", error);
      messageApi.error("Failed to confirm transfer");
    }
  };

  const handleCancel = () => {
    setTransferConfirmed(false);
    setUploadedImage(null);
    onCancel();
  };

  // Handle file upload
  const handleUpload = async (file: File) => {
    if (!contract || !bill) return false;

    setImageUploading(true);
    try {
      const result = await BillService.uploadBillImageProof(
        contract.id,
        bill.id,
        file
      );
      messageApi.success("Bill payment image uploaded successfully!");

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
      messageApi.success("Bank number copied to clipboard");
    }
  };

  if (loading) {
    return (
      <Modal open={open} onCancel={handleCancel} footer={null} centered>
        <div className="text-center py-8">Loading payment information...</div>
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
          <span>Bill Payment - {bill?.month}</span>
        </div>
      }
      width={600}
    >
      {contextHolder}
      {paymentInfo && bill ? (
        <div className="flex flex-col gap-4 p-4">
          {/* Bill Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Bill Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Month:</span>
                <span className="font-semibold">
                  {new Date(bill.month).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Electricity:</span>
                <span className="font-semibold">
                  {bill.electricityFee.toLocaleString()} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Water:</span>
                <span className="font-semibold">
                  {bill.waterFee.toLocaleString()} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold">
                  {bill.serviceFee.toLocaleString()} đ
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-semibold">
                  Total Amount:
                </span>
                <span className="font-bold text-lg text-red-600">
                  {bill.totalAmount.toLocaleString()} đ
                </span>
              </div>
            </div>
          </div>

          {/* Manual Transfer Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              Manual Bank Transfer
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bank Name:</span>
                <span className="font-semibold">{paymentInfo.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Holder:</span>
                <span className="font-semibold">
                  {paymentInfo.accountHolderName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-blue-700">
                    {paymentInfo.bankNumber}
                  </span>
                  <Button size="small" onClick={copyBankNumber}>
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mt-4">
              <Image
                src={`https://img.vietqr.io/image/${paymentInfo.binCode}-${paymentInfo.bankNumber}-qr_only.png?amount=${bill.totalAmount}&addInfo=Bill payment ${bill.month} ${contract.id}`}
                alt="QR Code for Payment"
                width={150}
                height={150}
                className="border border-gray-300 rounded-lg"
              />
            </div>

            {/* Transfer Confirmation */}
            <div className="mt-4">
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
                  <strong>I confirm that:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>I have completed the bank transfer</li>
                    <li>I included the correct reference information</li>
                    <li>The amount matches exactly</li>
                  </ul>
                </label>
              </div>
            </div>
          </div>

          {/* Upload Bill Payment Image */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-3">
              Upload Bill Payment Image *
            </h4>
            <p className="text-sm text-red-700 mb-3">
              Please upload a screenshot or photo of your bank transfer as proof
              of bill payment.
            </p>
            <Upload {...uploadProps}>
              <Button
                icon={<UploadOutlined />}
                loading={imageUploading}
                className="w-full"
              >
                {imageUploading ? "Uploading..." : "Select Image"}
              </Button>
            </Upload>
            {!uploadedImage && (
              <p className="text-xs text-red-600 mt-1">
                * This field is required to confirm your payment
              </p>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-gray-800 mb-2">
              Contact Landlord:
            </h4>
            <div className="text-sm space-y-1">
              <div>
                📞 Phone:{" "}
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

          {/* Action Buttons for Manual Transfer */}
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Popconfirm
              title="Confirm Manual Transfer"
              description="Are you sure you have completed the bank transfer? The landlord will be notified to verify the payment."
              onConfirm={handleConfirmTransfer}
              okText="Yes, I've transferred"
              cancelText="Not yet"
              okButtonProps={{ loading: confirmLoading }}
              disabled={!transferConfirmed}
            >
              <Button
                type="default"
                className="flex-1"
                loading={confirmLoading}
                disabled={!transferConfirmed || !uploadedImage}
              >
                Confirm Manual Transfer
              </Button>
            </Popconfirm>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No payment information available
        </div>
      )}
    </Modal>
  );
}

export default BillPaymentModal;
