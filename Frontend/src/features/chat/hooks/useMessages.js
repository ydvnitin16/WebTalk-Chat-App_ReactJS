import { useCallback } from "react";
import { fetchConversationTimeline } from "../services/chat.api";
import useChatStore from "@/stores/useChatStore";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore from "@/stores/useCallStore";

export const useMessages = () => {
    const {
        conversations,
        selectedUserId,
        setMessages,
        prependMessages,
        setPagination,
        cursor,
        hasMore,
        isFetching,
        setFetching,
    } = useChatStore();
    const { setCallHistory, prependCallHistory } = useCallStore();
    const { currentUser } = useAuthStore();

    const selectedConversation = conversations.find(
        (conversation) =>
            conversation.participants?.includes(selectedUserId) &&
            conversation.participants?.includes(currentUser?.id),
    );

    const loadInitial = useCallback(
        async (conversationId = selectedConversation?._id) => {
            if (!conversationId) return;

            setFetching(true);

            try {
                const data = await fetchConversationTimeline(
                    conversationId,
                    null,
                    20,
                );

                setMessages(data.messages);
                setCallHistory(data.calls);
                setPagination({
                    cursor: data.nextCursor,
                    hasMore: data.hasMore,
                });
            } finally {
                setFetching(false);
            }
        },
        [
            selectedConversation?._id,
            setFetching,
            setMessages,
            setPagination,
            setCallHistory,
        ],
    );

    const loadMore = useCallback(async () => {
        if (!selectedConversation?._id || !hasMore || isFetching) return;

        setFetching(true);

        try {
            const data = await fetchConversationTimeline(
                selectedConversation._id,
                cursor,
                20,
            );

            prependMessages(data.messages);
            prependCallHistory(data.calls);

            setPagination({
                cursor: data.nextCursor,
                hasMore: data.hasMore,
            });
        } finally {
            setFetching(false);
        }
    }, [
        selectedConversation?._id,
        hasMore,
        isFetching,
        cursor,
        prependMessages,
        prependCallHistory,
        setPagination,
        setFetching,
    ]);

    return { loadInitial, loadMore };
};
