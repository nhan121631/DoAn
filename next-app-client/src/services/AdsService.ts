// services/AdsService.ts - Simplified for display only
export interface AdsResponse {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: "LEFT" | "RIGHT";
//   position: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  createdDate: string;
  modifiedDate: string;
  createBy?: string;
  modifiedBy?: string;
  isCurrentlyActive: boolean;
}

class AdsService {
  private baseUrl = "/api/ads";

  // Get active ads by position - Only method needed for display
  async getActiveAdsByPosition(position: string): Promise<AdsResponse[]> {
    const url = new URL(this.baseUrl, window.location.origin);
    url.searchParams.append("position", position);

    console.log("🔍 [AdsService] Fetching ads for position:", position);
    console.log("🔍 [AdsService] Request URL:", url.toString());

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("❌ [AdsService] Failed to fetch ads:", response.status);
      throw new Error(`Failed to fetch ads: ${response.status}`);
    }

    const data = await response.json();
    console.log("📊 [AdsService] Received ads data:", data);

    return data;
  }
}

export const adsService = new AdsService();
