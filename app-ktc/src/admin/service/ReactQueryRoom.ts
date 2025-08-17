/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client-ad";
import type { RoomDetail, RoomPageResponseDto } from "../types/type";
import type { MutationConfig } from "../lib/react-query";

//======get all rooms======//
export const getAllRooms = (page: number, size: number, sortField?:string, sortOrder?:string): Promise<RoomPageResponseDto> => {
  const url = `/rooms/by-admin/paging?page=${page}&size=${size}`;
  if (sortField && sortOrder) {
    return apiClient.get(`${url}&sortField=${sortField}&sortOrder=${sortOrder}`);
  }
  return apiClient.get(url);
}


export const getRoomQueryOptions = (page: number, size: number, sortField?:string, sortOrder?:string) => {
  return queryOptions({
    queryKey: ['getRooms', page, size, sortField, sortOrder] as const,
    queryFn: () => getAllRooms(page, size, sortField, sortOrder),
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
        queryClient.invalidateQueries({ queryKey: ['getCountAcceptedRooms'] });
        queryClient.invalidateQueries({ queryKey: ['getCountPendingRooms'] });
        queryClient.invalidateQueries({ queryKey: ['getCountTotalRooms'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['getRooms'] });
      }
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: updateApproval,
  });
};

//======delete room=======//

const deleteRoom = ({ roomId, isRemoved }: { roomId: string; isRemoved: number; page?: number; pageSize?: number }): Promise<void> => {
  return apiClient.patch(`/rooms/${roomId}/delete`, {
      isRemoved: isRemoved,
    });
};

type RemoveRoomPayload = { roomId: string; isRemoved: number; page?: number; pageSize?: number };
type UseRemoveRoomOptions = {
  mutationConfig?: MutationConfig<(payload: RemoveRoomPayload) => Promise<void>>;
};
export const useDeleteRoom = ({ mutationConfig }: UseRemoveRoomOptions = {}) => {
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
        queryClient.invalidateQueries({ queryKey: ['getCountAcceptedRooms'] });
        queryClient.invalidateQueries({ queryKey: ['getCountPendingRooms'] });
        queryClient.invalidateQueries({ queryKey: ['getCountTotalRooms'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['getRooms'] });
      }
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: deleteRoom,
  });
};

//=====get room by id=====//
const getRoomById = (id: string): Promise<RoomDetail> => {
  return apiClient.get(`/rooms/${id}`);
};

export const getRoomByIdQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['getRoomById', id] as const,
    queryFn: () => getRoomById(id),
  });
};

//=====get count room accepted=====//
const getCountAcceptedRooms = (): Promise<number> => {
  return apiClient.get('/admin/statistics/rooms/accepted/count');
};

export const useCountAcceptedRoomsQueryOptions = () => {
  return queryOptions({
    queryKey: ['getCountAcceptedRooms'] as const,
    queryFn: () => getCountAcceptedRooms(),
  });
};

//=====get count room pending=====//
const getCountPendingRooms = (): Promise<number> => {
  return apiClient.get('/admin/statistics/rooms/pending/count');
};

export const useCountPendingRoomsQueryOptions = () => {
  return queryOptions({
    queryKey: ['getCountPendingRooms'] as const,
    queryFn: () => getCountPendingRooms(),
  });
};

//=====get count room rejected=====//
const getCountTotalRooms = (): Promise<number> => {
  return apiClient.get('/admin/statistics/rooms/total/count');
};

export const useCountTotalRoomsQueryOptions = () => {
  return queryOptions({
    queryKey: ['getCountTotalRooms'] as const,
    queryFn: () => getCountTotalRooms(),
  });
};