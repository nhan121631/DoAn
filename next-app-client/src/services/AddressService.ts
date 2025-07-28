const API_URL = "http://localhost:3000/api";
export async function getProvinces()  {
    const response = await fetch(`${API_URL}/provinces`);
    if (!response.ok) {
      throw new Error("Failed to fetch provinces");
    }
    return response.json();
}

export async function getDistricts(provinceId: string) {
    const response = await fetch(`${API_URL}/districts?provinceId=${provinceId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch districts");
    }
    return response.json();
}
