/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Spin, message, Tabs } from "antd";
import { FileTextOutlined, DollarOutlined, TeamOutlined } from "@ant-design/icons";
import { ContractData } from "@/types/types";
import { ContractService } from "@/services/ContractService";
import TenantContractOverview from "../../components/my-contracts/TenantContractOverview";
import TenantBillsTab from "../../components/my-contracts/TenantBillsTab";
import TenantResidentsTab from "../../components/my-contracts/TenantResidentsTab";

export default function TenantContractDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const contractId = params?.id as string;
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const data = await ContractService.getById(contractId);
        setContract(data);
      } catch (err: any) {
        setError("Cannot load contract");
        message.error("Cannot load contract");
      } finally {
        setLoading(false);
      }
    };
    if (contractId) fetchContract();
  }, [contractId]);

  useEffect(() => {
    // Check URL params for auto-navigation
    const tab = searchParams?.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleContractUpdate = (updatedContract: ContractData) => {
    setContract(updatedContract);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-white dark:bg-[#001529] transition-colors duration-300">
        <Spin size="large" />
        <span className="mt-3 text-center whitespace-nowrap text-gray-900 dark:text-white">
          Loading contracts...
        </span>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="text-center text-red-500">
        {error || "Contract not found"}
      </div>
    );
  }

  const tabItems = [
    {
      key: "overview",
      label: (
        <span>
          <FileTextOutlined /> Overview
        </span>
      ),
      children: (
        <TenantContractOverview
          contract={contract}
          onContractUpdate={handleContractUpdate}
        />
      ),
    },
    {
      key: "bills",
      label: (
        <span>
          <DollarOutlined />
          Bills
        </span>
      ),
      children: (
        <TenantBillsTab
          contract={contract}
          onContractUpdate={handleContractUpdate}
        />
      ),
    },
    {
      key: "residents",
      label: (
        <span>
          <TeamOutlined />
          Residents
        </span>
      ),
      children: (
        <TenantResidentsTab
          contract={contract}
          onContractUpdate={handleContractUpdate}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 overflow-auto">
      <div className="bg-white rounded-2xl shadow-md w-full mx-auto p-6">
        <h2 className="text-xl font-bold mb-6">Contract Details</h2>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          tabPosition="top"
        />
      </div>
    </div>
  );
}
