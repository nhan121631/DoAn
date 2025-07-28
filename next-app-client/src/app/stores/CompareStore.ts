import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { RoomData } from '../landlord/types';

export interface ItemRoom {
    room: RoomData;
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
                removeItem: (key) => set((state) => ({ items: state.items.filter(item => item.room.key !== key) })),
                clearItems: () => set({ items: [] }),
            }),
            { name: 'compare-store' }
        )
    )
);
