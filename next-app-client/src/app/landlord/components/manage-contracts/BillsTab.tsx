import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  message,
  Tooltip,
  Popconfirm,
  DatePicker,
  Form,
  Space,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ContractData, BillData } from "@/types/types";
import { ContractService } from "@/services/ContractService";
import { BillService } from "@/services/BillService";
import BillDetailModal from "./BillDetailModal";

interface BillsTabProps {
  contract: ContractData;
  onContractUpdate: (contract: ContractData) => void;
}

const billStatusMap = {
  1: { text: "PAID", color: "green" },
  0: { text: "UNPAID", color: "red" },
};

export default function BillsTab({ contract, onContractUpdate }: BillsTabProps) {
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);
  const [editBill, setEditBill] = useState<BillData | null>(null);
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportForm] = Form.useForm();

  const [editForm, setEditForm] = useState({
    month: "",
    electricityFee: 0,
    waterFee: 0,
    serviceFee: 0,
    totalAmount: 0,
    paid: false,
  });
  const [addForm, setAddForm] = useState({
    month: "",
    electricityFee: 0,
    waterFee: 0,
    serviceFee: 0,
    totalAmount: 0,
    paid: false,
  });

  React.useEffect(() => {
    if (editBill) {
      setEditForm({
        month: editBill.month,
        electricityFee: editBill.electricityFee,
        waterFee: editBill.waterFee,
        serviceFee: editBill.serviceFee,
        totalAmount: editBill.totalAmount,
        paid: editBill.paid,
      });
    }
  }, [editBill]);

  const handleEditBillSubmit = async () => {
    if (!editBill || !contract) return;
    try {
      setLoading(true);
      await BillService.updateBill(contract.id, editBill.id, editForm);
      message.success("Bill updated!");
      setEditBill(null);
      const data = await ContractService.getById(contract.id);
      onContractUpdate(data);
    } catch (err) {
      message.error("Update bill failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBillSubmit = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      await BillService.createBill(contract.id, addForm);
      message.success("Bill added!");
      setAddBillOpen(false);
      setAddForm({ month: "", electricityFee: 0, waterFee: 0, serviceFee: 0, totalAmount: 0, paid: false });
      const data = await ContractService.getById(contract.id);
      onContractUpdate(data);
    } catch (err) {
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
    } catch (err) {
      message.error("Delete bill failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (values: { fromMonth: any; toMonth: any }) => {
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
      render: (v: number) => v?.toLocaleString() + "đ",
      sorter: (a: BillData, b: BillData) => (a.electricityFee || 0) - (b.electricityFee || 0),
    },
    {
      title: "Water",
      dataIndex: "waterFee",
      key: "waterFee",
      render: (v: number) => v?.toLocaleString() + "đ",
      sorter: (a: BillData, b: BillData) => (a.waterFee || 0) - (b.waterFee || 0),
    },
    {
      title: "Service",
      dataIndex: "serviceFee",
      key: "serviceFee",
      render: (v: number) => v?.toLocaleString() + "đ",
      sorter: (a: BillData, b: BillData) => (a.serviceFee || 0) - (b.serviceFee || 0),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v: number) => v?.toLocaleString() + "đ",
      sorter: (a: BillData, b: BillData) => (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: "Status",
      dataIndex: "paid",
      key: "paid",
      render: (paid: boolean) => (
        <Tag color={billStatusMap[paid ? "1" : "0"].color}>
          {billStatusMap[paid ? "1" : "0"].text}
        </Tag>
      ),
      sorter: (a: BillData, b: BillData) => Number(a.paid) - Number(b.paid),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: BillData) => (
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
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this bill?"
              onConfirm={() => handleDeleteBill(record.id)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Bills Management</h3>
        <Space>
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
      </div>
      
      <Table
        columns={billColumns}
        dataSource={contract.bills || []}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ y: 400 }}
        loading={loading}
      />

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
        destroyOnClose
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
              <label className="block font-medium">Month</label>
              <input
                type="text"
                className="border rounded px-2 py-1 w-full"
                value={editForm.month}
                onChange={e => setEditForm(f => ({ ...f, month: e.target.value }))}
              />
            </div>
            <div>
              <label className="block font-medium">Electricity</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={editForm.electricityFee}
                onChange={e => setEditForm(f => ({ ...f, electricityFee: Number(e.target.value), totalAmount: Number(e.target.value) + f.waterFee + f.serviceFee }))}
              />
            </div>
            <div>
              <label className="block font-medium">Water</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={editForm.waterFee}
                onChange={e => setEditForm(f => ({ ...f, waterFee: Number(e.target.value), totalAmount: f.electricityFee + Number(e.target.value) + f.serviceFee }))}
              />
            </div>
            <div>
              <label className="block font-medium">Service</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={editForm.serviceFee}
                onChange={e => setEditForm(f => ({ ...f, serviceFee: Number(e.target.value), totalAmount: f.electricityFee + f.waterFee + Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block font-medium">Total</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full bg-gray-100"
                value={editForm.totalAmount}
                readOnly
              />
            </div>
            <div>
              <label className="block font-medium">Paid</label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={editForm.paid ? "1" : "0"}
                onChange={e => setEditForm(f => ({ ...f, paid: e.target.value === "1" }))}
              >
                <option value="1">PAID</option>
                <option value="0">UNPAID</option>
              </select>
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
            <label className="block font-medium">Month</label>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
              value={addForm.month}
              onChange={e => setAddForm(f => ({ ...f, month: e.target.value }))}
            />
          </div>
          <div>
            <label className="block font-medium">Electricity</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={addForm.electricityFee}
              onChange={e => setAddForm(f => ({ ...f, electricityFee: Number(e.target.value), totalAmount: Number(e.target.value) + f.waterFee + f.serviceFee }))}
            />
          </div>
          <div>
            <label className="block font-medium">Water</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={addForm.waterFee}
              onChange={e => setAddForm(f => ({ ...f, waterFee: Number(e.target.value), totalAmount: f.electricityFee + Number(e.target.value) + f.serviceFee }))}
            />
          </div>
          <div>
            <label className="block font-medium">Service</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={addForm.serviceFee}
              onChange={e => setAddForm(f => ({ ...f, serviceFee: Number(e.target.value), totalAmount: f.electricityFee + f.waterFee + Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block font-medium">Total</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full bg-gray-100"
              value={addForm.totalAmount}
              readOnly
            />
          </div>
          <div>
            <label className="block font-medium">Paid</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={addForm.paid ? "1" : "0"}
              onChange={e => setAddForm(f => ({ ...f, paid: e.target.value === "1" }))}
            >
              <option value="1">PAID</option>
              <option value="0">UNPAID</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
