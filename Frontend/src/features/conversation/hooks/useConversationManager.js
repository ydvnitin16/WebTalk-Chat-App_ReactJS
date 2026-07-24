import { useCallback, useEffect, useState } from "react";
import useConversationStore from "@/stores/useConversationStore";
import useMemberStore from "@/stores/useMemberStore";
import useMessageStore from "@/stores/useMessageStore";
import { fetchConversations } from "../services/conversation.api";
import { normalizeConversations } from "@/utils/utils";

export const useConversationManager = () => {
    const { setConversations, addConversation } = useConversationStore();
    const { setUsers, setCursors, addUser, addCursor } = useMemberStore();
    const { setActiveConversation } = useMessageStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load conversations when user arrive
    const loadConversations = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);

            const data = await fetchConversations();
            if (!data.success) {
                throw new Error(data.message || "Something went wrong");
            }

            const { conversations, users, cursors } = normalizeConversations(
                data.conversations,
            );

            setConversations(conversations);
            setUsers(users);
            setCursors(cursors);
        } catch (err) {
            console.log(err);
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }, [setConversations, setUsers, setCursors]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Handle starting new conversations - Store in the stores (Zustand)
    const startConversation = useCallback(
        (user) => {
            const tempConversationId = `temp-${Date.now()}`;

            addConversation({
                _id: tempConversationId,
                tempConversationId,
                otherUserId: user._id,
                lastActivity: new Date().toISOString(),
                lastMessage: null,
                unreadCount: 0,
            });

            addUser(user);
            setActiveConversation(tempConversationId);
        },
        [addConversation, addUser, addCursor, setActiveConversation],
    );

    const selectConversation = useCallback(
        (conversationId) => setActiveConversation(conversationId),
        [setActiveConversation],
    );

    return {
        isLoading,
        error,
        loadConversations,
        startConversation,
        selectConversation,
    };
};
