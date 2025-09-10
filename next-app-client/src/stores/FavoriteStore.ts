import { create } from "zustand"

interface FavoriteState {
  favoriteRoomIds: Set<string>
    favoriteCountMap: Record<string, number> 

  isLoading: boolean
  isInitialized: boolean
  
  // Actions đơn giản chỉ quản lý state
  setFavoriteRoomIds: (ids: string[]) => void
  addFavorite: (roomId: string) => void
  removeFavorite: (roomId: string) => void
  setLoading: (isLoading: boolean) => void
  setInitialized: (isInitialized: boolean) => void


  setFavoriteCount: (roomId: string, count: number) => void
  incrementFavoriteCount: (roomId: string) => void
  decrementFavoriteCount: (roomId: string) => void
  getFavoriteCount: (roomId: string) => number
  
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favoriteRoomIds: new Set<string>(),
  favoriteCountMap: {}, 
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

  //
  setFavoriteCount: (roomId: string, count: number) =>
    set((state) => ({
      favoriteCountMap: {
        ...state.favoriteCountMap,
        [roomId]: count,
      },
    })),

  incrementFavoriteCount: (roomId: string) =>
    set((state) => ({
      favoriteCountMap: {
        ...state.favoriteCountMap,
        [roomId]: (state.favoriteCountMap[roomId] || 0) + 1,
      },
    })),

  decrementFavoriteCount: (roomId: string) =>
    set((state) => ({
      favoriteCountMap: {
        ...state.favoriteCountMap,
        [roomId]: Math.max(0, (state.favoriteCountMap[roomId] || 0) - 1),
      },
    })),

  getFavoriteCount: (roomId: string) => {
    const state = get();
    return state.favoriteCountMap[roomId] || 0;
  },
}))