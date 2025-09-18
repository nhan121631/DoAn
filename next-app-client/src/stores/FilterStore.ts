import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface FilterRequest {
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    provinceId?: number;
    districtId?: number;
    wardId?: number;
    listConvenientIds?: number[];
}

interface FilterStore {
  item: FilterRequest;
  isLoading: boolean;
  applyFilters: (item: FilterRequest) => void;
  setLoading: (loading: boolean) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>()(
  devtools(
    persist(
      (set) => ({
        item: {
          minPrice: undefined,
          maxPrice: undefined,
          minArea: undefined,
          maxArea: undefined,
          provinceId: undefined,
          districtId: undefined,
          wardId: undefined,
          listConvenientIds: [],
        },
        isLoading: false,
        applyFilters: (item) => set((state) => ({ item: { ...state.item, ...item } })),
        setLoading: (loading) => set({ isLoading: loading }),
        resetFilters: () =>
          set({
            item: {
              minPrice: undefined,
              maxPrice: undefined,
              minArea: undefined,
              maxArea: undefined,
              provinceId: undefined,
              districtId: undefined,
              wardId: undefined,
              listConvenientIds: [],
            },
            isLoading: false,
          }),
      }),
      { name: 'filter-store' }
    )
  )
);