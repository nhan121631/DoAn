import { ContractData } from "@/types/types";

const BASE_URL = "/api/contracts";

export const ContractService = {
	async getByTenant(tenantId: string): Promise<ContractData[]> {
		const res = await fetch(`${BASE_URL}/tenant/${tenantId}`);
		if (!res.ok) throw new Error("Failed to fetch contracts by tenant");
		return res.json();
	},

	async getByLandlord(landlordId: string, page = 0, size = 10): Promise<{ content: ContractData[]; totalPages: number; totalElements: number; }> {
		const res = await fetch(`${BASE_URL}/landlord/${landlordId}?page=${page}&size=${size}`);
		if (!res.ok) throw new Error("Failed to fetch contracts by landlord");
		return res.json();
	},

	async getByRoom(roomId: string): Promise<ContractData[]> {
		const res = await fetch(`${BASE_URL}/room/${roomId}`);
		if (!res.ok) throw new Error("Failed to fetch contracts by room");
		return res.json();
	},

	async getById(contractId: string): Promise<ContractData> {
		const res = await fetch(`${BASE_URL}/${contractId}`);
		if (!res.ok) throw new Error("Failed to fetch contract by id");
		return res.json();
	},

	async getByStatus(status: number): Promise<ContractData[]> {
		const res = await fetch(`${BASE_URL}/status/${status}`);
		if (!res.ok) throw new Error("Failed to fetch contracts by status");
		return res.json();
	},

	async createContract(data: Partial<ContractData>): Promise<ContractData> {
		const res = await fetch(`${BASE_URL}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to create contract");
		return res.json();
	},

	async updateContract(contractId: string, data: Partial<ContractData>): Promise<ContractData> {
		const res = await fetch(`${BASE_URL}/${contractId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to update contract");
		return res.json();
	},

	async exportBills(contractId: string, fromMonth: string, toMonth: string): Promise<Blob> {
		const res = await fetch(`/api/contracts/${contractId}/bills/export?fromMonth=${fromMonth}&toMonth=${toMonth}`);
		if (!res.ok) throw new Error("Failed to export bills");
		return res.blob();
	},

	async deleteContract(contractId: string): Promise<void> {
		const res = await fetch(`${BASE_URL}/${contractId}`, {
			method: "DELETE",
		});
		if (!res.ok) {
			const errorMessage = await res.text();
			throw new Error(errorMessage || "Failed to delete contract");
		}
	},

	async uploadContractImage(contractId: string, file: File): Promise<ContractData> {
		const formData = new FormData();
		formData.append("file", file);

		const res = await fetch(`/api/contracts/${contractId}/image`, {
			method: "PUT",
			body: formData,
		});
		if (!res.ok) throw new Error("Failed to upload contract image");
		return res.json();
	}
};
