/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client-ad";
import type { 
  BlogResponse, 
  BlogCreateRequest, 
  BlogUpdateRequest, 
  BlogPageResponse,
  BlogCategory,
  BlogStatus 
} from "../types/type";
import type { MutationConfig } from "../lib/react-query";

// ======= Get Blogs with Pagination and Filters =======
export const getBlogs = (
  page: number = 0,
  size: number = 10,
  status?: BlogStatus,
  category?: BlogCategory
): Promise<BlogPageResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  
  return apiClient.get(`/blogs?${params.toString()}`);
};

export const getBlogsQueryOptions = (
  page: number = 0,
  size: number = 10,
  status?: BlogStatus,
  category?: BlogCategory
) => {
  return queryOptions({
    queryKey: ['blogs', page, size, status, category] as const,
    queryFn: () => getBlogs(page, size, status, category),
  });
};

// ======= Get Blog by Slug =======
export const getBlogBySlug = (slug: string): Promise<BlogResponse> => {
  return apiClient.get(`/blogs/slug/${slug}`);
};

export const getBlogBySlugQueryOptions = (slug: string) => {
  return queryOptions({
    queryKey: ['blog', slug] as const,
    queryFn: () => getBlogBySlug(slug),
    enabled: !!slug,
  });
};

// ======= Create Blog =======
const createBlog = async ({ request, authorId }: { request: BlogCreateRequest; authorId: string }): Promise<BlogResponse> => {
  console.log('🚀 Creating blog with data:', {
    authorId,
    request: {
      ...request,
      content: `${request.content.substring(0, 100)}${request.content.length > 100 ? '...' : ''}`
    }
  });
  
  const url = `/blogs?authorId=${authorId}`;
  console.log('🌐 Request URL:', url);
  console.log('📦 Request payload:', request);
  
  try {
    const response = await apiClient.post(url, request);
    console.log('✅ Response received:', response);
    return response.data;
  } catch (error: any) {
    console.error('❌ Request failed with error:', error);
    
    // Log the actual request that was sent
    if (error.config) {
      console.error('🔍 Failed request config:');
      console.error('  URL:', error.config.url);
      console.error('  Method:', error.config.method);
      console.error('  Headers:', error.config.headers);
      console.error('  Data:', error.config.data);
    }
    
    throw error;
  }
};

type CreateBlogPayload = { request: BlogCreateRequest; authorId: string };
type UseCreateBlogOptions = {
  mutationConfig?: MutationConfig<(payload: CreateBlogPayload) => Promise<BlogResponse>>;
};

export const useCreateBlog = ({ mutationConfig }: UseCreateBlogOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, onError, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createBlog,
    onSuccess: (data, variables, ...args) => {
      console.log('✅ Blog created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      onSuccess?.(data, variables, ...args);
    },
    onError: (error: any, variables, ...args) => {
      console.error('❌ Failed to create blog:', error);
      console.error('📋 Request data that failed:', {
        authorId: variables.authorId,
        request: variables.request
      });
      
      // Log detailed error information
      if (error?.response) {
        console.error('📊 Response status:', error.response.status);
        console.error('📋 Response data:', error.response.data);
        console.error('📋 Response headers:', error.response.headers);
      } else if (error?.request) {
        console.error('📡 Request was made but no response received:', error.request);
      } else {
        console.error('⚠️ Error setting up request:', error.message);
      }
      
      onError?.(error, variables, ...args);
    },
    ...restConfig,
  });
};

// ======= Update Blog =======
const updateBlog = ({ id, request }: { id: string; request: BlogUpdateRequest }): Promise<BlogResponse> => {
  return apiClient.put(`/blogs/${id}`, request);
};

type UpdateBlogPayload = { id: string; request: BlogUpdateRequest };
type UseUpdateBlogOptions = {
  mutationConfig?: MutationConfig<(payload: UpdateBlogPayload) => Promise<BlogResponse>>;
};

export const useUpdateBlog = ({ mutationConfig }: UseUpdateBlogOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateBlog,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', data.slug] });
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
  });
};

// ======= Delete Blog =======
const deleteBlog = ({ id }: { id: string }): Promise<void> => {
  return apiClient.delete(`/blogs/${id}`);
};

type DeleteBlogPayload = { id: string };
type UseDeleteBlogOptions = {
  mutationConfig?: MutationConfig<(payload: DeleteBlogPayload) => Promise<void>>;
};

export const useDeleteBlog = ({ mutationConfig }: UseDeleteBlogOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
  });
};