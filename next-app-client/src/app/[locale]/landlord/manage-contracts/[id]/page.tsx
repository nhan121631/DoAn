/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Spin, message, Tabs, Button } from "antd";
import {
  FileTextOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { ContractData } from "@/types/types";
import { ContractService } from "@/services/ContractService";
import ContractOverview from "../../components/manage-contracts/ContractOverview";
import BillsTab from "../../components/manage-contracts/BillsTab";

export default function LandlordContractDetail() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const contractId = params?.id as string;
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const data = await ContractService.getById(contractId);
        setContract(data);
      } catch (err: any) {
        setError("Cannot load contract");
        messageApi.error("Cannot load contract");
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
      <div className="text-center text-red-500 dark:text-red-400 bg-white dark:bg-[#001529] p-8 transition-colors duration-300">
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
        <ContractOverview
          contract={contract}
          onContractUpdate={handleContractUpdate}
          autoEdit={searchParams?.get("edit") === "true"}
          messageApi={messageApi}
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
        <BillsTab
          contract={contract}
          onContractUpdate={handleContractUpdate}
          messageApi={messageApi}
        />
      ),
    },

  ];

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 overflow-auto transition-colors duration-300">
      {contextHolder}
      <div className="bg-white dark:bg-[#22304a] rounded-2xl shadow-md w-full mx-auto p-6 transition-colors duration-300">
        <div className="flex items-center justify-start gap-5 mb-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/landlord/manage-contracts")}
            className="mb-4 !bg-sky-600 dark:!bg-[#171f2f] !text-white"
          >
            Go Back
          </Button>
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Contract Management
          </h2>
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
