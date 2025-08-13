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
          minPrice: 0,
          maxPrice: 0,
          minArea: 0,
          maxArea: 0,
          provinceId: 0,
          districtId: 0,
          wardId: 0,
          listConvenientIds: [],
        },
        applyFilters: (item) => set((state) => ({ item: { ...state.item, ...item } })),
        resetFilters: () =>
          set({
            item: {
              minPrice: 0,
              maxPrice: 0,
              minArea: 0,
              maxArea: 0,
              provinceId: 0,
              districtId: 0,
              wardId: 0,
              listConvenientIds: [],
            },
          }),
      }),
      { name: 'filter-store' }
    )
  )
);

