import { useCallback } from "react";
import { fetchConversationTimeline } from "../services/chat.api";
import useMessageStore from "@/stores/useMessageStore";
import useCallStore from "@/stores/useCallStore";
import { normalizeMessage } from "@/utils/utils";

export const useMessages = () => {
    const {
        activeConversationId,
        setMessages,
        prependMessages,
        setPagination,
        cursor,
        hasMore,
        isFetchingMore,
        setFetchingMore,
    } = useMessageStore();
    const { setCallHistory, prependCallHistory } = useCallStore();

    const loadInitial = useCallback(
        async (conversationId = activeConversationId) => {
            if (!conversationId) return;
            setMessages(null);
            setCallHistory(null);
            setFetchingMore(true);

            try {
                const data = await fetchConversationTimeline(
                    conversationId,
                    null,
                    20,
                );
                console.log(data)
                const messages = data.timeline.filter(
                    (t) => t.itemType === "message",
                );
                const calls = data.timeline.filter(
                    (t) => t.itemType === "call",
                );
                setMessages((messages || []).map(normalizeMessage));
                setCallHistory(calls);
                setPagination({
                    cursor: data.nextCursor,
                    hasMore: data.hasMore,
                });
            } finally {
                setFetchingMore(false);
            }
        },
        [
            activeConversationId,
            setFetchingMore,
            setMessages,
            setPagination,
            setCallHistory,
        ],
    );

    const loadMore = useCallback(async () => {
        if (!activeConversationId || !hasMore || isFetchingMore) return;

        setFetchingMore(true);

        try {
            const data = await fetchConversationTimeline(
                activeConversationId,
                cursor,
                20,
            );

            const messages = data.timeline.filter(
                (t) => t.itemType === "message",
            );
            const calls = data.timeline.filter((t) => t.itemType === "call");

            prependMessages((messages || []).map(normalizeMessage));
            prependCallHistory(calls);

            setPagination({
                cursor: data.nextCursor,
                hasMore: data.hasMore,
            });
        } finally {
            setFetchingMore(false);
        }
    }, [
        activeConversationId,
        hasMore,
        isFetchingMore,
        cursor,
        prependMessages,
        prependCallHistory,
        setPagination,
        setFetchingMore,
    ]);

    return { loadInitial, loadMore };
};
