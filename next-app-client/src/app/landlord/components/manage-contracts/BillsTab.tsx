/* eslint-disable @typescript-eslint/no-explicit-any */
import { BillService } from "@/services/BillService";
import { ContractService } from "@/services/ContractService";
import { getRoomById } from "@/services/RoomService";
import { URL_IMAGE } from "@/services/Constant";
import { BillData, ContractData } from "@/types/types";
import {
  DeleteOutlined,
  DollarOutlined,
  DownloadOutlined,
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import type { Key } from "react";
import React, { useState } from "react";
import BillDetailModal from "./BillDetailModal";
import { paymentNotification } from "@/services/NotificationService";

interface BillsTabProps {
  contract: ContractData;
  onContractUpdate: (contract: ContractData) => void;
  messageApi: any;
}

const billStatusMap: Record<string, { text: string; color: string }> = {
  PENDING: { text: "Pending", color: "orange" },
  CONFIRMING: { text: "Confirming Payment", color: "blue" },
  PAID: { text: "Paid", color: "green" },
  OVERDUE: { text: "Overdue", color: "red" },
};

export default function BillsTab({
  contract,
  onContractUpdate,
  messageApi,
}: BillsTabProps) {
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);
  const [editBill, setEditBill] = useState<BillData | null>(null);
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [exportForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<{
    elecPrice?: number;
    waterPrice?: number;
    priceMonth?: number;
    imageProof?: string;
  } | null>(null);

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

  // Periodically refresh contract data to get updated bill information
  React.useEffect(() => {
    const refreshContract = async () => {
      try {
        const updatedContract = await ContractService.getById(contract.id);
        onContractUpdate(updatedContract);
      } catch (error) {
        console.error("Failed to refresh contract data:", error);
      }
    };

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(refreshContract, 30000);

    // Also refresh when the component mounts or refreshKey changes
    if (refreshKey > 0) {
      refreshContract();
    }

    return () => clearInterval(interval);
  }, [contract.id, onContractUpdate, refreshKey]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      setLoading(true);
      const updatedContract = await ContractService.getById(contract.id);
      onContractUpdate(updatedContract);
      messageApi.success("Bill data refreshed!");
    } catch (error) {
      console.error("Failed to refresh contract data:", error);
      messageApi.error("Failed to refresh bill data");
    } finally {
      setLoading(false);
    }
  };

  // Update addForm serviceFee when roomData changes
  React.useEffect(() => {
    if (roomData?.priceMonth && addBillOpen) {
      const currentValues = addForm.getFieldsValue();
      const electricityFee =
        (currentValues.electricityUsage || 0) * (roomData.elecPrice || 0);
      const waterFee =
        (currentValues.waterUsage || 0) * (roomData.waterPrice || 0);
      const damageFee = currentValues.damageFee || 0;
      const totalAmount =
        electricityFee + waterFee + roomData.priceMonth + damageFee;

      addForm.setFieldsValue({
        serviceFee: roomData.priceMonth,
        electricityFee,
        waterFee,
        totalAmount,
        imageProof: roomData.imageProof || "",
      });
    }
  }, [roomData, addForm, addBillOpen]);

  // Calculate fees when usage changes
  const calculateFees = (
    electricityUsage: number,
    waterUsage: number,
    damageFee: number = 0
  ) => {
    if (!roomData)
      return {
        electricityFee: 0,
        waterFee: 0,
        serviceFee: 0,
        totalAmount: damageFee,
      };

    const electricityFee = electricityUsage * (roomData.elecPrice || 0);
    const waterFee = waterUsage * (roomData.waterPrice || 0);
    const serviceFee = roomData.priceMonth || 0; // Service fee from room priceMonth
    const totalAmount = electricityFee + waterFee + serviceFee + damageFee;

    return { electricityFee, waterFee, serviceFee, totalAmount };
  };

  // Initialize add form with default values when room data is loaded
  React.useEffect(() => {
    if (roomData && addBillOpen) {
      addForm.setFieldsValue({
        month: null,
        electricityUsage: 0,
        waterUsage: 0,
        damageFee: 0,
        note: "",
        electricityFee: 0,
        waterFee: 0,
        serviceFee: roomData.priceMonth || 0,
        totalAmount: roomData.priceMonth || 0,
        imageProof: roomData.imageProof || "",
      });
    }
  }, [roomData, addForm, addBillOpen]);

  React.useEffect(() => {
    if (editBill && roomData && !!editBill) {
      // Calculate reverse usage from fees if possible
      const electricityUsage = roomData?.elecPrice
        ? editBill.electricityFee / roomData.elecPrice
        : 0;
      const waterUsage = roomData?.waterPrice
        ? editBill.waterFee / roomData.waterPrice
        : 0;

      editForm.setFieldsValue({
        month: editBill.month ? dayjs(editBill.month) : null,
        electricityUsage: electricityUsage,
        waterUsage: waterUsage,
        damageFee: editBill.damageFee || 0,
        note: editBill.note || "",
        electricityFee: editBill.electricityFee,
        waterFee: editBill.waterFee,
        serviceFee: roomData?.priceMonth || editBill.serviceFee,
        totalAmount: editBill.totalAmount,
      });
    }
  }, [editBill, roomData, editForm]);

  const handleEditBillSubmit = async () => {
    if (!editBill || !contract) return;
    try {
      setLoading(true);
      const values = editForm.getFieldsValue();
      // Send usage, prices, and calculated fees to backend
      const billData = {
        month: values.month?.format("YYYY-MM"),
        electricityFee: values.electricityFee,
        waterFee: values.waterFee,
        serviceFee: values.serviceFee,
        damageFee: values.damageFee,
        note: values.note || null,
        totalAmount: values.totalAmount,
        // Include usage and price data
        electricityUsage: values.electricityUsage,
        waterUsage: values.waterUsage,
        electricityPrice: roomData?.elecPrice,
        waterPrice: roomData?.waterPrice,
      };
      await BillService.updateBill(contract.id, editBill.id, billData);
      messageApi.success("Bill updated!");
      setEditBill(null);
      editForm.resetFields();
      const data = await ContractService.getById(contract.id);
      onContractUpdate(data);
    } catch (_) {
      messageApi.error("Update bill failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBillSubmit = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const values = addForm.getFieldsValue();
      // Send usage, prices, and calculated fees to backend
      const billData = {
        month: values.month?.format("YYYY-MM"),
        electricityFee: values.electricityFee,
        waterFee: values.waterFee,
        serviceFee: values.serviceFee,
        damageFee: values.damageFee,
        note: values.note || null,
        totalAmount: values.totalAmount,
        // Include usage and price data
        electricityUsage: values.electricityUsage,
        waterUsage: values.waterUsage,
        electricityPrice: roomData?.elecPrice,
        waterPrice: roomData?.waterPrice,
      };
      await BillService.createBill(contract.id, billData);
      await paymentNotification(
        contract.landlordId,
        contract.tenantId,
        contract.id,
        "New bill added to your contract. Please check and make payment on time."
      );
      messageApi.success("Bill added!");
      setAddBillOpen(false);
      addForm.resetFields();
      // Reset form with default values
      addForm.setFieldsValue({
        month: null,
        electricityUsage: 0,
        waterUsage: 0,
        damageFee: 0,
        note: "",
        electricityFee: 0,
        waterFee: 0,
        serviceFee: roomData?.priceMonth || 0,
        totalAmount: roomData?.priceMonth || 0,
      });
      const data = await ContractService.getById(contract.id);
      onContractUpdate(data);
    } catch (_) {
      messageApi.error("Add bill failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!contract) return;
    try {
      setLoading(true);
      await BillService.deleteBill(contract.id, billId);
      messageApi.success("Bill deleted!");
      const data = await ContractService.getById(contract.id);
      onContractUpdate(data);
    } catch (_) {
      messageApi.error("Delete bill failed!");
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
      messageApi.success("Payment confirmed successfully!");
      // Reload contract data to get updated bills
      const data = await ContractService.getById(contract.id);
      onContractUpdate(data);
    } catch (err) {
      console.error("Confirm payment failed:", err);
      messageApi.error("Failed to confirm payment!");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (values: {
    fromMonth: dayjs.Dayjs;
    toMonth: dayjs.Dayjs;
  }) => {
    if (!contract) return;

    try {
      setExportLoading(true);
      const fromMonth = values.fromMonth.format("YYYY-MM");
      const toMonth = values.toMonth.format("YYYY-MM");

      if (dayjs(fromMonth).isAfter(dayjs(toMonth))) {
        messageApi.error("From month cannot be later than to month!");
        return;
      }

      const blob = await ContractService.exportBills(
        contract.id,
        fromMonth,
        toMonth
      );
      const toMonthReverse = values.toMonth.format("MM-YYYY");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bills_${contract.contractName}_to_${toMonthReverse}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      messageApi.success("Bills exported successfully!");
      setExportModalOpen(false);
      exportForm.resetFields();
    } catch (error) {
      console.error("Export failed:", error);
      messageApi.error("Failed to export bills. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const handleImageModalClose = () => {
    setImageModalOpen(false);
    setSelectedImage("");
  };

  const billColumns = [
    {
      title: "Month",
      dataIndex: "month",
      width: "90px",
      key: "month",
      render: (month: string) => (
        <span style={{ color: "red", fontWeight: 500 }}>{month}</span>
      ),
      sorter: (a: BillData, b: BillData) => a.month.localeCompare(b.month),
    },
    {
      title: "Electricity",
      dataIndex: "electricityFee",
      key: "electricityFee",
      align: "right" as const,
      render: (v: number, record: BillData) => (
        <div>
          <div className="font-medium">{v?.toLocaleString("vi-VN")}đ</div>
          {record.electricityUsage && record.electricityPrice && (
            <div className="text-xs text-gray-500">
              {record.electricityUsage.toFixed(2)} kWh ×{" "}
              {record.electricityPrice.toLocaleString("vi-VN")}đ/kWh
            </div>
          )}
        </div>
      ),
      sorter: (a: BillData, b: BillData) =>
        (a.electricityFee || 0) - (b.electricityFee || 0),
    },
    {
      title: "Water",
      dataIndex: "waterFee",
      key: "waterFee",
      align: "right" as const,
      render: (v: number, record: BillData) => (
        <div>
          <div className="font-medium">{v?.toLocaleString("vi-VN")}đ</div>
          {record.waterUsage && record.waterPrice && (
            <div className="text-xs text-gray-500">
              {record.waterUsage.toFixed(2)} m³ ×{" "}
              {record.waterPrice.toLocaleString("vi-VN")}đ/m³
            </div>
          )}
        </div>
      ),
      sorter: (a: BillData, b: BillData) =>
        (a.waterFee || 0) - (b.waterFee || 0),
    },
    {
      title: "Service",
      dataIndex: "serviceFee",
      key: "serviceFee",
      align: "right" as const,
      render: (v: number, record: BillData) => (
        <div>
          <div className="font-medium">{v?.toLocaleString("vi-VN")}đ</div>
          {record.damageFee != null && record.damageFee > 0 && (
            <div className="text-xs text-red-500">
              + Other Fee: {record.damageFee.toLocaleString("vi-VN")}đ
              {record.note && (
                <div className="text-xs text-gray-500 italic">
                  ({record.note})
                </div>
              )}
            </div>
          )}
        </div>
      ),
      sorter: (a: BillData, b: BillData) =>
        (a.serviceFee || 0) - (b.serviceFee || 0),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: "130px",
      align: "right" as const,
      render: (v: number) => v?.toLocaleString("vi-VN") + "đ",
      sorter: (a: BillData, b: BillData) =>
        (a.totalAmount || 0) - (b.totalAmount || 0),
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

        const statusInfo =
          billStatusMap[actualStatus] || billStatusMap["PENDING"];

        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Confirming Payment", value: "CONFIRMING" },
        { text: "Paid", value: "PAID" },
        { text: "Overdue", value: "OVERDUE" },
      ],
      onFilter: (value: boolean | Key, record: BillData): boolean => {
        const actualStatus =
          record.status || (record.paid === true ? "PAID" : "PENDING");
        return actualStatus === value;
      },
      sorter: (a: BillData, b: BillData) => {
        const statusA = a.status || (a.paid === true ? "PAID" : "PENDING");
        const statusB = b.status || (b.paid === true ? "PAID" : "PENDING");
        return statusA.localeCompare(statusB);
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
            onClick={() => handleImageClick(`${URL_IMAGE}${text}`)}
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
      title: "Action",
      key: "action",
      render: (_: unknown, record: BillData) => {
        const actualStatus =
          record.status || (record.paid === true ? "PAID" : "PENDING");
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
  const processedBills = bills.map((bill) => {
    // Get room price data for calculations
    const elecPrice = roomData?.elecPrice || bill.electricityPrice;
    const waterPrice = roomData?.waterPrice || bill.waterPrice;

    // Calculate usage from fees if not provided
    let electricityUsage = bill.electricityUsage;
    let waterUsage = bill.waterUsage;

    if (
      !electricityUsage &&
      elecPrice &&
      elecPrice > 0 &&
      bill.electricityFee
    ) {
      electricityUsage = bill.electricityFee / elecPrice;
    }

    if (!waterUsage && waterPrice && waterPrice > 0 && bill.waterFee) {
      waterUsage = bill.waterFee / waterPrice;
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
      electricityPrice: elecPrice,
      waterPrice: waterPrice,
      note: bill.note,
    };
  });

  const filteredBills = processedBills.filter((bill: BillData) => {
    const matchesSearch =
      bill.month.toLowerCase().includes(searchText.toLowerCase()) ||
      bill.totalAmount.toString().includes(searchText);

    let matchesStatus = true;
    if (statusFilter !== null && statusFilter !== undefined) {
      const actualStatus =
        bill.status || (bill.paid === true ? "PAID" : "PENDING");
      matchesStatus = actualStatus === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate bill statistics
  const totalBills = filteredBills.length;
  const paidBills = filteredBills.filter((bill) => {
    const status = bill.status || (bill.paid === true ? "PAID" : "PENDING");
    return status === "PAID";
  }).length;
  const pendingBills = filteredBills.filter((bill) => {
    const status = bill.status || (bill.paid === true ? "PAID" : "PENDING");
    return status === "PENDING";
  }).length;
  const confirmingBills = filteredBills.filter(
    (bill) => bill.status === "CONFIRMING"
  ).length;
  const unpaidAmount = filteredBills
    .filter((bill) => {
      const status = bill.status || (bill.paid === true ? "PAID" : "PENDING");
      return status !== "PAID";
    })
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  return (
    <div className="p-6 space-y-6 transition-colors duration-300 bg-white dark:bg-transparent">
      {/* Bills Statistics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card
          size="small"
          className="bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300"
        >
          <Statistic
            title={
              <span className="text-gray-600 dark:text-gray-300">
                Total Bills
              </span>
            }
            value={totalBills}
            prefix={
              <DollarOutlined className="text-blue-600 dark:text-blue-400" />
            }
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
        <Card
          size="small"
          className="bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300"
        >
          <Statistic
            title={
              <span className="text-gray-600 dark:text-gray-300">
                Paid Bills
              </span>
            }
            value={paidBills}
            valueStyle={{ color: "#3f8600" }}
          />
        </Card>
        <Card
          size="small"
          className="bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300"
        >
          <Statistic
            title={
              <span className="text-gray-600 dark:text-gray-300">
                Pending Bills
              </span>
            }
            value={pendingBills}
            valueStyle={{ color: "#cf1322" }}
          />
        </Card>
        <Card
          size="small"
          className="bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300"
        >
          <Statistic
            title={
              <span className="text-gray-600 dark:text-gray-300">
                Confirming
              </span>
            }
            value={confirmingBills}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
        <Card
          size="small"
          className="bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300"
        >
          <Statistic
            title={
              <span className="text-gray-600 dark:text-gray-300">
                Unpaid Amount
              </span>
            }
            value={unpaidAmount}
            valueStyle={{ color: "#cf1322" }}
            suffix="đ"
          />
        </Card>
      </div>

      <Card
        title={
          <span className="text-gray-900 dark:text-white">
            Bills Management
          </span>
        }
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
            <Button
              icon={<ReloadOutlined />}
              onClick={handleManualRefresh}
              loading={loading}
              title="Refresh bill data"
            >
              Refresh
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setAddBillOpen(true);
                // Reset form and set default values
                addForm.resetFields();
                addForm.setFieldsValue({
                  month: null,
                  electricityUsage: 0,
                  waterUsage: 0,
                  damageFee: 0,
                  note: "",
                  electricityFee: 0,
                  waterFee: 0,
                  serviceFee: roomData?.priceMonth || 0,
                  totalAmount: roomData?.priceMonth || 0,
                });
              }}
            >
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
            pageSizeOptions: ["5", "10", "20", "50"],
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
        <Form form={exportForm} onFinish={handleExport} layout="vertical">
          <Form.Item
            label="From Month"
            name="fromMonth"
            rules={[
              { required: true, message: "Please select from month!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue("toMonth")) {
                    return Promise.resolve();
                  }
                  if (value.isAfter(getFieldValue("toMonth"))) {
                    return Promise.reject(
                      new Error("From month must be before to month!")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              picker="month"
              placeholder="Select from month"
              style={{ width: "100%" }}
              format="YYYY-MM"
              onChange={() => {
                exportForm.validateFields(["toMonth"]);
              }}
            />
          </Form.Item>

          <Form.Item
            label="To Month"
            name="toMonth"
            rules={[
              { required: true, message: "Please select to month!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue("fromMonth")) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(getFieldValue("fromMonth"))) {
                    return Promise.reject(
                      new Error("To month must be after from month!")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              picker="month"
              placeholder="Select to month"
              style={{ width: "100%" }}
              format="YYYY-MM"
              onChange={() => {
                exportForm.validateFields(["fromMonth"]);
              }}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button
                onClick={() => {
                  setExportModalOpen(false);
                  exportForm.resetFields();
                }}
              >
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
        onCancel={() => {
          setEditBill(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        confirmLoading={loading}
      >
        {editBill && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditBillSubmit}
            onValuesChange={(changedValues, allValues) => {
              if (
                "electricityUsage" in changedValues ||
                "waterUsage" in changedValues ||
                "damageFee" in changedValues
              ) {
                const {
                  electricityUsage = 0,
                  waterUsage = 0,
                  damageFee = 0,
                } = allValues;
                const calculated = calculateFees(
                  electricityUsage,
                  waterUsage,
                  damageFee
                );
                editForm.setFieldsValue(calculated);
              }
            }}
          >
            <Form.Item
              label="Month"
              name="month"
              rules={[{ required: true, message: "Please select month!" }]}
            >
              <DatePicker
                picker="month"
                placeholder="Select month"
                style={{ width: "100%" }}
                format="YYYY-MM"
                className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="transition-colors duration-300 dark:text-gray-300">
                  Electricity Usage (kWh) - Price:{" "}
                  {roomData?.elecPrice?.toLocaleString("vi-VN") || 0}đ/kWh
                </span>
              }
              name="electricityUsage"
              rules={[
                { required: true, message: "Please enter electricity usage!" },
              ]}
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="Enter electricity usage"
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value?.replace(/\$\s?|(\.)/g, "") as any}
                className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="transition-colors duration-300 dark:text-gray-300">
                  Water Usage (m³) - Price:{" "}
                  {roomData?.waterPrice?.toLocaleString("vi-VN") || 0}đ/m³
                </span>
              }
              name="waterUsage"
              rules={[{ required: true, message: "Please enter water usage!" }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="Enter water usage"
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value?.replace(/\$\s?|(\.)/g, "") as any}
                className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="transition-colors duration-300 dark:text-gray-300">
                  Service Fee:{" "}
                  {roomData?.priceMonth?.toLocaleString("vi-VN") || 0}
                  đ/month
                </span>
              }
              name="serviceFee"
            >
              <InputNumber
                style={{ width: "100%" }}
                disabled
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                className="dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="transition-colors duration-300 dark:text-gray-300">
                  Other Fees (đ)
                </span>
              }
              name="damageFee"
            >
              <InputNumber
                min={0}
                placeholder="Enter damage fee"
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value?.replace(/\$\s?|(\.)/g, "") as any}
                className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="transition-colors duration-300 dark:text-gray-300">
                  Other Fees Description
                </span>
              }
              name="note"
            >
              <Input.TextArea
                placeholder="Enter note for other fee (optional)"
                rows={2}
                maxLength={500}
                showCount
                className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
              />
            </Form.Item>

            <div className="grid grid-cols-3 gap-2">
              <Form.Item
                label={
                  <span className="transition-colors duration-300 dark:text-gray-300">
                    Electricity Fee
                  </span>
                }
                name="electricityFee"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                  className="dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="transition-colors duration-300 dark:text-gray-300">
                    Water Fee
                  </span>
                }
                name="waterFee"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                  className="dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="transition-colors duration-300 dark:text-gray-300">
                    Total Amount
                  </span>
                }
                name="totalAmount"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                  className="dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
                />
              </Form.Item>
            </div>
          </Form>
        )}
      </Modal>
      {/* Modal Add Bill */}
      <Modal
        open={addBillOpen}
        title="Add Bill"
        onCancel={() => {
          setAddBillOpen(false);
          addForm.resetFields();
        }}
        onOk={() => addForm.submit()}
        confirmLoading={loading}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddBillSubmit}
          onValuesChange={(changedValues, allValues) => {
            if (
              "electricityUsage" in changedValues ||
              "waterUsage" in changedValues ||
              "damageFee" in changedValues
            ) {
              const {
                electricityUsage = 0,
                waterUsage = 0,
                damageFee = 0,
              } = allValues;
              const calculated = calculateFees(
                electricityUsage,
                waterUsage,
                damageFee
              );
              addForm.setFieldsValue(calculated);
            }
          }}
        >
          <Form.Item
            label="Month"
            name="month"
            rules={[{ required: true, message: "Please select month!" }]}
          >
            <DatePicker
              picker="month"
              placeholder="Select month"
              style={{ width: "100%" }}
              format="YYYY-MM"
              className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="transition-colors duration-300 dark:text-gray-300">
                Electricity Usage (kWh) - Price:{" "}
                {roomData?.elecPrice?.toLocaleString("vi-VN") || 0}đ/kWh
              </span>
            }
            name="electricityUsage"
            rules={[
              { required: true, message: "Please enter electricity usage!" },
            ]}
          >
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Enter electricity usage"
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => value?.replace(/\$\s?|(\.)/g, "") as any}
              className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="transition-colors duration-300 dark:text-gray-300">
                Water Usage (m³) - Price:{" "}
                {roomData?.waterPrice?.toLocaleString("vi-VN") || 0}đ/m³
              </span>
            }
            name="waterUsage"
            rules={[{ required: true, message: "Please enter water usage!" }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Enter water usage"
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => value?.replace(/\$\s?|(\.)/g, "") as any}
              className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="transition-colors duration-300 dark:text-gray-300">
                Service Fee:{" "}
                {roomData?.priceMonth?.toLocaleString("vi-VN") || 0}
                đ/month
              </span>
            }
            name="serviceFee"
          >
            <InputNumber
              style={{ width: "100%" }}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              className="dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="transition-colors duration-300 dark:text-gray-300">
                Other Fees (đ)
              </span>
            }
            name="damageFee"
          >
            <InputNumber
              min={0}
              placeholder="Enter other fees"
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => value?.replace(/\$\s?|(\.)/g, "") as any}
              className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="transition-colors duration-300 dark:text-gray-300">
                Other Fees Description
              </span>
            }
            name="note"
          >
            <Input.TextArea
              placeholder="Enter note for other fee (optional)"
              rows={2}
              maxLength={500}
              showCount
              className="dark:bg-[#17223b] dark:border-gray-600 dark:text-white transition-colors duration-300"
            />
          </Form.Item>

          <div className="grid grid-cols-3 gap-2">
            <Form.Item
              label={
                <span className="transition-colors duration-300 dark:text-gray-300">
                  Electricity Fee
                </span>
              }
              name="electricityFee"
            >
              <InputNumber
                style={{ width: "100%" }}
                disabled
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                className="dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="transition-colors duration-300 dark:text-gray-300">
                  Water Fee
                </span>
              }
              name="waterFee"
            >
              <InputNumber
                style={{ width: "100%" }}
                disabled
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                className="dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="transition-colors duration-300 dark:text-gray-300">
                  Total Amount
                </span>
              }
              name="totalAmount"
            >
              <InputNumber
                style={{ width: "100%" }}
                disabled
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                className="dark:bg-[#22304a] dark:border-gray-600 dark:text-white transition-colors duration-300"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Image Modal */}
      <Modal
        open={imageModalOpen}
        onCancel={handleImageModalClose}
        footer={null}
        centered
        width="auto"
        style={{ maxWidth: "90vw", maxHeight: "90vh" }}
        styles={{ body: { padding: 0 } }}
      >
        {selectedImage && (
          <div className="flex justify-center items-center">
            <Image
              src={selectedImage}
              alt="Payment Proof - Full Size"
              width={800}
              height={600}
              style={{
                maxWidth: "85vw",
                maxHeight: "85vh",
                objectFit: "contain",
                width: "auto",
                height: "auto",
              }}
              className="rounded"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
