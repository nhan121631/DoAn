"use client";

import { useParams } from "next/navigation";
import { Descriptions, Table, Tag, Modal, Button, message, Tooltip, Spin, Alert } from "antd";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ContractData, BillData } from "@/types/types";
import BillDetail from "../../components/my-contracts/BillDetail";
import { DownloadOutlined, EyeOutlined, CreditCardOutlined } from "@ant-design/icons";
import { BillService } from "@/services/BillService";
import { ContractService } from "@/services/ContractService";

export default function ContractDetailPage() {
  const { id }: any = useParams();
  const { data: session } = useSession();
  
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);

  // Fetch contract data on component mount
  useEffect(() => {
    const fetchContract = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const contractData = await ContractService.getById(id);
        setContract(contractData);
      } catch (err) {
        console.error("Failed to fetch contract:", err);
        setError("Failed to load contract details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  // 🔹 Download Bill as PDF
  const handleDownload = async (contractId: string, billId: string) => {
    try {
      const blob = await BillService.downloadBill(contractId, billId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bill-${billId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success("Bill downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      message.error("Failed to download bill PDF");
    }
  };

  // Handle Payment
  const handlePayment = async (bill: BillData) => {
    try {
      message.info(`Redirecting to VNPay for bill ${bill.month}...`);
    } catch (error) {
      message.error("Payment failed. Please try again.");
    }
  };

  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading contract details..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  // No contract found
  if (!contract) {
    return (
      <Alert
        message="Contract Not Found"
        description="The requested contract could not be found."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Contract Detail</h2>

      {/* Contract Info */}
      <Descriptions bordered column={2} size="middle" className="mb-6">
        <Descriptions.Item label="Contract Name">
          {contract.contractName}
        </Descriptions.Item>
        <Descriptions.Item label="Room">{contract.roomTitle}</Descriptions.Item>
        <Descriptions.Item label="Tenant">{contract.tenantName}</Descriptions.Item>
        <Descriptions.Item label="Phone">{contract.tenantPhone}</Descriptions.Item>
        <Descriptions.Item label="Landlord">{contract.landlordName}</Descriptions.Item>
        <Descriptions.Item label="Start Date">
          {new Date(contract.startDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="End Date">
          {new Date(contract.endDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Deposit">
          {formatCurrency(contract.depositAmount)}
        </Descriptions.Item>
        <Descriptions.Item label="Rent">
          {formatCurrency(contract.monthlyRent)} / month
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {contract.status === 0 ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>}
        </Descriptions.Item>
      </Descriptions>

      {/* Bills */}
      <h3 className="text-lg font-semibold mb-2 mt-4">Bills</h3>
      <Table<BillData>
        rowKey="id"
        dataSource={contract.bills}
        scroll={{ x: "max-content" }}
        columns={[
          {
            title: "Month",
            dataIndex: "month",
            key: "month",
            render: (month: string) => (
              <span className="text-red-600 font-semibold">{month}</span>
            ),
            align: "start",
            width: 100,
            sorter: (a: BillData, b: BillData) => a.month.localeCompare(b.month),
          },
          {
            title: "Electricity",
            dataIndex: "electricityFee",
            key: "electricityFee",
            align: "start",
            width: 120,
            render: (fee: number) => formatCurrency(fee),
            sorter: (a: BillData, b: BillData) => (a.electricityFee || 0) - (b.electricityFee || 0),
          },
          {
            title: "Water",
            dataIndex: "waterFee",
            key: "waterFee",
            align: "start",
            width: 120,
            render: (fee: number) => formatCurrency(fee),
            sorter: (a: BillData, b: BillData) => (a.waterFee || 0) - (b.waterFee || 0),
          },
          {
            title: "Service",
            dataIndex: "serviceFee",
            key: "serviceFee",
            align: "start",
            width: 120,
            render: (fee: number) => formatCurrency(fee),
            sorter: (a: BillData, b: BillData) => (a.serviceFee || 0) - (b.serviceFee || 0),
          },
          {
            title: "Total",
            dataIndex: "totalAmount",
            key: "totalAmount",
            align: "start",
            width: 120,
            render: (amount: number) => (
              <span className="font-semibold text-red-600">{formatCurrency(amount)}</span>
            ),
            sorter: (a: BillData, b: BillData) => (a.totalAmount || 0) - (b.totalAmount || 0),
          },
          {
            title: "Paid",
            dataIndex: "paid",
            key: "paid",
            align: "start",
            width: 120,
            render: (paid: boolean) =>
              paid ? <Tag color="green">Paid</Tag> : <Tag color="red">Unpaid</Tag>,
            sorter: (a: BillData, b: BillData) => Number(a.paid) - Number(b.paid),
          },
          {
            title: "Actions",
            key: "actions",
            align: "start",
            width: 180,
            render: (_: unknown, record: BillData) => (
              <div className="flex items-center justify-start gap-2">
                <Tooltip title="View Bill">
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => setSelectedBill(record)}
                  />
                </Tooltip>

                <Tooltip title="Download PDF">
                  <Button
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={() => handleDownload(contract.id, record.id)}
                    
                  />
                </Tooltip>

                {!record.paid && (
                  <Tooltip title="Pay Now">
                    <Button
                      type="primary"
                      icon={<CreditCardOutlined />}
                      size="small"
                      onClick={() => handlePayment(record)}
                    >
                      Pay Now
                    </Button>
                  </Tooltip>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Bill Detail Modal */}
      <Modal
        title={null}
        open={!!selectedBill}
        onCancel={() => setSelectedBill(null)}
        footer={null}
        width={700}
        className="bill-modal"
      >
        {selectedBill && <BillDetail bill={selectedBill} contract={contract} />}
      </Modal>
    </div>
  );
}
