import React, { useState, useEffect } from "react";
import { Table, Tag, Button, message, Tooltip, Space, Card, Statistic, Input, Select } from "antd";
import { EyeOutlined, DownloadOutlined, CreditCardOutlined, DollarOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ContractData, BillData } from "@/types/types";
import { BillService } from "@/services/BillService";
import BillDetail from "./BillDetail";

interface TenantBillsTabProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
}

const billStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Pending", color: "orange" },
  1: { text: "Paid", color: "green" },
  2: { text: "Overdue", color: "red" },
};

export default function TenantBillsTab({ contract }: TenantBillsTabProps) {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);

  useEffect(() => {
    // In a real app, you'd fetch bills from the API
    // For now, using mock data or contract.bills if available
    setBills(contract.bills || []);
  }, [contract]);

  const handleDownload = async (billId: string, month: string) => {
    try {
      setLoading(true);
      message.loading("Preparing download...", 0);
      
      // Call BillService to download the bill
      const blob = await BillService.downloadBill(contract.id, billId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bill-${contract.tenantName}-${month}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      message.destroy();
      message.success("Bill downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      message.destroy();
      message.error("Failed to download bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (bill: BillData) => {
    try {
      // Mock payment - in real app, redirect to payment gateway
      message.info(`Redirecting to payment gateway for bill ${bill.month}...`);
      // Simulate payment process
      setTimeout(() => {
        message.success("Payment initiated successfully!");
      }, 1000);
    } catch (error) {
      message.error("Payment failed. Please try again.");
    }
  };

  // Calculate bill statistics
  const totalBills = bills.length;
  const paidBills = bills.filter(bill => bill.paid).length;
  const pendingBills = bills.filter(bill => !bill.paid).length;
  const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const unpaidAmount = bills.filter(bill => !bill.paid).reduce((sum, bill) => sum + bill.totalAmount, 0);

  // Filter bills based on search and status - similar to MyContract
  const filteredBills = bills.filter((bill: BillData) => {
    const matchesSearch = 
      bill.month.toLowerCase().includes(searchText.toLowerCase()) ||
      bill.totalAmount.toString().includes(searchText);
    
    const matchesStatus = statusFilter === null || statusFilter === undefined || bill.paid === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<BillData> = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: (month: string) => new Date(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      sorter: (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
    },
    {
      title: "Electricity",
      dataIndex: "electricityFee",
      key: "electricityFee",
      render: (amount: number) => `${amount.toLocaleString()} đ`,
      sorter: (a, b) => a.electricityFee - b.electricityFee,
    },
    {
      title: "Water",
      dataIndex: "waterFee",
      key: "waterFee",
      render: (amount: number) => `${amount.toLocaleString()} đ`,
      sorter: (a, b) => a.waterFee - b.waterFee,
    },
    {
      title: "Service",
      dataIndex: "serviceFee",
      key: "serviceFee",
      render: (amount: number) => `${amount.toLocaleString()} đ`,
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
      dataIndex: "paid",
      key: "paid",
      render: (paid: boolean) => (
        <Tag color={paid ? "green" : "orange"}>
          {paid ? "Paid" : "Pending"}
        </Tag>
      ),
      filters: [
        { text: "Paid", value: true },
        { text: "Pending", value: false },
      ],
      onFilter: (value, record) => record.paid === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
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
          {!record.paid && (
            <Tooltip title="Pay Now">
              <Button
                type="primary"
                size="small"
                icon={<CreditCardOutlined />}
                onClick={() => handlePayment(record)}
              >
                Pay
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Bills Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Pending Bills"
            value={pendingBills}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Unpaid Amount"
            value={unpaidAmount}
            valueStyle={{ color: '#cf1322' }}
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
              style={{ width: 150 }}
              allowClear
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value={true}>
                <Tag color="green">Paid</Tag>
              </Select.Option>
              <Select.Option value={false}>
                <Tag color="orange">Pending</Tag>
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
            pageSizeOptions: ['5', '10', '20', '50'],
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

      {/* Payment Instructions */}
      <Card title="Payment Information" className="shadow-sm">
        <div className="space-y-2">
          <p><strong>Payment Methods:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Online payment via VNPay, MoMo, ZaloPay</li>
            <li>Bank transfer to landlord's account</li>
            <li>Cash payment (contact landlord)</li>
          </ul>
          <p className="text-sm text-gray-600 mt-4">
            <strong>Note:</strong> Please pay your bills before the due date to avoid late fees.
            Contact your landlord if you have any payment issues.
          </p>
        </div>
      </Card>
    </div>
  );
}
