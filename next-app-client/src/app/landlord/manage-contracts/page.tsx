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
  useEffect(() => {
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
    loadData();
  }, [landLordId]);



  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 transition-colors duration-300">

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin tip="Đang tải hợp đồng..." size="large">
            <div style={{ height: 0, width: 0 }} /> {/* dummy content */}
          </Spin>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <LandlordContracts contracts={contracts} />
      )}
    </div>
  );
}

