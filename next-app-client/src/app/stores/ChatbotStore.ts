import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface ItemChatBot {
    content: string;
    role: 'user' | 'assistant';
    time: number;
}
interface ChatbotStore {
    messages: ItemChatBot[];
    addMessage: (message: ItemChatBot) => void;
    removeMessage: (id: string) => void;
    clearMessages: () => void;
}
