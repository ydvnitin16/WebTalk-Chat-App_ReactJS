import { create } from "zustand";

export const useChatStore = create((set) => ({
    conversations: [],
    messages: [],
    selectedUser: null,
    typingUsers: {},

    setConversations: (data) => set({ conversations: data }),

    setMessages: (msgs) => set({ messages: msgs }),

    addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

    setSelectedUser: (user) => set({ selectedUser: user }),

    setTyping: (userId, value) =>
        set((state) => ({
            typingUsers: { ...state.typingUsers, [userId]: value },
        })),
}));
