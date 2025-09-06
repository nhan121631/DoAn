import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  message,
  Tooltip,
  Popconfirm,
  Card,
  Image,
  Tag,
  Space,
  Form,
  Input,
  DatePicker,
  Select,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ContractData, ResidentData } from "../../../../types/types";
import dayjs from "dayjs";

interface ResidentsTabProps {
  contract: ContractData;
  onContractUpdate: (contract: ContractData) => void;
}

const relationshipOptions = [
  { value: "Vợ/Chồng", label: "Vợ/Chồng" },
  { value: "Con", label: "Con" },
  { value: "Bố/Mẹ", label: "Bố/Mẹ" },
  { value: "Anh/Em", label: "Anh/Em" },
  { value: "Khác", label: "Khác" },
];

export default function ResidentsTab({ contract, onContractUpdate }: ResidentsTabProps) {
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [selectedResident, setSelectedResident] = useState<ResidentData | null>(null);
  const [editResident, setEditResident] = useState<ResidentData | null>(null);
  const [addResidentOpen, setAddResidentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockResidents: ResidentData[] = [
      {
        id: "090be935-1b89-4387-87a6-a71a5578b661",
        contractId: contract.id,
        fullName: "Nguyen Van A",
        idNumber: "012345678901",
        relationship: "Vợ/Chồng",
        startDate: "2025-09-01T00:00:00.000+00:00",
        endDate: "2025-12-31T00:00:00.000+00:00",
        note: "Đăng ký cho vợ ở cùng",
        idCardFrontUrl: "/dmvvs0ags/image/upload/v1756742930/wv0fj3lsryb6dmawdiqp.png",
        idCardBackUrl: "/dmvvs0ags/image/upload/v1756742933/roahnybbmlstrohpklpl.png"
      }
    ];
    setResidents(mockResidents);
  }, [contract.id]);

  const handleAddResident = async (values: any) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const newResident: ResidentData = {
        id: Date.now().toString(),
        contractId: contract.id,
        fullName: values.fullName,
        idNumber: values.idNumber,
        relationship: values.relationship,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        note: values.note || "",
        idCardFrontUrl: values.idCardFrontUrl || "",
        idCardBackUrl: values.idCardBackUrl || "",
      };
      
      setResidents(prev => [...prev, newResident]);
      message.success("Resident added successfully!");
      setAddResidentOpen(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to add resident!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditResident = async (values: any) => {
    if (!editResident) return;
    
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const updatedResident: ResidentData = {
        ...editResident,
        fullName: values.fullName,
        idNumber: values.idNumber,
        relationship: values.relationship,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        note: values.note || "",
      };
      
      setResidents(prev => prev.map(r => r.id === editResident.id ? updatedResident : r));
      message.success("Resident updated successfully!");
      setEditResident(null);
    } catch (error) {
      message.error("Failed to update resident!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResident = async (residentId: string) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      setResidents(prev => prev.filter(r => r.id !== residentId));
      message.success("Resident deleted successfully!");
    } catch (error) {
      message.error("Failed to delete resident!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: "ID Number",
      dataIndex: "idNumber",
      key: "idNumber",
    },
    {
      title: "Relationship",
      dataIndex: "relationship",
      key: "relationship",
      render: (relationship: string) => (
        <Tag color="blue">{relationship}</Tag>
      ),
    },
    {
      title: "Period",
      key: "period",
      render: (_: any, record: ResidentData) => (
        <div>
          <div>{new Date(record.startDate).toLocaleDateString()}</div>
          <div className="text-gray-500 text-sm">to {new Date(record.endDate).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: ResidentData) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => setSelectedResident(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditResident(record);
                form.setFieldsValue({
                  fullName: record.fullName,
                  idNumber: record.idNumber,
                  relationship: record.relationship,
                  startDate: dayjs(record.startDate),
                  endDate: dayjs(record.endDate),
                  note: record.note,
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this resident?"
              onConfirm={() => handleDeleteResident(record.id)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Residents Management</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddResidentOpen(true)}
        >
          Add Resident
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={residents}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      {/* Resident Detail Modal */}
      <Modal
        title="Resident Details"
        open={!!selectedResident}
        onCancel={() => setSelectedResident(null)}
        footer={null}
        width={800}
      >
        {selectedResident && (
          <div className="space-y-4">
            <Card>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Full Name:</strong> {selectedResident.fullName}
                </div>
                <div>
                  <strong>ID Number:</strong> {selectedResident.idNumber}
                </div>
                <div>
                  <strong>Relationship:</strong> 
                  <Tag color="blue" className="ml-2">{selectedResident.relationship}</Tag>
                </div>
                <div>
                  <strong>Start Date:</strong> {new Date(selectedResident.startDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>End Date:</strong> {new Date(selectedResident.endDate).toLocaleDateString()}
                </div>
                <div className="col-span-2">
                  <strong>Note:</strong> {selectedResident.note}
                </div>
              </div>
            </Card>
            
            {(selectedResident.idCardFrontUrl || selectedResident.idCardBackUrl) && (
              <Card title="ID Card Images">
                <div className="flex gap-4">
                  {selectedResident.idCardFrontUrl && (
                    <div>
                      <p className="mb-2 font-medium">Front</p>
                      <Image
                        src={selectedResident.idCardFrontUrl}
                        alt="ID Card Front"
                        width={200}
                        height={120}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  {selectedResident.idCardBackUrl && (
                    <div>
                      <p className="mb-2 font-medium">Back</p>
                      <Image
                        src={selectedResident.idCardBackUrl}
                        alt="ID Card Back"
                        width={200}
                        height={120}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit Resident Modal */}
      <Modal
        title={editResident ? "Edit Resident" : "Add Resident"}
        open={addResidentOpen || !!editResident}
        onCancel={() => {
          setAddResidentOpen(false);
          setEditResident(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editResident ? handleEditResident : handleAddResident}
        >
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: 'Please enter full name!' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="ID Number"
            name="idNumber"
            rules={[
              { required: true, message: 'Please enter ID number!' },
              { len: 12, message: 'ID number must be 12 digits!' }
            ]}
          >
            <Input placeholder="Enter 12-digit ID number" maxLength={12} />
          </Form.Item>

          <Form.Item
            label="Relationship"
            name="relationship"
            rules={[{ required: true, message: 'Please select relationship!' }]}
          >
            <Select placeholder="Select relationship" options={relationshipOptions} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[{ required: true, message: 'Please select start date!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[{ required: true, message: 'Please select end date!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item label="Note" name="note">
            <Input.TextArea placeholder="Enter additional notes" rows={3} />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => {
                setAddResidentOpen(false);
                setEditResident(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editResident ? "Update" : "Add"} Resident
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
