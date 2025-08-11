/* eslint-disable @typescript-eslint/no-explicit-any */
import { type DefaultOptions, QueryClient, type UseMutationOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false, // Không tự động refetch khi cửa sổ được lấy lại tiêu điểm
    // staleTime: 1000 * 60, // Dùng để xác định thời gian dữ liệu được coi là "cũ": 1 phút
    retry: false, // Không tự động thử lại khi có lỗi
    networkMode: 'always', // Luôn sử dụng mạng để lấy dữ liệu
  },
} satisfies DefaultOptions;

export const queryClient = new QueryClient({ defaultOptions: queryConfig });

export type ExtractFnReturnType<FnType extends (...args: any) => any> = Awaited<ReturnType<FnType>>;

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> = Awaited<ReturnType<FnType>>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<ReturnType<T>, 'queryKey' | 'queryFn'>;

export type MutationConfig<MutationFnType extends (...args: any) => Promise<any>> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;