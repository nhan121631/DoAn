/* eslint-disable @typescript-eslint/no-explicit-any */

import { BillData } from "@/types/types";
const BASE_URL = "/api/contracts";

export const BillService = {
  
    async getById(contractId: string, billId: string): Promise<BillData> {
        const response = await fetch(`${BASE_URL}/${contractId}/bills/${billId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch bill");
        }
        return response.json();
    },

    async getByContract(contractId: string): Promise<BillData[]> {
        const response = await fetch(`${BASE_URL}/${contractId}/bills`);
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error(`Failed to fetch bills for contract ${contractId}:`, {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`Failed to fetch bills for contract (${response.status}): ${errorText}`);
        }
        return response.json();
    },

    async createBill(contractId: string, billData: Partial<BillData>): Promise<BillData> {
        const response = await fetch(`/api/contracts/${contractId}/bills`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ contractId, ...billData }),
        });
        if (!response.ok) {
            throw new Error("Failed to create bill");
        }
        return response.json();
    },
    async updateBill(contractId: string, billId: string, billData: Partial<BillData>): Promise<BillData> {
      const res = await fetch(`/api/contracts/${contractId}/bills/${billId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });
      if (!res.ok) throw new Error("Failed to update bill");
      return res.json();
    },

    async updateBillStatus(contractId: string, billId: string, status: string): Promise<BillData> {
      const res = await fetch(`/api/contracts/${contractId}/bills/${billId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update bill status");
      return res.json();
    },
    async deleteBill(contractId: string, billId: string): Promise<void> {
      const res = await fetch(`/api/contracts/${contractId}/bills/${billId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete bill");
    },

    async downloadBill(contractId: string, billId: string): Promise<Blob> {
        const response = await fetch(`/api/contracts/${contractId}/bills/${billId}/download`);
        if (!response.ok) {
            throw new Error("Failed to download bill");
        }
        return response.blob();
    },
}