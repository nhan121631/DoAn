import { BillService } from "@/services/BillService";
import { BillData, ContractData } from "@/types/types";
import {
  CreditCardOutlined,
  DollarOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Image from "next/image";
import { useEffect, useState } from "react";
import BillDetail from "./BillDetail";
import BillPaymentModal from "./BillPaymentModal";

import { URL_IMAGE } from "@/services/Constant";

interface TenantBillsTabProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
}

const billStatusMap: Record<string, { text: string; color: string }> = {
  PENDING: { text: "Pending", color: "orange" },
  CONFIRMING: { text: "Confirming Payment", color: "blue" },
  PAID: { text: "Paid", color: "green" },
  OVERDUE: { text: "Overdue", color: "red" },
};

export default function TenantBillsTab({ contract }: TenantBillsTabProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);
  const [paymentBill, setPaymentBill] = useState<BillData | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");

  useEffect(() => {
    // Process bills to ensure all data is complete
    const processedBills = (contract.bills || []).map((bill) => {
      // Calculate usage from fees if not provided
      let electricityUsage = bill.electricityUsage;
      let waterUsage = bill.waterUsage;

      if (
        !electricityUsage &&
        bill.electricityPrice &&
        bill.electricityPrice > 0 &&
        bill.electricityFee
      ) {
        electricityUsage = bill.electricityFee / bill.electricityPrice;
      }

      if (
        !waterUsage &&
        bill.waterPrice &&
        bill.waterPrice > 0 &&
        bill.waterFee
      ) {
        waterUsage = bill.waterFee / bill.waterPrice;
      }

      // Calculate damageFee if not provided
      let damageFee = bill.damageFee;
      if (damageFee === null || damageFee === undefined) {
        const baseTotal =
          (bill.electricityFee || 0) +
          (bill.waterFee || 0) +
          (bill.serviceFee || 0);
        const calculatedDamageFee = (bill.totalAmount || 0) - baseTotal;
        damageFee = calculatedDamageFee > 0 ? calculatedDamageFee : 0;
      }

      return {
        ...bill,
        damageFee,
        electricityUsage,
        waterUsage,
      };
    });

    setBills(processedBills);
  }, [contract]);

  const handleDownload = async (billId: string, month: string) => {
    try {
      setLoading(true);
      const hideLoading = messageApi.loading("Preparing download...", 0);

      // Call BillService to download the bill
      const blob = await BillService.downloadBill(contract.id, billId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bill-${contract.tenantName}-${month}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      hideLoading();
      messageApi.success("Bill downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      messageApi.error("Failed to download bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (bill: BillData) => {
    setPaymentBill(bill);
    setPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    // Refresh bills data after payment
    setPaymentModalOpen(false);
    setPaymentBill(null);
    setPaymentLoading(true);

    try {
      // Reload contract to get updated bills data
      const updatedContract = await fetch(`/api/contracts/${contract.id}`).then(
        (res) => res.json()
      );

      if (updatedContract && updatedContract.bills) {
        setBills([...updatedContract.bills]);
        messageApi.success(
          "Payment processed successfully! Bill status updated."
        );
      } else {
        // Fallback: just reload from current contract
        setBills([...(contract.bills || [])]);
        messageApi.success("Payment processed successfully!");
      }
    } catch (error) {
      console.error("Failed to reload bills:", error);
      // Fallback: just reload from current contract
      setBills([...(contract.bills || [])]);
      messageApi.success("Payment processed successfully!");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setPaymentModalOpen(false);
    setPaymentBill(null);
  };

  // Calculate bill statistics
  const totalBills = bills.length;
  const paidBills = bills.filter((bill) => bill.status === "PAID").length;
  const pendingBills = bills.filter((bill) => bill.status === "PENDING").length;
  const confirmingBills = bills.filter(
    (bill) => bill.status === "CONFIRMING"
  ).length;
  const overdueBills = bills.filter((bill) => bill.status === "OVERDUE").length;
  const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const unpaidAmount = bills
    .filter((bill) => bill.status !== "PAID")
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  // Filter bills based on search and status
  const filteredBills = bills.filter((bill: BillData) => {
    const matchesSearch =
      bill.month.toLowerCase().includes(searchText.toLowerCase()) ||
      bill.totalAmount.toString().includes(searchText);

    // Handle both old boolean paid field and new status field
    let matchesStatus = true;
    if (statusFilter !== null && statusFilter !== undefined) {
      if (statusFilter === "PAID") {
        matchesStatus = bill.status === "PAID" || bill.paid === true;
      } else if (statusFilter === "PENDING") {
        matchesStatus =
          bill.status === "PENDING" || (!bill.status && bill.paid !== true);
      } else if (statusFilter === "CONFIRMING") {
        matchesStatus = bill.status === "CONFIRMING";
      } else if (statusFilter === "OVERDUE") {
        matchesStatus = bill.status === "OVERDUE";
      }
    }

    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<BillData> = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: (month: string) =>
        new Date(month).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      sorter: (a, b) =>
        new Date(a.month).getTime() - new Date(b.month).getTime(),
    },
    {
      title: "Electricity",
      dataIndex: "electricityFee",
      key: "electricityFee",
      render: (amount: number, record: BillData) => (
        <div>
          <div className="font-medium">{amount.toLocaleString()} đ</div>
          {record.electricityUsage && record.electricityPrice && (
            <div className="text-xs text-gray-500">
              {record.electricityUsage.toFixed(2)} kWh ×{" "}
              {record.electricityPrice.toLocaleString()} đ/kWh
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a.electricityFee - b.electricityFee,
    },
    {
      title: "Water",
      dataIndex: "waterFee",
      key: "waterFee",
      render: (amount: number, record: BillData) => (
        <div>
          <div className="font-medium">{amount.toLocaleString()} đ</div>
          {record.waterUsage && record.waterPrice && (
            <div className="text-xs text-gray-500">
              {record.waterUsage.toFixed(2)} m³ ×{" "}
              {record.waterPrice.toLocaleString()} đ/m³
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a.waterFee - b.waterFee,
    },
    {
      title: "Service",
      dataIndex: "serviceFee",
      key: "serviceFee",
      render: (amount: number, record: BillData) => (
        <div>
          <div className="font-medium">{amount.toLocaleString()} đ</div>
          {record.damageFee != null && record.damageFee > 0 && (
            <div className="text-xs text-red-500">
              + Damage Fee: {record.damageFee.toLocaleString()} đ
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a.serviceFee - b.serviceFee,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `${amount.toLocaleString()} đ`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: BillData) => {
        // Use the status from the record directly
        const actualStatus = status; // Don't fallback to paid boolean anymore
        const statusInfo = billStatusMap[actualStatus];

        if (!statusInfo) {
          return <Tag color="gray">Unknown ({actualStatus})</Tag>;
        }

        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Confirming Payment", value: "CONFIRMING" },
        { text: "Paid", value: "PAID" },
        { text: "Overdue", value: "OVERDUE" },
      ],
      onFilter: (value, record) => {
        return record.status === value;
      },
    },
    {
      title: "Image Proof",
      dataIndex: "imageProof",
      align: "center" as const,
      render: (text: string, record: BillData) => {
        if (!text || text === null || text === undefined) {
          return (
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-gray-500 text-xs">
              No Image
            </div>
          );
        }
        return (
          <div
            className="w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setSelectedImageUrl(`${URL_IMAGE}${text}`);
              setImagePreviewOpen(true);
            }}
          >
            <Image
              src={`${URL_IMAGE}${text}`}
              alt="Payment Proof"
              width={64}
              height={64}
              className="object-cover rounded border border-gray-300"
              style={{ width: "64px", height: "64px" }}
            />
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const status = record.status;
        const canPay = status === "PENDING" || status === "OVERDUE";
        const isConfirming = status === "CONFIRMING";
        const isPaid = status === "PAID";

        return (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => setSelectedBill(record)}
              />
            </Tooltip>
            <Tooltip title="Download PDF">
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(record.id, record.month)}
              />
            </Tooltip>
            {canPay && (
              <Tooltip title="Pay Now">
                <Button
                  type="primary"
                  size="small"
                  icon={<CreditCardOutlined />}
                  onClick={() => handlePayment(record)}
                >
                  Pay Now
                </Button>
              </Tooltip>
            )}
            {isConfirming && (
              <Tooltip title="Payment is being confirmed by landlord">
                <Button
                  type="default"
                  size="small"
                  disabled
                  icon={<CreditCardOutlined />}
                >
                  Confirming...
                </Button>
              </Tooltip>
            )}
            {isPaid && (
              <Tooltip title="Bill has been paid">
                <Button
                  type="default"
                  size="small"
                  disabled
                  style={{ color: "green" }}
                >
                  Paid ✓
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Bills Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card size="small">
          <Statistic
            title="Total Bills"
            value={totalBills}
            prefix={<DollarOutlined />}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Paid Bills"
            value={paidBills}
            valueStyle={{ color: "#3f8600" }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Pending Bills"
            value={pendingBills}
            valueStyle={{ color: "#cf1322" }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Confirming"
            value={confirmingBills}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Unpaid Amount"
            value={unpaidAmount}
            valueStyle={{ color: "#cf1322" }}
            suffix="đ"
          />
        </Card>
      </div>

      {/* Bills Table */}
      <Card
        title="Bills History"
        className="shadow-sm"
        extra={
          <Space>
            <Input
              placeholder="Search bills..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 180 }}
              allowClear
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value="PENDING">
                <Tag color="orange">Pending</Tag>
              </Select.Option>
              <Select.Option value="CONFIRMING">
                <Tag color="blue">Confirming</Tag>
              </Select.Option>
              <Select.Option value="PAID">
                <Tag color="green">Paid</Tag>
              </Select.Option>
              <Select.Option value="OVERDUE">
                <Tag color="red">Overdue</Tag>
              </Select.Option>
            </Select>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredBills}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} bills`,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>

      {/* Bill Detail Modal */}
      <BillDetail
        open={!!selectedBill}
        selectedBill={selectedBill}
        contract={contract}
        onClose={() => setSelectedBill(null)}
      />

      {/* Bill Payment Modal */}
      <BillPaymentModal
        open={paymentModalOpen}
        onCancel={handlePaymentCancel}
        onConfirm={handlePaymentConfirm}
        confirmLoading={paymentLoading}
        bill={paymentBill}
        contract={contract}
      />

      {/* Image Preview Modal */}
      <Modal
        open={imagePreviewOpen}
        title="Bill Image Proof"
        footer={null}
        onCancel={() => setImagePreviewOpen(false)}
        width={800}
        centered
      >
        {selectedImageUrl && (
          <div className="flex justify-center">
            <Image
              src={selectedImageUrl}
              alt="Bill proof preview"
              width={600}
              height={400}
              className="object-contain"
              style={{ maxWidth: "100%", maxHeight: "70vh" }}
            />
          </div>
        )}
      </Modal>

      {/* Payment Instructions */}
      {contextHolder}
      <Card title="Payment Information" className="shadow-sm">
        <div className="space-y-2">
          <p>
            <strong>Payment Methods:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Online payment via VNPay, MoMo, ZaloPay</li>
            <li>Bank transfer to landlord&apos;s account</li>
            <li>Cash payment (contact landlord)</li>
          </ul>
          <p className="text-sm text-gray-600 mt-4">
            <strong>Note:</strong> Please pay your bills before the due date to
            avoid late fees. Contact your landlord if you have any payment
            issues.
          </p>
        </div>
      </Card>
    </div>
  );
}
