import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client-ad";
import type { UserResponseDto } from "../types/type";
import type { MutationConfig } from "../lib/react-query";

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

//=====update account roles======//

export const updateAccountRoles = ({ id, roleNames }: { id: string; roleNames: string[] }): Promise<void> => {
  return apiClient.patch(`/admin/accounts/${id}/roles`, { roleNames });
};
type UseUpdateAccountRolesOptions = {
  mutationConfig?: MutationConfig<typeof updateAccountRoles>;
};

export const useUpdateAccountRoles = ({ mutationConfig }: UseUpdateAccountRolesOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getAccountsQueryOptions().queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateAccountRoles,
  });
};

//=====update status account=====//

export const updateAccountStatus = ({ id, status }: { id: string; status: number }): Promise<void> => {
  return apiClient.patch(`/admin/accounts/${id}/status`, { status });
};
type UseUpdateAccountStatusOptions = {
  mutationConfig?: MutationConfig<typeof updateAccountStatus>;
};

export const useUpdateAccountStatus = ({ mutationConfig }: UseUpdateAccountStatusOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getAccountsQueryOptions().queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateAccountStatus,
  });
};