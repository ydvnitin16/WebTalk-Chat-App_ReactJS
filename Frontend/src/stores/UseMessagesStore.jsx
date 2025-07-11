import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchMessages } from '../services/fetchMessages.js';

const UseMessagesStore = create(
    persist(
        (set, get) => ({
            messages: [],

            fetchMessages: async () => {
                const messages = await fetchMessages()
                set({messages: messages})
            },

            setMessage: (data) => {
                set({ messages: [...get().messages, data] });
            },
        }),
        { name: 'messages'}
    )
);

export { UseMessagesStore };
