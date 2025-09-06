import { LandLordInfo, LandlordDetail, RoomListing } from "@/app/landlord/types";
import { PageResponse } from "@/types/types";

import { API_URL } from "./Constant";



export const landlordService = {
  async getAllLandlords(page: number = 0, size: number = 6): Promise<PageResponse<LandLordInfo>> {
    try {
      const response = await fetch(`${API_URL}/landlords?page=${page}&size=${size}`);
      if (!response.ok) {
        throw new Error('Failed to fetch landlords');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching landlords:', error);
      throw error;
    }
  },
  async getLandlordById(landlordId: string): Promise<LandlordDetail> {
    try {
      const response = await fetch(`${API_URL}/landlords/${landlordId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch landlord detail');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching landlord detail:', error);
      throw error;
    }
  },

  async getLandlordRooms(landlordId: string, page: number = 0, size: number = 9): Promise<PageResponse<RoomListing>> {
    try {
      const response = await fetch(`${API_URL}/landlords/${landlordId}/rooms?page=${page}&size=${size}`);
      if (!response.ok) {
        throw new Error('Failed to fetch landlord rooms');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching landlord rooms:', error);
      throw error;
    }
  }
};