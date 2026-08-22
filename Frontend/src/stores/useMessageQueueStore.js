import { create } from "zustand";
import { persist } from "zustand/middleware";

const useMessageQueueStore = create(
    persist(
        (set, get) => ({
            queues: {},
            items: {},
            sending: {},

            enqueue: (conversationId, clientMessageId, payload) =>
                set((state) => {
                    const queue = state.queues[conversationId] || [];
                    const alreadyQueued = queue.includes(clientMessageId);

                    return {
                        queues: {
                            ...state.queues,
                            [conversationId]: alreadyQueued
                                ? queue
                                : [...queue, clientMessageId],
                        },
                        items: {
                            ...state.items,
                            [clientMessageId]: {
                                payload,
                                attempts:
                                    state.items[clientMessageId]?.attempts ?? 0,
                            },
                        },
                    };
                }),

            dequeue: (conversationId, clientMessageId) =>
                set((state) => {
                    const { [clientMessageId]: _removed, ...restItems } =
                        state.items;

                    return {
                        queues: {
                            ...state.queues,
                            [conversationId]: (
                                state.queues[conversationId] || []
                            ).filter((id) => id !== clientMessageId),
                        },
                        items: restItems,
                    };
                }),

            incrementAttempts: (clientMessageId) =>
                set((state) => {
                    const item = state.items[clientMessageId];
                    if (!item) return state;

                    return {
                        items: {
                            ...state.items,
                            [clientMessageId]: {
                                ...item,
                                attempts: item.attempts + 1,
                            },
                        },
                    };
                }),

            setSending: (conversationId, value) =>
                set((state) => ({
                    sending: { ...state.sending, [conversationId]: value },
                })),

            peekNext: (conversationId) => {
                const clientMessageId = (get().queues[conversationId] || [])[0];
                return clientMessageId
                    ? { clientMessageId, ...get().items[clientMessageId] }
                    : null;
            },

            isSending: (conversationId) => !!get().sending[conversationId],

            hasItem: (clientMessageId) => !!get().items[clientMessageId],

            allConversationIds: () =>
                Object.keys(get().queues).filter(
                    (id) => get().queues[id]?.length > 0,
                ),
        }),
        {
            name: "message-outbox-queue",
            partialize: (state) => ({
                queues: state.queues,
                items: state.items,
            }),
        },
    ),
);

export default useMessageQueueStore;
