import { create } from "zustand";
import { persist } from "zustand/middleware";

const useFailedMessagesStore = create(
    persist(
        (set) => ({
            failedByConversation: {},

            addFailed: (conversationId, clientMessageId, payload) =>
                set((state) => ({
                    failedByConversation: {
                        ...state.failedByConversation,
                        [conversationId]: {
                            ...(state.failedByConversation[conversationId] ||
                                {}),
                            [clientMessageId]: payload,
                        },
                    },
                })),

            removeFailed: (conversationId, clientMessageId) =>
                set((state) => {
                    const conversationFailures = {
                        ...(state.failedByConversation[conversationId] || {}),
                    };
                    delete conversationFailures[clientMessageId];

                    return {
                        failedByConversation: {
                            ...state.failedByConversation,
                            [conversationId]: conversationFailures,
                        },
                    };
                }),
        }),
        { name: "message-failed-outbox" },
    ),
);

export default useFailedMessagesStore;
