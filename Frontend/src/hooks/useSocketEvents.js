import { socket } from "@/lib/socket";
import { useEffect, useRef } from "react";
import useConversationStore from "@/stores/useConversationStore";
import useMessageStore from "@/stores/useMessageStore";
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
    }, [handlers]);
};

export const useSocketEvents = () => {
    const { activeConversationId } = useMessageStore();
    const { clearUnreadCount } = useConversationStore();
    const { currentUser } = useAuthStore();

    useEffect(() => {
        // All messages seen on select convesation, ack server with lastMessage
        if (
            !activeConversationId ||
            activeConversationId === null ||
            activeConversationId === undefined
        ) {
            return;
        }
        clearUnreadCount(activeConversationId);
        socket.emit("messages:seen", {
            conversationId: activeConversationId,
            userId: currentUser?.id,
        });
    }, [activeConversationId, currentUser]);

    useSocketListeners(useMessageHandlers());
    useSocketListeners(useCallHandlers());
};
