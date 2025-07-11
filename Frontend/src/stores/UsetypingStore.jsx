import { create } from 'zustand';

const UseTypingStore = create((set, get) => ({
    typingStatus: {},
    setTypingStatus: (userId, status) => {
        const currentStates = get().typingStatus;
        set({ typingStatus: { ...currentStates, [userId]: status } });
    },
    clearTypingStatus: (userId) => {
        const newState = get().typingStatus;
        const updated = {...newState}
        delete updated[userId];
        set({ typingStatus: updated });
    },
}));

export { UseTypingStore };
