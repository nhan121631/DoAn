/* eslint-disable @typescript-eslint/no-explicit-any */

import { ResidentService } from "@/services/ResidentService";
import { ContractData, ResidentData } from "@/types/types";
import {
  EyeOutlined,
  TeamOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  Button,
  Image,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Card,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

// Helper function để convert relative path thành full Cloudinary URL
const getCloudinaryImageUrl = (relativePath: string) => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath; // Đã là full URL
  return `https://res.cloudinary.com${relativePath}`;
};

interface TenantResidentsTabProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
}



export default function TenantResidentsTab({
  contract,
}: TenantResidentsTabProps) {
  const router = useRouter();
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ResidentData | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setLoading(true);
        const fetchedResidents = await ResidentService.getByContract(contract.id);
        setResidents(fetchedResidents);
      } catch (error) {
        console.error("Error fetching residents:", error);
        messageApi.error("Failed to load residents");
        setResidents([]);
      } finally {
        setLoading(false);
      }
    };

    if (contract?.id) {
      fetchResidents();
    }
  }, [contract?.id, messageApi]);

  const columns: ColumnsType<ResidentData> = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="dark:text-gray-300" />
          <span className="font-medium dark:text-white transition-colors duration-300">
            {name}
          </span>
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
      render: (relationship: string) => <Tag color="blue">{relationship}</Tag>,
    },
    {
      title: "Period",
      key: "period",
      render: (_: any, record: ResidentData) => (
        <div>
          <div className="dark:text-white transition-colors duration-300">
            {new Date(record.startDate).toLocaleDateString()}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
            to {new Date(record.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "DONE":
              return "green";
            case "PENDING":
              return "orange";
            default:
              return "orange";
          }
        };
        return <Tag color={getStatusColor(status)}>{status || "PENDING"}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: ResidentData) => (
        <Space>
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => setSelectedResident(record)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {contextHolder}
      
      {/* Header Card with navigation to full residents page */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamOutlined className="text-2xl text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Residents for this Contract
              </h3>
              <p className="text-sm text-gray-600">
                View residents registered under this contract. For full resident management, 
                visit the dedicated residents page.
              </p>
            </div>
          </div>
          <Link href="/user-dashboard/residents">
            <Button type="primary" icon={<ArrowRightOutlined />} size="large">
              Manage All Residents
            </Button>
          </Link>
        </div>
      </Card>

      {/* Residents Table */}
      <Card>
        {residents.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No residents found for this contract.
                <br />
                <Link href="/user-dashboard/residents">
                  <Button type="link" className="p-0">
                    Go to Residents page to add residents
                  </Button>
                </Link>
              </span>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={residents}
            rowKey="id"
            pagination={false}
            loading={loading}
            size="middle"
          />
        )}
      </Card>

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-base">{selectedResident.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ID Number</label>
                <p className="text-base">{selectedResident.idNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Relationship</label>
                <p className="text-base">
                  <Tag color="blue">{selectedResident.relationship}</Tag>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-base">
                  <Tag color={selectedResident.status === "DONE" ? "green" : "orange"}>
                    {selectedResident.status || "PENDING"}
                  </Tag>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-base">{new Date(selectedResident.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Date</label>
                <p className="text-base">{new Date(selectedResident.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            {selectedResident.note && (
              <div>
                <label className="text-sm font-medium text-gray-500">Note</label>
                <p className="text-base">{selectedResident.note}</p>
              </div>
            )}

            {/* ID Card Images */}
            <div className="grid grid-cols-2 gap-4">
              {selectedResident.idCardFrontUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Card Front</label>
                  <Image
                    src={getCloudinaryImageUrl(selectedResident.idCardFrontUrl)}
                    alt="ID Card Front"
                    width="100%"
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              {selectedResident.idCardBackUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Card Back</label>
                  <Image
                    src={getCloudinaryImageUrl(selectedResident.idCardBackUrl)}
                    alt="ID Card Back"
                    width="100%"
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
