import { queryOptions } from "@tanstack/react-query";
import apiClient from "../lib/api-client-ad";
import type { UserResponseDto } from "../types/type";

//=====get all account======//
export const getAllAccounts = (): Promise<UserResponseDto[]> => {
  return apiClient.get(`/admin/accounts`);
};

export const getAccountsQueryOptions = () => {
  return queryOptions({
    queryKey: ['getAccounts'] as const,
    queryFn: getAllAccounts,
  });
};