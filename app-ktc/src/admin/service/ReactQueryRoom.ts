/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client-ad";
import type { RoomPageResponseDto } from "../types/type";
import type { MutationConfig } from "../lib/react-query";

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

//=====update approval======//
const updateApproval = ({ roomId, status }: { roomId: string; status: number; page?: number; pageSize?: number }): Promise<void> => {
  return apiClient.patch(`/rooms/${roomId}/approval`, {
      approval: status,
    });
};

type UpdateApprovalPayload = { roomId: string; status: number; page?: number; pageSize?: number };
type UseUpdateApprovalOptions = {
  mutationConfig?: MutationConfig<(payload: UpdateApprovalPayload) => Promise<void>>;
};

export const useUpdateApproval = ({ mutationConfig }: UseUpdateApprovalOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, variables, ...args) => {
      // Lấy page và pageSize từ biến truyền vào mutation
      const { page, pageSize } = (variables as any) || {};
      if (typeof page === 'number' && typeof pageSize === 'number') {
        queryClient.invalidateQueries({
          queryKey: ['getRooms', page, pageSize]
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['getRooms'] });
      }
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: updateApproval,
  });
};