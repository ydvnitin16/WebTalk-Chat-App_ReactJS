import { create } from "zustand";

const useUIStore = create((set, get) => ({
    typingUsers: {},
    drafts: {},

    setTyping: (userId, isTyping) =>
        set((state) => ({
            typingUsers: { ...state.typingUsers, [userId]: isTyping },
        })),

    setDraft: (conversationId, text) =>
        set((state) => ({
            drafts: { ...state.drafts, [conversationId]: text },
        })),

    getDraft: (conversationId) => get().drafts[conversationId] || "",

    clearDraft: (conversationId) =>
        set((state) => {
            const drafts = { ...state.drafts };
            delete drafts[conversationId];
            return { drafts };
        }),
}));

export default useUIStore;
