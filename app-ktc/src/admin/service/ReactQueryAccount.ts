import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client-ad";
import type { MutationConfig } from "../lib/react-query";
import type { UserPageResponseDto } from "../types/type";

//=====get all account with pagination======//
export const getPaginatedAccounts = (page: number, pageSize: number): Promise<UserPageResponseDto> => {
  return apiClient.get(`/admin/accounts/paginated`, {
    params: { page, size: pageSize }
  });
};

export const getPaginatedAccountsQueryOptions = (page: number, pageSize: number) => {
  return queryOptions({
    queryKey: ['getPaginatedAccounts', page, pageSize] as const,
    queryFn: () => getPaginatedAccounts(page, pageSize),
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
      // Invalidates and refetches the paginated accounts query after a successful update
      queryClient.invalidateQueries({
        queryKey: ['getPaginatedAccounts']
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
  queryClient.invalidateQueries({ queryKey: ['getPaginatedAccounts'] });
  queryClient.invalidateQueries({ queryKey: ['countActiveUsers'] });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateAccountStatus,
  });
};
//=====count account active=====//
const countActiveUsers = () => {
  return apiClient.get('/admin/statistics/inactive-users/count');
};
export const useCountActiveUsers = () => {

   return queryOptions({
    queryKey: ['countActiveUsers'],
    queryFn: () => countActiveUsers(),
  });
};