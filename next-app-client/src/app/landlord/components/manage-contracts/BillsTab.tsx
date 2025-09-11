import React, { useState } from "react";
import type { Key } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Tooltip,
  Popconfirm,
  DatePicker,
  Form,
  Space,
  Input,
  Select,
  Card,
  Statistic,
  App,
} from "antd";
import type { ColumnType } from 'antd/es/table';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ContractData, BillData } from "@/types/types";
import { ContractService } from "@/services/ContractService";
import { BillService } from "@/services/BillService";
import { getRoomById } from "@/services/RoomService";
import BillDetailModal from "./BillDetailModal";

interface BillsTabProps {
  contract: ContractData;
  onContractUpdate: (contract: ContractData) => void;
}

const billStatusMap: Record<string, { text: string; color: string }> = {
  PENDING: { text: "Pending", color: "orange" },
  CONFIRMING: { text: "Confirming Payment", color: "blue" },
  PAID: { text: "Paid", color: "green" },
  OVERDUE: { text: "Overdue", color: "red" },
};

export default function BillsTab({ contract, onContractUpdate }: BillsTabProps) {
  const { message } = App.useApp();
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);
  const [editBill, setEditBill] = useState<BillData | null>(null);
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<{
    elecPrice?: number;
    waterPrice?: number;
    priceMonth?: number;
  } | null>(null);

  const [editForm, setEditForm] = useState({
    month: "",
    electricityUsage: 0,
    waterUsage: 0,
    damageFee: 0,
    electricityFee: 0,
    waterFee: 0,
    serviceFee: 0,
    totalAmount: 0,
  });
  const [addForm, setAddForm] = useState({
    month: "",
    electricityUsage: 0,
    waterUsage: 0,
    damageFee: 0,
    electricityFee: 0,
    waterFee: 0,
    serviceFee: 0,
    totalAmount: 0,
  });

  // Fetch room data to get electricity and water prices
  React.useEffect(() => {
    const fetchRoomData = async () => {
      if (contract.roomId) {
        try {
          const room = await getRoomById(contract.roomId);
          setRoomData(room);
        } catch (error) {
          console.error("Failed to fetch room data:", error);
        }
      }
    };
    fetchRoomData();
  }, [contract.roomId]);

  // Update addForm serviceFee when roomData changes
  React.useEffect(() => {
    if (roomData?.priceMonth) {
      setAddForm(prev => ({
        ...prev,
        serviceFee: roomData.priceMonth || 0,
        totalAmount: prev.electricityFee + prev.waterFee + (roomData.priceMonth || 0) + prev.damageFee
      }));
    }
  }, [roomData]);

  // Calculate fees when usage changes
  const calculateFees = (electricityUsage: number, waterUsage: number, damageFee: number = 0) => {
    if (!roomData) return { electricityFee: 0, waterFee: 0, serviceFee: 0, totalAmount: damageFee };
    
    const electricityFee = electricityUsage * (roomData.elecPrice || 0);
    const waterFee = waterUsage * (roomData.waterPrice || 0);
    const serviceFee = roomData.priceMonth || 0; // Service fee from room priceMonth
    const totalAmount = electricityFee + waterFee + serviceFee + damageFee;
    
    return { electricityFee, waterFee, serviceFee, totalAmount };
  };

  React.useEffect(() => {
    if (editBill) {
      // Calculate reverse usage from fees if possible
      const electricityUsage = roomData?.elecPrice ? (editBill.electricityFee / roomData.elecPrice) : 0;
      const waterUsage = roomData?.waterPrice ? (editBill.waterFee / roomData.waterPrice) : 0;
      
      setEditForm({
        month: editBill.month,
        electricityUsage: electricityUsage,
        waterUsage: waterUsage,
        damageFee: editBill.damageFee || 0,
        electricityFee: editBill.electricityFee,
        waterFee: editBill.waterFee,
        serviceFee: roomData?.priceMonth || editBill.serviceFee,
        totalAmount: editBill.totalAmount,
      });
    }
  }, [editBill, roomData]);

  const handleEditBillSubmit = async () => {
    if (!editBill || !contract) return;
    try {
      setLoading(true);
      // Send usage, prices, and calculated fees to backend
      const billData = {
        month: editForm.month,
        electricityFee: editForm.electricityFee,
        waterFee: editForm.waterFee,
        serviceFee: editForm.serviceFee,
        damageFee: editForm.damageFee,
        totalAmount: editForm.totalAmount,
        // Include usage and price data
        electricityUsage: editForm.electricityUsage,
        waterUsage: editForm.waterUsage,
        electricityPrice: roomData?.elecPrice,
        waterPrice: roomData?.waterPrice,
      };
      await BillService.updateBill(contract.id, editBill.id, billData);
      message.success("Bill updated!");
      setEditBill(null);
      const data = await ContractService.getById(contract.id);
      onContractUpdate(data);
    } catch (_) {
      message.error("Update bill failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBillSubmit = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      // Send usage, prices, and calculated fees to backend
      const billData = {
        month: addForm.month,
        electricityFee: addForm.electricityFee,
        waterFee: addForm.waterFee,
        serviceFee: addForm.serviceFee,
        damageFee: addForm.damageFee,
        totalAmount: addForm.totalAmount,
        // Include usage and price data
        electricityUsage: addForm.electricityUsage,
        waterUsage: addForm.waterUsage,
        electricityPrice: roomData?.elecPrice,
        waterPrice: roomData?.waterPrice,
      };
      await BillService.createBill(contract.id, billData);
      message.success("Bill added!");
      setAddBillOpen(false);
      setAddForm({ 
        month: "", 
        electricityUsage: 0, 
        waterUsage: 0, 
        damageFee: 0, 
        electricityFee: 0, 
        waterFee: 0, 
        serviceFee: roomData?.priceMonth || 0, 
        totalAmount: roomData?.priceMonth || 0 
      });
      const data = await ContractService.getById(contract.id);
      onContractUpdate(data);
    } catch (_) {
      message.error("Add bill failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!contract) return;
    try {
      setLoading(true);
      await BillService.deleteBill(contract.id, billId);
      message.success("Bill deleted!");
      const data = await ContractService.getById(contract.id);
      onContractUpdate(data);
    } catch (_) {
      message.error("Delete bill failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (bill: BillData) => {
    if (!contract) return;
    try {
      setLoading(true);
      // Update bill status to PAID
      await BillService.updateBillStatus(contract.id, bill.id, "PAID");
      message.success("Payment confirmed successfully!");
      // Reload contract data to get updated bills
      const data = await ContractService.getById(contract.id);
      onContractUpdate(data);
    } catch (err) {
      console.error("Confirm payment failed:", err);
      message.error("Failed to confirm payment!");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (values: { fromMonth: dayjs.Dayjs; toMonth: dayjs.Dayjs }) => {
    if (!contract) return;
    
    try {
      setExportLoading(true);
      const fromMonth = values.fromMonth.format('YYYY-MM');
      const toMonth = values.toMonth.format('YYYY-MM');
      
      if (dayjs(fromMonth).isAfter(dayjs(toMonth))) {
        message.error("From month cannot be later than to month!");
        return;
      }
      
      const blob = await ContractService.exportBills(contract.id, fromMonth, toMonth);
      const toMonthReverse = values.toMonth.format('MM-YYYY');
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bills_${contract.contractName}_to_${toMonthReverse}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      message.success("Bills exported successfully!");
      setExportModalOpen(false);
      exportForm.resetFields();
    } catch (error) {
      console.error("Export failed:", error);
      message.error("Failed to export bills. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const billColumns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: (month: string) => <span style={{ color: 'red', fontWeight: 500 }}>{month}</span>,
      sorter: (a: BillData, b: BillData) => a.month.localeCompare(b.month),
    },
    {
      title: "Electricity",
      dataIndex: "electricityFee",
      key: "electricityFee",
      align: "right" as const,
      render: (v: number, record: BillData) => (
        <div>
          <div className="font-medium">{v?.toLocaleString()}đ</div>
          {record.electricityUsage && record.electricityPrice && (
            <div className="text-xs text-gray-500">
              {record.electricityUsage.toFixed(2)} kWh × {record.electricityPrice.toLocaleString()}đ/kWh
            </div>
          )}
        </div>
      ),
      sorter: (a: BillData, b: BillData) => (a.electricityFee || 0) - (b.electricityFee || 0),
    },
    {
      title: "Water",
      dataIndex: "waterFee",
      key: "waterFee",
      align: "right" as const,
      render: (v: number, record: BillData) => (
        <div>
          <div className="font-medium">{v?.toLocaleString()}đ</div>
          {record.waterUsage && record.waterPrice && (
            <div className="text-xs text-gray-500">
              {record.waterUsage.toFixed(2)} m³ × {record.waterPrice.toLocaleString()}đ/m³
            </div>
          )}
        </div>
      ),
      sorter: (a: BillData, b: BillData) => (a.waterFee || 0) - (b.waterFee || 0),
    },
    {
      title: "Service",
      dataIndex: "serviceFee",
      key: "serviceFee",
      align: "right" as const,
      render: (v: number, record: BillData) => (
        <div>
          <div className="font-medium">{v?.toLocaleString()}đ</div>
          {record.damageFee != null && record.damageFee > 0 && (
            <div className="text-xs text-red-500">
              + Damage Fee: {record.damageFee.toLocaleString()}đ
            </div>
          )}
        </div>
      ),
      sorter: (a: BillData, b: BillData) => (a.serviceFee || 0) - (b.serviceFee || 0),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right" as const,
      render: (v: number) => v?.toLocaleString() + "đ",
      sorter: (a: BillData, b: BillData) => (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: BillData) => {
        // Handle both new status field and old paid boolean
        let actualStatus;
        if (status) {
          actualStatus = status;
        } else if (record.paid === true) {
          actualStatus = "PAID";
        } else if (record.paid === false) {
          actualStatus = "PENDING";
        } else {
          actualStatus = "PENDING"; // Default
        }
        
        const statusInfo = billStatusMap[actualStatus] || billStatusMap["PENDING"];
        
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        );
      },
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Confirming Payment", value: "CONFIRMING" },
        { text: "Paid", value: "PAID" },
        { text: "Overdue", value: "OVERDUE" },
      ],
      onFilter: (value: boolean | Key, record: BillData): boolean => {
        const actualStatus = record.status || (record.paid === true ? "PAID" : "PENDING");
        return actualStatus === value;
      },
      sorter: (a: BillData, b: BillData) => {
        const statusA = a.status || (a.paid === true ? "PAID" : "PENDING");
        const statusB = b.status || (b.paid === true ? "PAID" : "PENDING");
        return statusA.localeCompare(statusB);
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: BillData) => {
        const actualStatus = record.status || (record.paid === true ? "PAID" : "PENDING");
        const isConfirming = actualStatus === "CONFIRMING";
        const isPaid = actualStatus === "PAID";
        
        return (
          <div className="flex gap-2">
            <Tooltip title="Details">
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => setSelectedBill(record)}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                onClick={() => setEditBill(record)}
                disabled={isPaid} // Can't edit paid bills
              />
            </Tooltip>
            {isConfirming && (
              <Tooltip title="Confirm payment received">
                <Popconfirm
                  title="Confirm Payment"
                  description="Have you received the payment for this bill?"
                  onConfirm={() => handleConfirmPayment(record)}
                  okText="Yes, Confirm"
                  cancelText="Not Yet"
                >
                  <Button type="primary" size="small">
                    Confirm
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this bill?"
                onConfirm={() => handleDeleteBill(record.id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <Button danger icon={<DeleteOutlined />} disabled={isPaid} />
              </Popconfirm>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // Filter bills based on search and status - similar to tenant
  const bills = contract.bills || [];
  
  // Process bills to ensure damageFee is calculated if not provided
  const processedBills = bills.map(bill => {
    // Get room price data for calculations
    const elecPrice = roomData?.elecPrice || bill.electricityPrice;
    const waterPrice = roomData?.waterPrice || bill.waterPrice;
    
    // Calculate usage from fees if not provided
    let electricityUsage = bill.electricityUsage;
    let waterUsage = bill.waterUsage;
    
    if (!electricityUsage && elecPrice && elecPrice > 0 && bill.electricityFee) {
      electricityUsage = bill.electricityFee / elecPrice;
    }
    
    if (!waterUsage && waterPrice && waterPrice > 0 && bill.waterFee) {
      waterUsage = bill.waterFee / waterPrice;
    }
    
    // Calculate damageFee if not provided
    let damageFee = bill.damageFee;
    if (damageFee === null || damageFee === undefined) {
      const baseTotal = (bill.electricityFee || 0) + (bill.waterFee || 0) + (bill.serviceFee || 0);
      const calculatedDamageFee = (bill.totalAmount || 0) - baseTotal;
      damageFee = calculatedDamageFee > 0 ? calculatedDamageFee : 0;
    }
    
    return {
      ...bill,
      damageFee,
      electricityUsage,
      waterUsage,
      electricityPrice: elecPrice,
      waterPrice: waterPrice
    };
  });
  
  const filteredBills = processedBills.filter((bill: BillData) => {
    const matchesSearch = 
      bill.month.toLowerCase().includes(searchText.toLowerCase()) ||
      bill.totalAmount.toString().includes(searchText);
    
    let matchesStatus = true;
    if (statusFilter !== null && statusFilter !== undefined) {
      const actualStatus = bill.status || (bill.paid === true ? "PAID" : "PENDING");
      matchesStatus = actualStatus === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Calculate bill statistics
  const totalBills = filteredBills.length;
  const paidBills = filteredBills.filter(bill => {
    const status = bill.status || (bill.paid === true ? "PAID" : "PENDING");
    return status === "PAID";
  }).length;
  const pendingBills = filteredBills.filter(bill => {
    const status = bill.status || (bill.paid === true ? "PAID" : "PENDING");
    return status === "PENDING";
  }).length;
  const confirmingBills = filteredBills.filter(bill => bill.status === "CONFIRMING").length;
  const unpaidAmount = filteredBills.filter(bill => {
    const status = bill.status || (bill.paid === true ? "PAID" : "PENDING");
    return status !== "PAID";
  }).reduce((sum, bill) => sum + bill.totalAmount, 0);

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-transparent transition-colors duration-300">
      {/* Bills Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card size="small" className="bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300">
          <Statistic
            title={<span className="text-gray-600 dark:text-gray-300">Total Bills</span>}
            value={totalBills}
            prefix={<DollarOutlined className="text-blue-600 dark:text-blue-400" />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card size="small" className="bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300">
          <Statistic
            title={<span className="text-gray-600 dark:text-gray-300">Paid Bills</span>}
            value={paidBills}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
        <Card size="small" className="bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300">
          <Statistic
            title={<span className="text-gray-600 dark:text-gray-300">Pending Bills</span>}
            value={pendingBills}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
        <Card size="small" className="bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300">
          <Statistic
            title={<span className="text-gray-600 dark:text-gray-300">Confirming</span>}
            value={confirmingBills}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card size="small" className="bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300">
          <Statistic
            title={<span className="text-gray-600 dark:text-gray-300">Unpaid Amount</span>}
            value={unpaidAmount}
            valueStyle={{ color: '#cf1322' }}
            suffix="đ"
          />
        </Card>
      </div>

      <Card 
        title={<span className="text-gray-900 dark:text-white">Bills Management</span>}
        className="shadow-sm bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300"
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
              <Select.Option value="PAID">
                <Tag color="green">Paid</Tag>
              </Select.Option>
              <Select.Option value="PENDING">
                <Tag color="orange">Pending</Tag>
              </Select.Option>
              <Select.Option value="CONFIRMING">
                <Tag color="blue">Confirming</Tag>
              </Select.Option>
              <Select.Option value="OVERDUE">
                <Tag color="red">Overdue</Tag>
              </Select.Option>
            </Select>
            <Button type="primary" onClick={() => setAddBillOpen(true)}>
              Add Bill
            </Button>
            <Button 
              type="default" 
              icon={<ExportOutlined />}
              onClick={() => setExportModalOpen(true)}
            >
              Export Bills
            </Button>
          </Space>
        }
      >
        <Table
          columns={billColumns}
          dataSource={filteredBills}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} bills`,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          scroll={{ y: 400 }}
          loading={loading}
          size="middle"
        />
      </Card>

      {/* Modal Bill Detail */}
      <BillDetailModal
        open={!!selectedBill}
        selectedBill={selectedBill}
        contract={contract}
        onClose={() => setSelectedBill(null)}
      />

      {/* Export Bills Modal */}
      <Modal
        title="Export Bills"
        open={exportModalOpen}
        onCancel={() => {
          setExportModalOpen(false);
          exportForm.resetFields();
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={exportForm}
          onFinish={handleExport}
          layout="vertical"
        >
          <Form.Item
            label="From Month"
            name="fromMonth"
            rules={[
              { required: true, message: 'Please select from month!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('toMonth')) {
                    return Promise.resolve();
                  }
                  if (value.isAfter(getFieldValue('toMonth'))) {
                    return Promise.reject(new Error('From month must be before to month!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker 
              picker="month" 
              placeholder="Select from month"
              style={{ width: '100%' }}
              format="YYYY-MM"
              onChange={() => {
                exportForm.validateFields(['toMonth']);
              }}
            />
          </Form.Item>
          
          <Form.Item
            label="To Month"
            name="toMonth"
            rules={[
              { required: true, message: 'Please select to month!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('fromMonth')) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(getFieldValue('fromMonth'))) {
                    return Promise.reject(new Error('To month must be after from month!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker 
              picker="month" 
              placeholder="Select to month"
              style={{ width: '100%' }}
              format="YYYY-MM"
              onChange={() => {
                exportForm.validateFields(['fromMonth']);
              }}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => {
                setExportModalOpen(false);
                exportForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={exportLoading}
                icon={<DownloadOutlined />}
              >
                Export
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Edit Bill */}
      <Modal
        open={!!editBill}
        title={editBill ? `Edit Bill - ${editBill.month}` : "Edit Bill"}
        onCancel={() => setEditBill(null)}
        onOk={handleEditBillSubmit}
        confirmLoading={loading}
      >
        {editBill && (
          <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleEditBillSubmit(); }}>
            <div>
              <label className="block font-medium dark:text-gray-300 transition-colors duration-300">Month</label>
              <DatePicker
                picker="month"
                placeholder="Select month"
                style={{ width: '100%' }}
                format="YYYY-MM"
                value={editForm.month ? dayjs(editForm.month) : null}
                onChange={(date) => setEditForm(f => ({ ...f, month: date ? date.format('YYYY-MM') : '' }))}
                className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
              />
            </div>
            <div>
              <label className="block font-medium dark:text-gray-300 transition-colors duration-300">
                Electricity Usage (kWh) - Price: {roomData?.elecPrice?.toLocaleString() || 0}đ/kWh
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="border rounded px-2 py-1 w-full dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
                value={editForm.electricityUsage}
                onChange={e => {
                  const usage = Number(e.target.value);
                  if (usage < 0) return; // Validation: không cho phép số âm
                  const calculated = calculateFees(usage, editForm.waterUsage, editForm.damageFee);
                  setEditForm(f => ({ ...f, electricityUsage: usage, ...calculated }));
                }}
              />
            </div>
            <div>
              <label className="block font-medium dark:text-gray-300 transition-colors duration-300">
                Water Usage (m³) - Price: {roomData?.waterPrice?.toLocaleString() || 0}đ/m³
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="border rounded px-2 py-1 w-full dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
                value={editForm.waterUsage}
                onChange={e => {
                  const usage = Number(e.target.value);
                  if (usage < 0) return; // Validation: không cho phép số âm
                  const calculated = calculateFees(editForm.electricityUsage, usage, editForm.damageFee);
                  setEditForm(f => ({ ...f, waterUsage: usage, ...calculated }));
                }}
              />
            </div>
            <div>
              <label className="block font-medium dark:text-gray-300 transition-colors duration-300">
                Service Fee: {roomData?.priceMonth?.toLocaleString() || 0}đ/month
              </label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full bg-gray-100 dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
                value={editForm.serviceFee}
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="block font-medium dark:text-gray-300 transition-colors duration-300">Damage Fee (đ)</label>
              <input
                type="number"
                min="0"
                className="border rounded px-2 py-1 w-full dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
                value={editForm.damageFee}
                onChange={e => {
                  const damageFee = Number(e.target.value);
                  if (damageFee < 0) return; // Validation: không cho phép số âm
                  const calculated = calculateFees(editForm.electricityUsage, editForm.waterUsage, damageFee);
                  setEditForm(f => ({ ...f, damageFee, ...calculated }));
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-medium dark:text-gray-300 transition-colors duration-300">Electricity Fee</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-full bg-gray-100 dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
                  value={editForm.electricityFee}
                  readOnly
                />
              </div>
              <div>
                <label className="block font-medium dark:text-gray-300 transition-colors duration-300">Water Fee</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-full bg-gray-100 dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
                  value={editForm.waterFee}
                  readOnly
                />
              </div>
              <div>
                <label className="block font-medium dark:text-gray-300 transition-colors duration-300">Total Amount</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-full bg-gray-100 dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
                  value={editForm.totalAmount}
                  readOnly
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Add Bill */}
      <Modal
        open={addBillOpen}
        title="Add Bill"
        onCancel={() => setAddBillOpen(false)}
        onOk={handleAddBillSubmit}
        confirmLoading={loading}
      >
        <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleAddBillSubmit(); }}>
          <div>
            <label className="block font-medium dark:text-gray-300 transition-colors duration-300">Month</label>
            <DatePicker
              picker="month"
              placeholder="Select month"
              style={{ width: '100%' }}
              format="YYYY-MM"
              value={addForm.month ? dayjs(addForm.month) : null}
              onChange={(date) => setAddForm(f => ({ ...f, month: date ? date.format('YYYY-MM') : '' }))}
              className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300 transition-colors duration-300">
              Electricity Usage (kWh) - Price: {roomData?.elecPrice?.toLocaleString() || 0}đ/kWh
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="border rounded px-2 py-1 w-full dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
              value={addForm.electricityUsage}
              onChange={e => {
                const usage = Number(e.target.value);
                if (usage < 0) return; // Validation: không cho phép số âm
                const calculated = calculateFees(usage, addForm.waterUsage, addForm.damageFee);
                setAddForm(f => ({ ...f, electricityUsage: usage, ...calculated }));
              }}
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300 transition-colors duration-300">
              Water Usage (m³) - Price: {roomData?.waterPrice?.toLocaleString() || 0}đ/m³
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="border rounded px-2 py-1 w-full dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
              value={addForm.waterUsage}
              onChange={e => {
                const usage = Number(e.target.value);
                if (usage < 0) return; // Validation: không cho phép số âm
                const calculated = calculateFees(addForm.electricityUsage, usage, addForm.damageFee);
                setAddForm(f => ({ ...f, waterUsage: usage, ...calculated }));
              }}
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300 transition-colors duration-300">
              Service Fee: {roomData?.priceMonth?.toLocaleString() || 0}đ/month
            </label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full bg-gray-100 dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
              value={addForm.serviceFee}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-300 transition-colors duration-300">Damage Fee (đ)</label>
            <input
              type="number"
              min="0"
              className="border rounded px-2 py-1 w-full dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
              value={addForm.damageFee}
              onChange={e => {
                const damageFee = Number(e.target.value);
                if (damageFee < 0) return; // Validation: không cho phép số âm
                const calculated = calculateFees(addForm.electricityUsage, addForm.waterUsage, damageFee);
                setAddForm(f => ({ ...f, damageFee, ...calculated }));
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-medium dark:text-gray-300 transition-colors duration-300">Electricity Fee</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full bg-gray-100 dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
                value={addForm.electricityFee}
                readOnly
              />
            </div>
            <div>
              <label className="block font-medium dark:text-gray-300 transition-colors duration-300">Water Fee</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full bg-gray-100 dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
                value={addForm.waterFee}
                readOnly
              />
            </div>
            <div>
              <label className="block font-medium dark:text-gray-300 transition-colors duration-300">Total Amount</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full bg-gray-100 dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
                value={addForm.totalAmount}
                readOnly
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
