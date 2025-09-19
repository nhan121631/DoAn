/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import apiClient from "../lib/api-client-ad";
import type { CloudinaryUploadResponse, TinyMCEUploadResponse } from "../types/type";
import type { MutationConfig } from "../lib/react-query";
import { getFullCloudinaryUrl } from "../lib/cloudinary-utils";

// ======= Upload Image =======
const uploadImage = ({ file }: { file: File }): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.post('/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type UploadImagePayload = { file: File };
type UseUploadImageOptions = {
  mutationConfig?: MutationConfig<(payload: UploadImagePayload) => Promise<CloudinaryUploadResponse>>;
};

export const useUploadImage = ({ mutationConfig }: UseUploadImageOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: uploadImage,
    onSuccess: (data, variables, ...args) => {
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
  });
};

// ======= Upload Image for TinyMCE =======
const uploadImageForTinyMCE = async ({ file }: { file: File }): Promise<TinyMCEUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('📸 Uploading image for TinyMCE:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });
  
  try {
    const response = await apiClient.post('/upload-image/tinymce', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ TinyMCE image upload response:', response);
    console.log('📦 Response data:', response.data);
    
    // Safely handle response data
    const data = response.data || response || {};
    
    console.log('🔍 Parsed data:', data);
    
    // Try multiple ways to get the location
    let rawLocation = '';
    if (typeof data === 'string') {
      rawLocation = data;
    } else if (data && typeof data === 'object') {
      rawLocation = data.location || data.url || data.publicUrl || '';
    }
    
    console.log('📍 Raw location found:', rawLocation);
    
    if (!rawLocation) {
      console.error('❌ No location found in response:', { data, response });
      throw new Error('No image location found in upload response');
    }
    
    // Convert to full URL if needed for consistency
    const fullUrl = getFullCloudinaryUrl(rawLocation);
    
    console.log('🔗 Final URL:', fullUrl);
    
    return {
      location: fullUrl
    };
  } catch (error: any) {
    console.error('❌ TinyMCE image upload failed:', error);
    
    if (error.response) {
      console.error('📊 Error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw error;
  }
};

type UploadImageForTinyMCEPayload = { file: File };
type UseUploadImageForTinyMCEOptions = {
  mutationConfig?: MutationConfig<(payload: UploadImageForTinyMCEPayload) => Promise<TinyMCEUploadResponse>>;
};

export const useUploadImageForTinyMCE = ({ mutationConfig }: UseUploadImageForTinyMCEOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: uploadImageForTinyMCE,
    onSuccess: (data, variables, ...args) => {
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
  });
};

// ======= Delete Image =======
const deleteImage = ({ publicId }: { publicId: string }): Promise<void> => {
  return apiClient.delete(`/upload-image/${publicId}`);
};

type DeleteImagePayload = { publicId: string };
type UseDeleteImageOptions = {
  mutationConfig?: MutationConfig<(payload: DeleteImagePayload) => Promise<void>>;
};

export const useDeleteImage = ({ mutationConfig }: UseDeleteImageOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteImage,
    onSuccess: (data, variables, ...args) => {
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
  });
};