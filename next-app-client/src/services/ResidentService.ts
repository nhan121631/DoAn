import { ResidentData } from "@/types/types";

const BASE_URL = "/api/contracts";

export const ResidentService = {
  // Get all residents for a specific contract
  async getByContract(contractId: string): Promise<ResidentData[]> {
    const response = await fetch(`${BASE_URL}/${contractId}/residents`);
    if (!response.ok) {
      throw new Error("Failed to fetch residents");
    }
    return response.json();
  },

  // Get all residents for a specific landlord
  async getByLandlord(landlordId: string): Promise<ResidentData[]> {
    const response = await fetch(`/api/temporary-residences/landlord/${landlordId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch residents by landlord");
    }
    return response.json();
  },
   async getByTenant(tenantId: string): Promise<ResidentData[]> {
    const response = await fetch(`/api/temporary-residences/tenant/${tenantId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch residents by tenant");
    }
    return response.json();
  },

  // Get specific resident by ID
  async getById(contractId: string, residentId: string): Promise<ResidentData> {
    const response = await fetch(`${BASE_URL}/${contractId}/residents/${residentId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch resident");
    }
    return response.json();
  },

  // Create new resident
async createResident(
  contractId: string,
  residentData: Partial<ResidentData>,
  frontImage?: File,
  backImage?: File
): Promise<ResidentData> {
  const formData = new FormData();

  // Convert residentData -> Blob JSON file giống Postman (test.json)
  const blob = new Blob([JSON.stringify({
    fullName: residentData.fullName,
    idNumber: residentData.idNumber,
    relationship: residentData.relationship,
    startDate: residentData.startDate,
    endDate: residentData.endDate,
    note: residentData.note || "",
    status: residentData.status || "PENDING",
    contractId: contractId
  })], { type: "application/json" });

  formData.append("data", blob, "data.json");

  // Thêm ảnh nếu có
  if (frontImage) {
    formData.append("frontImage", frontImage);
  }
  if (backImage) {
    formData.append("backImage", backImage);
  }

  const response = await fetch(`${BASE_URL}/${contractId}/residents`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Backend error:", errorText);
    throw new Error("Failed to create resident");
  }

  return response.json();
},

  // Update existing resident
  async updateResident(
    contractId: string,
    residentId: string,
    residentData: Partial<ResidentData>,
    frontImage?: File,
    backImage?: File
  ): Promise<ResidentData> {
    const formData = new FormData();
    
    const dataToSend = {
      fullName: residentData.fullName,
      idNumber: residentData.idNumber,
      relationship: residentData.relationship,
      startDate: residentData.startDate,
      endDate: residentData.endDate,
      note: residentData.note || "",
      status: residentData.status || "PENDING",
      contractId: contractId
    };
    
    console.log('ResidentService - Data being sent to backend:', dataToSend); // Debug log
    
    // Convert residentData -> Blob JSON file giống createResident
    const blob = new Blob([JSON.stringify(dataToSend)], { type: "application/json" });

    formData.append("data", blob, "data.json");
    
    // Add images if provided
    if (frontImage) {
      formData.append('frontImage', frontImage);
    }
    if (backImage) {
      formData.append('backImage', backImage);
    }

    const response = await fetch(`${BASE_URL}/${contractId}/residents/${residentId}`, {
      method: "PUT",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      throw new Error("Failed to update resident");
    }
    
    return response.json();
  },

  // Delete resident
  async deleteResident(contractId: string, residentId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/${contractId}/residents/${residentId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete resident");
    }
  },

  // Helper function to convert file to base64 for preview
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
};
