// import { create } from 'zustand';

// interface FavoriteState {
//   favoriteRoomIds: Set<string>;
//   setFavoriteRoomIds: (ids: string[]) => void;
//   addFavorite: (roomId: string) => void;
//   removeFavorite: (roomId: string) => void;
// }

// export const useFavoriteStore = create<FavoriteState>((set) => ({
//   favoriteRoomIds: new Set<string>(),

//   setFavoriteRoomIds: (ids) => set({ favoriteRoomIds: new Set(ids) }),

//   addFavorite: (roomId) =>
//     set((state) => {
//       const newSet = new Set(state.favoriteRoomIds);
//       newSet.add(roomId);
//       return { favoriteRoomIds: newSet };
//     }),

//   removeFavorite: (roomId) =>
//     set((state) => {
//       const newSet = new Set(state.favoriteRoomIds);
//       newSet.delete(roomId);
//       return { favoriteRoomIds: newSet };
//     }),
// }));


// import { create } from "zustand"

// interface FavoriteState {
//   favoriteRoomIds: Set<string>
//   isLoading: boolean
//   isInitialized: boolean
//   setFavoriteRoomIds: (ids: string[]) => void
//   addFavorite: (roomId: string) => void
//   removeFavorite: (roomId: string) => void
//   fetchFavorites: () => Promise<void>
//   initializeFavorites: () => Promise<void>
// }

// export const useFavoriteStore = create<FavoriteState>((set, get) => ({
//   favoriteRoomIds: new Set<string>(),
//   isLoading: false,
//   isInitialized: false,

//   setFavoriteRoomIds: (ids) =>
//     set({
//       favoriteRoomIds: new Set(ids),
//       isInitialized: true,
//     }),

//   addFavorite: (roomId) =>
//     set((state) => {
//       const newSet = new Set(state.favoriteRoomIds)
//       newSet.add(roomId)
//       return { favoriteRoomIds: newSet }
//     }),

//   removeFavorite: (roomId) =>
//     set((state) => {
//       const newSet = new Set(state.favoriteRoomIds)
//       newSet.delete(roomId)
//       return { favoriteRoomIds: newSet }
//     }),

//   fetchFavorites: async () => {
//     const { isLoading } = get()
//     if (isLoading) return

//     set({ isLoading: true })
//     try {
//       const res = await fetch("/api/favorites?page=0&size=1000")
//       if (res.ok) {
//         const data = await res.json()
//         const favoriteIds = data.content?.map((item: any) => item.id) || []
//         set({
//           favoriteRoomIds: new Set(favoriteIds),
//           isInitialized: true,
//         })
//       }
//     } catch (error) {
//       console.error("Failed to fetch favorites:", error)
//     } finally {
//       set({ isLoading: false })
//     }
//   },

//   initializeFavorites: async () => {
//     const { isInitialized, fetchFavorites } = get()
//     if (!isInitialized) {
//       await fetchFavorites()
//     }
//   },
// }))



// import { create } from "zustand"

// interface FavoriteState {
//   favoriteRoomIds: Set<string>
//   isLoading: boolean
//   isInitialized: boolean
//   setFavoriteRoomIds: (ids: string[]) => void
//   addFavorite: (roomId: string) => void
//   removeFavorite: (roomId: string) => void
//   fetchFavorites: () => Promise<void>
//   initializeFavorites: () => Promise<void>
// }

// export const useFavoriteStore = create<FavoriteState>((set, get) => ({
//   favoriteRoomIds: new Set<string>(),
//   isLoading: false,
//   isInitialized: false,

//   setFavoriteRoomIds: (ids) =>
//     set({
//       favoriteRoomIds: new Set(ids),
//       isInitialized: true,
//     }),

//   addFavorite: (roomId) =>
//     set((state) => {
//       const newSet = new Set(state.favoriteRoomIds)
//       newSet.add(roomId)
//       return { favoriteRoomIds: newSet }
//     }),

//   removeFavorite: (roomId) =>
//     set((state) => {
//       const newSet = new Set(state.favoriteRoomIds)
//       newSet.delete(roomId)
//       return { favoriteRoomIds: newSet }
//     }),

//   fetchFavorites: async () => {
//   // Không chạy trong quá trình build
//   if (typeof window === 'undefined') {
//     return;
//   }

//   const { isLoading } = get()
//   if (isLoading) return

//   set({ isLoading: true })
//   try {
//     // Sửa đường dẫn API
//     const res = await fetch("/api/user-dashboard/favorited-rooms?page=0&size=1000")
//     // const res = await fetch("/api/favorites?page=0&size=1000")

//     if (res.ok) {
//       const data = await res.json()
//       const favoriteIds = data.content?.map((item: { id: string }) => item.id) || []
//       set({
//         favoriteRoomIds: new Set(favoriteIds),
//         isInitialized: true,
//       })
//     }
//   } catch (error) {
//     console.error("Failed to fetch favorites:", error)
//   } finally {
//     set({ isLoading: false })
//   }
// },

//   initializeFavorites: async () => {
//     const { isInitialized, fetchFavorites } = get()
//     if (!isInitialized) {
//       await fetchFavorites()
//     }
//   },
// }))


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