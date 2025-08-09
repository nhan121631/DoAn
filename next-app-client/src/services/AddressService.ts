import { API_URL } from "./Constant";

// const API_URL = "https://e930f8f40a31.ngrok-free.app/api";
export async function getProvinces()  {
    const response = await fetch(`${API_URL}/provinces`);
    if (!response.ok) {
      throw new Error("Failed to fetch provinces");
    }
    return response.json();
}

export async function getDistricts(provinceId: string) {
    const response = await fetch(`${API_URL}/districts/${provinceId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch districts");
    }
    return response.json();
}

export async function getWards(districtId: string) {
    const response = await fetch(`${API_URL}/wards/${districtId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch wards");
    }
    return response.json();
}