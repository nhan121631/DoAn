import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Types
export type AdsPosition = "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";

export interface AdsResponse {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: AdsPosition;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  createdDate: string;
  modifiedDate: string;
  createBy?: string;
  modifiedBy?: string;
  isCurrentlyActive: boolean;
}

export interface CreateAdsRequest {
  title: string;
  description?: string;
  linkUrl?: string;
  position: AdsPosition;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateAdsRequest extends CreateAdsRequest {
  id: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

const API_BASE_URL = "http://localhost:3333/api/ads";

// API functions
const adsApi = {
  // Get all ads with pagination
  getAllAds: async (
    params: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: string;
    } = {}
  ): Promise<PageResponse<AdsResponse>> => {
    const {
      page = 0,
      size = 10,
      sortBy = "createdDate",
      sortDir = "desc",
    } = params;
    const response = await axios.get(`${API_BASE_URL}`, {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  },

  // Get ads by ID
//   getAdsById: async (id: string): Promise<AdsResponse> => {
//     const response = await axios.get(`${API_BASE_URL}/${id}`);
//     return response.data;
//   },

  // Create new ads
  createAds: async (
    data: CreateAdsRequest,
    imageFile: File
  ): Promise<AdsResponse> => {
    const formData = new FormData();

    // Append ads data as JSON string
    const adsData = {
      title: data.title,
      description: data.description,
      linkUrl: data.linkUrl,
      position: data.position,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? true,
      priority: data.priority ?? 0,
    };

    formData.append("ads", JSON.stringify(adsData));
    formData.append("image", imageFile);

    console.log("FormData being sent:", {
      ads: JSON.stringify(adsData),
      image: imageFile.name,
    });

    const response = await axios.post(`${API_BASE_URL}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update ads
  updateAds: async (
    data: UpdateAdsRequest,
    imageFile?: File
  ): Promise<AdsResponse> => {
    const formData = new FormData();

    // Append ads data as JSON string
    const adsData = {
      title: data.title,
      description: data.description,
      linkUrl: data.linkUrl,
      position: data.position,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? true,
      priority: data.priority ?? 0,
    };

    formData.append("ads", JSON.stringify(adsData));

    // Append image file if provided
    if (imageFile) {
      formData.append("image", imageFile);
    }

    console.log("FormData being sent for update:", {
      ads: JSON.stringify(adsData),
      image: imageFile?.name || "no new image",
    });

    const response = await axios.put(`${API_BASE_URL}/${data.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete ads
  deleteAds: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Search ads
//   searchAds: async (params: {
//     keyword: string;
//     page?: number;
//     size?: number;
//   }): Promise<PageResponse<AdsResponse>> => {
//     const { keyword, page = 0, size = 10 } = params;
//     const response = await axios.get(`${API_BASE_URL}/search`, {
//       params: { keyword, page, size },
//     });
//     return response.data;
//   },

  // Toggle ads status
  toggleAdsStatus: async (id: string): Promise<AdsResponse> => {
    const response = await axios.patch(`${API_BASE_URL}/${id}/toggle-status`);
    return response.data;
  },

  // Check for conflicts in position and date range
  checkConflicts: async (params: {
    position: AdsPosition;
    startDate: string;
    endDate: string;
    excludeId?: string;
  }): Promise<AdsResponse[]> => {
    const { position, startDate, endDate, excludeId } = params;
    const response = await axios.get(`${API_BASE_URL}/active/${position}`);
    const existingAds = response.data;

    // Filter out the current ad being edited
    const filteredAds = excludeId
      ? existingAds.filter((ad: AdsResponse) => ad.id !== excludeId)
      : existingAds;

    // Check for date overlap
    const conflicts = filteredAds.filter((ad: AdsResponse) => {
      const adStart = new Date(ad.startDate);
      const adEnd = new Date(ad.endDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);

      // Check if dates overlap
      return newStart <= adEnd && newEnd >= adStart;
    });

    return conflicts;
  },
};

// React Query hooks
export const useGetAllAds = (
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ["ads", "all", params],
    queryFn: () => adsApi.getAllAds(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateAds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      imageFile,
    }: {
      data: CreateAdsRequest;
      imageFile: File;
    }) => adsApi.createAds(data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
};

export const useUpdateAds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      imageFile,
    }: {
      data: UpdateAdsRequest;
      imageFile?: File;
    }) => adsApi.updateAds(data, imageFile),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads", data.id] });
    },
  });
};

export const useDeleteAds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adsApi.deleteAds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
};

// export const useSearchAds = (params: {
//   keyword: string;
//   page?: number;
//   size?: number;
// }) => {
//   return useQuery({
//     queryKey: ["ads", "search", params],
//     queryFn: () => adsApi.searchAds(params),
//     enabled: !!params.keyword,
//   });
// };

export const useToggleAdsStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adsApi.toggleAdsStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads", data.id] });
    },
  });
};

export const useCheckConflicts = () => {
  return useMutation({
    mutationFn: adsApi.checkConflicts,
  });
};
