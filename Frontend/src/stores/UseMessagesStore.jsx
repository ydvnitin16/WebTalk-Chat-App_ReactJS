import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const UseMessagesStore = create(
    persist(
        (set, get) => ({
            messages: [],

            setMessage: (data) => {
                console.log(data);
                set({ messages: [...get().messages, data] });
            },
        }),
        { name: 'messages' }
    )
);

export { UseMessagesStore };
