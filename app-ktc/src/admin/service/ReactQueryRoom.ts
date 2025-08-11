import { queryOptions } from "@tanstack/react-query";
import apiClient from "../lib/api-client-ad";
import type { RoomPageResponseDto } from "../types/type";

//======get all rooms======//
export const getAllRooms = (page: number, size: number): Promise<RoomPageResponseDto> => {
  return apiClient.get(
      `/rooms/by-admin/paging?page=${page}&size=${size}`
    );
}


export const getRoomQueryOptions = (page: number, size: number) => {
  return queryOptions({
    queryKey: ['getRooms', page, size] as const,
    queryFn: () => getAllRooms(page, size),
  });
};