import React from "react";
import { Descriptions, Tag, Image } from "antd";
import { ContractData } from "@/types/types";
import { formatCloudinaryUrl, formatCloudinaryThumbnail } from "@/utils/cloudinaryUtils";

interface TenantContractOverviewProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Active", color: "green" },
  1: { text: "Terminated", color: "red" },
  2: { text: "Expired", color: "orange" },
  3: { text: "Pending", color: "blue" },
};

export default function TenantContractOverview({ contract }: TenantContractOverviewProps) {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Contract Information</h3>
        <p className="text-gray-600 text-sm">View your contract details below</p>
      </div>
      
      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Contract Name">
          {contract.contractName}
        </Descriptions.Item>
        <Descriptions.Item label="Room">{contract.roomTitle}</Descriptions.Item>
        <Descriptions.Item label="Tenant">
          {contract.tenantName}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {contract.tenantPhone || "Not provided"}
        </Descriptions.Item>
        <Descriptions.Item label="Landlord">{contract.landlordName}</Descriptions.Item>
        <Descriptions.Item label="Start Date">
          {new Date(contract.startDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="End Date">
          {new Date(contract.endDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Deposit">
          {contract.depositAmount?.toLocaleString('vi-VN')} đ
        </Descriptions.Item>
        <Descriptions.Item label="Monthly Rent">
          {contract.monthlyRent?.toLocaleString('vi-VN')} đ / month
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusMap[contract.status]?.color}>
            {statusMap[contract.status]?.text}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Contract Image" span={2}>
          {contract.contractImage ? (
            <div className="flex items-center gap-2">
              <Image
                src={formatCloudinaryThumbnail(contract.contractImage, 150, 100) || undefined}
                alt="Contract Image"
                width={150}
                height={100}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dm3jaMgAAAABwSURBVHhe7cHBDQAACAwCoNGPAnOwQBE8tATFHIAAAABwSURBVHhe7cHBDQAACAwCoNGPAnOwQBE8tATFHIAAAABwSURBVHhe7cHBDQAACAwCoNGPAnOwQBE8tATFHI="
              />
              <a 
                href={formatCloudinaryUrl(contract.contractImage) || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                View Full Image
              </a>
            </div>
          ) : (
            <span className="text-gray-500">No contract image available</span>
          )}
        </Descriptions.Item>
      </Descriptions>

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">Important Information</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Please keep your contract information updated</li>
          <li>• Contact your landlord for any changes needed</li>
          <li>• Pay your bills on time to maintain good standing</li>
          <li>• Report any issues with the property promptly</li>
        </ul>
      </div>
    </div>
  );
}
