import { RoomInUser } from '@/types/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface ItemRoom {
    room: RoomInUser;
}

interface CompareStore {
    items: ItemRoom[];
    addItem: (item: ItemRoom) => void;
    removeItem: (key: string) => void;
    clearItems: () => void;
}

export const useCompareStore = create<CompareStore>()(
    devtools(
        persist(
            (set) => ({
                items: [],
                addItem: (item) => set((state) => ({ items: [...state.items, item] })),
                removeItem: (key) => set((state) => ({ items: state.items.filter(item => item.room.id !== key) })),
                clearItems: () => set({ items: [] }),
            }),
            { name: 'compare-store' }
        )
    )
);
