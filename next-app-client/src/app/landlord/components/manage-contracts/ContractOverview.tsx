import React from "react";
import { Descriptions, Tag } from "antd";
import { ContractData } from "@/types/types";

interface ContractOverviewProps {
  contract: ContractData;
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Active", color: "green" },
  1: { text: "Terminated", color: "red" },
  2: { text: "Expired", color: "orange" },
  3: { text: "Pending", color: "blue" },
};

export default function ContractOverview({ contract }: ContractOverviewProps) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Contract Information</h3>
      <Descriptions bordered column={2} size="middle">
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
          {contract.depositAmount?.toLocaleString()} đ
        </Descriptions.Item>
        <Descriptions.Item label="Rent">
          {contract.monthlyRent?.toLocaleString()} đ / month
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusMap[contract.status]?.color}>
            {statusMap[contract.status]?.text}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}
