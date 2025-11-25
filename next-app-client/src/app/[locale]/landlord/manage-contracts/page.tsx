"use client"
import React, { useEffect, useState } from "react";
import LandlordContracts from "../components/manage-contracts/LandlordContracts";
import { ContractData } from "@/types/types";
import { useSession } from "next-auth/react";
import { ContractService } from "@/services/ContractService";
import { Spin } from "antd";


export default function ManageContractsPage() {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const landLordId = session?.user.id as string;

  const loadData = async () => {
    try {
      setLoading(true);
      if (!landLordId) return;
      const data = await ContractService.getByLandlord(landLordId, 0, 10);
      setContracts(data.content);
    } catch (error) {
      setError("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [landLordId]);

  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 transition-colors duration-300">
      {loading ? (
        <div className="flex flex-col justify-center items-center h-96 space-y-3">
          <Spin size="large" />
          <span className="text-center whitespace-nowrap text-gray-900 dark:text-white">Loading contracts...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 dark:text-red-400">{error}</div>
      ) : (
        <LandlordContracts contracts={contracts} onContractDeleted={loadData} />
      )}
    </div>
  );

}

