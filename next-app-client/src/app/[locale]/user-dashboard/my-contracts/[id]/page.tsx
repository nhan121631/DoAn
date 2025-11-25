/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Spin, message, Tabs, Button } from "antd";
import {
  FileTextOutlined,
  DollarOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { ContractData } from "@/types/types";
import { ContractService } from "@/services/ContractService";
import TenantContractOverview from "../../components/my-contracts/TenantContractOverview";
import TenantBillsTab from "../../components/my-contracts/TenantBillsTab";
import TenantResidentsTab from "../../components/my-contracts/TenantResidentsTab";

export default function TenantContractDetail() {
  const router = useRouter();
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
    
  ];

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 overflow-auto">
      <div className="bg-white rounded-2xl shadow-md w-full mx-auto p-6">
        <div className="flex items-center justify-start gap-5 mb-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/user-dashboard/my-contracts")}
            className="mb-4 !bg-sky-600 dark:!bg-[#171f2f] !text-white"
          >
            Go Back
          </Button>
          <h2 className="text-xl font-bold mb-6">Contract Details</h2>
        </div>
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
