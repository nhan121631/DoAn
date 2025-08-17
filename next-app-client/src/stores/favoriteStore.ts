import { create } from "zustand"

interface FavoriteState {
  favoriteRoomIds: Set<string>
  isLoading: boolean
  isInitialized: boolean
  
  // Actions đơn giản chỉ quản lý state
  setFavoriteRoomIds: (ids: string[]) => void
  addFavorite: (roomId: string) => void
  removeFavorite: (roomId: string) => void
  setLoading: (isLoading: boolean) => void
  setInitialized: (isInitialized: boolean) => void
}

export const useFavoriteStore = create<FavoriteState>((set) => ({
  favoriteRoomIds: new Set<string>(),
  isLoading: false,
  isInitialized: false,

  setFavoriteRoomIds: (ids) =>
    set({
      favoriteRoomIds: new Set(ids),
      isInitialized: true,
    }),

  addFavorite: (roomId) =>
    set((state) => {
      const newSet = new Set(state.favoriteRoomIds)
      newSet.add(roomId)
      return { favoriteRoomIds: newSet }
    }),

  removeFavorite: (roomId) =>
    set((state) => {
      const newSet = new Set(state.favoriteRoomIds)
      newSet.delete(roomId)
      return { favoriteRoomIds: newSet }
    }),
    
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
}))