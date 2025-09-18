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
  applyFilters: (item: FilterRequest) => void;
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
        applyFilters: (item) => set((state) => ({ item: { ...state.item, ...item } })),
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
          }),
      }),
      { name: 'filter-store' }
    )
  )
);