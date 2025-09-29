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
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`Failed to fetch bills for contract ${contractId}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `Failed to fetch bills for contract (${response.status}): ${errorText}`
      );
    }
    return response.json();
  },

  async createBill(
    contractId: string,
    billData: Partial<BillData>
  ): Promise<BillData> {
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
  async updateBill(
    contractId: string,
    billId: string,
    billData: Partial<BillData>
  ): Promise<BillData> {
    const res = await fetch(`/api/contracts/${contractId}/bills/${billId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(billData),
    });
    if (!res.ok) throw new Error("Failed to update bill");
    return res.json();
  },

  async updateBillStatus(
    contractId: string,
    billId: string,
    status: string
  ): Promise<BillData> {
    const res = await fetch(
      `/api/contracts/${contractId}/bills/${billId}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
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
    const response = await fetch(
      `/api/contracts/${contractId}/bills/${billId}/download`
    );
    if (!response.ok) {
      throw new Error("Failed to download bill");
    }
    return response.blob();
  },

  async uploadBillImageProof(
    contractId: string,
    billId: string,
    file: File
  ): Promise<{ message: string; imageUrl: string }> {
    if (!contractId) {
      throw new Error("Missing contractId");
    }

    if (!billId) {
      throw new Error("Missing billId");
    }

    if (!file) {
      throw new Error("Missing file");
    }

    console.log("BillService - uploadBillImageProof called with:", {
      contractId,
      billId,
      fileName: file.name,
    });

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `/api/contracts/${contractId}/bills/${billId}/upload-image-proof`,
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("BillService - Upload response status:", response.status);
    console.log("BillService - Upload response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("BillService - Upload error response:", errorText);

      // Try to parse as JSON, fallback to plain text
      let errorMessage = "Failed to upload bill image proof";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Handle both JSON and plain text responses
    const contentType = response.headers.get("content-type");
    let result;

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
      console.log("BillService - Upload success response (JSON):", result);
      return result;
    } else {
      // Backend returns plain string (image URL)
      const imageUrl = await response.text();
      console.log("BillService - Upload success response (text):", imageUrl);
      result = { message: "Upload successful", imageUrl };
      return result;
    }
  },
};
