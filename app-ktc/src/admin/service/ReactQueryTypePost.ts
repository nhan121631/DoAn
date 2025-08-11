import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client-ad";
import type { MutationConfig } from "../lib/react-query";
import type { IPostType } from "../types/type";


//=====get typepost======//
export const getAllTypePosts = (): Promise<IPostType[]> => {
  return apiClient.get(`/post-types`);
};

export const getTypePostsQueryOptions = () => {
  return queryOptions({
    queryKey: ['getTypePosts'] as const,
    queryFn: getAllTypePosts,
  });
};

// type UseTypePostsOptions = {
//   queryConfig?: QueryConfig<typeof getTypePostsQueryOptions>;
//   refreshKey?: number;
// };

// export const useTypePosts = ({ queryConfig, refreshKey }: UseTypePostsOptions = {}) => {
//   return useQuery({
//     ...getTypePostsQueryOptions(refreshKey),
//     ...queryConfig,
//   });
// };

//======create typepost======//
export const createTypePost = ({ data }: { data: IPostType }): Promise<IPostType> =>{
  return apiClient.post(`/post-types`, data);
};
type UseCreateTypePostOptions = {
  mutationConfig?: MutationConfig<typeof createTypePost>;
};

export const useCreateTypePost = ({ mutationConfig }: UseCreateTypePostOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getTypePostsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createTypePost,
  });
};

//======update typepost=======//
export const updateTypePost = ({ data }: { data: IPostType }): Promise<IPostType> => {
  return apiClient.patch(`/post-types`, data);
};

type UseUpdateTypePostOptions = {
  mutationConfig?: MutationConfig<typeof updateTypePost>;
};

export const useUpdateTypePost = ({ mutationConfig }: UseUpdateTypePostOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getTypePostsQueryOptions().queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateTypePost,
  });
};


//======delete======//
export const deleteTypePost = ({ id }: { id: string }): Promise<IPostType> => {
    return apiClient.patch(`/post-types/delete/${id}`);
}
type UseDeleteTypePostOptions = {
  mutationConfig?: MutationConfig<typeof deleteTypePost>;
};

export const useDeleteTypePost = ({ mutationConfig }: UseDeleteTypePostOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['getTypePosts'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteTypePost,
  });
};