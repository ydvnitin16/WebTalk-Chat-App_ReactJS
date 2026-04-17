import { socket } from "@/lib/socket";
import { useEffect } from "react";
import useChatStore from "@/stores/useChatStore";
import { useMessageHandlers } from "./useMessageHandlers";
import { useCallHandlers } from "./useCallHandlers";
import useAuthStore from "@/stores/useAuthStore";

const useSocketListeners = (handlers) => {
    useEffect(() => {
        Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));
        return () =>
            Object.entries(handlers).forEach(([event, fn]) =>
                socket.off(event, fn),
            );
    }, []); // put socket event handler and off on unmount
};

export const useSocketEvents = () => {
    const { selectedUserId, updateConversationUnreadCount, conversations } =
        useChatStore();
    const { currentUser } = useAuthStore();

    // Mark messages seen when switching conversations
    useEffect(() => {
        if (!selectedUserId) return;

        const { _id: conversationId } = conversations.find(
            (conversation) =>
                conversation.participants?.includes(selectedUserId) &&
                conversation.participants?.includes(currentUser?.id),
        );

        socket.emit("messages-seen", { senderId: selectedUserId });
        updateConversationUnreadCount({
            conversationId,
            userId: selectedUserId,
            count: 0,
        });
    }, [selectedUserId, updateConversationUnreadCount]);

    useSocketListeners(useMessageHandlers());
    useSocketListeners(useCallHandlers());
};
