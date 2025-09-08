import React, { useEffect, useState } from "react";
import { Modal, Popconfirm, Button, message } from "antd";
import { BankOutlined } from "@ant-design/icons";
import Image from "next/image";
import { BillData, ContractData, LandlordPaymentInfo } from "@/types/types";
import { BillService } from "@/services/BillService";
import { createPayment } from "@/services/PaymentServive";

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
        message.error("Failed to load payment information");
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
        message.error("Failed to create payment URL");
      }
    } catch (error) {
      console.error("VNPay payment failed:", error);
      message.error("Failed to initiate VNPay payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle confirm manual transfer
  const handleConfirmTransfer = async () => {
    if (!transferConfirmed) {
      message.warning("Please confirm that you have completed the transfer");
      return;
    }

    if (!bill || !contract) return;

    try {
      // Update bill status to "CONFIRMING" using the new API
      await BillService.updateBillStatus(contract.id, bill.id, "CONFIRMING");
      
      message.success("Transfer confirmation submitted successfully!");
      onConfirm();
      setTransferConfirmed(false);
    } catch (error) {
      console.error("Failed to update bill status:", error);
      message.error("Failed to confirm transfer");
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
          <span>Bill Payment - {bill?.month}</span>
        </div>
      }
      width={600}
    >
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
                  {new Date(bill.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Electricity:</span>
                <span className="font-semibold">{bill.electricityFee.toLocaleString()} đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Water:</span>
                <span className="font-semibold">{bill.waterFee.toLocaleString()} đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold">{bill.serviceFee.toLocaleString()} đ</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-semibold">Total Amount:</span>
                <span className="font-bold text-lg text-red-600">
                  {bill.totalAmount.toLocaleString()} đ
                </span>
              </div>
            </div>
          </div>

          {/* VNPay Payment Button */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Online Payment (Recommended)
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Pay securely with VNPay - supports all major banks and payment methods
            </p>
            <Button
              type="primary"
              size="large"
              onClick={handleVNPayPayment}
              loading={paymentLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Pay with VNPay - {bill.totalAmount.toLocaleString()} đ
            </Button>
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
                disabled={!transferConfirmed}
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
