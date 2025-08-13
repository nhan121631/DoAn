import React, { useEffect, useState } from "react";
import { Modal, Popconfirm, Button, message } from "antd";
import { BankOutlined } from "@ant-design/icons";
import Image from "next/image";
import {
  updateBookingStatus,
  getLandlordPaymentInfo,
} from "@/services/BookingService";
import { LandlordPaymentInfo } from "@/types/types";

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
        message.error("Failed to load payment information");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [open, bookingId]);

  // Handle confirm payment
  const handleConfirmPayment = async () => {
    if (!transferConfirmed) {
      message.warning("Please confirm that you have completed the transfer");
      return;
    }

    try {
      await updateBookingStatus(bookingId, 3); // Set status to "waiting for deposit confirmation"
      message.success("Payment confirmation submitted successfully!");
      onConfirm();
      setTransferConfirmed(false);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      message.error("Failed to confirm payment");
    }
  };

  const handleCancel = () => {
    setTransferConfirmed(false);
    onCancel();
  };

  const copyBankNumber = () => {
    if (paymentInfo?.bankNumber) {
      navigator.clipboard.writeText(paymentInfo.bankNumber);
      message.success("Bank number copied to clipboard");
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
          <span>Payment Information</span>
        </div>
      }
      width={500}
    >
      {paymentInfo ? (
        <div className="flex flex-col gap-4 p-4">
          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Transfer Details
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
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg p-4">
            <Image
              src={`https://img.vietqr.io/image/${paymentInfo.binCode}-${paymentInfo.bankNumber}-qr_only.png?amount=5000000&addInfo=Dat coc phong ${bookingId}`}
              alt="QR Code for Payment"
              width={200}
              height={200}
              className="border border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-600 mt-2 text-center">
              Scan QR code to pay deposit
            </p>
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
                <strong>I confirm that:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>I have completed the bank transfer</li>
                  <li>I included the booking ID in the transfer description</li>
                  <li>I will contact the landlord if needed</li>
                </ul>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Popconfirm
              title="Confirm Payment Completion"
              description="Are you sure you have completed the bank transfer? This will notify the landlord for confirmation."
              onConfirm={handleConfirmPayment}
              okText="Yes, I've transferred"
              cancelText="Not yet"
              okButtonProps={{ loading: confirmLoading }}
              disabled={!transferConfirmed}
            >
              <Button
                type="primary"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                loading={confirmLoading}
                disabled={!transferConfirmed}
              >
                Confirm Payment Sent
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

export default ModalPayment;
