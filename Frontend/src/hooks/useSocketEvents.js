import { socket } from "@/lib/socket";
import { useEffect } from "react";
import useConversationStore from "@/stores/useConversationStore";
import useMessageStore from "@/stores/useMessageStore";
import { useMessageHandlers } from "./useMessageHandlers";
import { useCallHandlers } from "./useCallHandlers";
import useAuthStore from "@/stores/useAuthStore";
import { useMessageQueue } from "@/features/chat/hooks/useMessageQueue";

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
    const { activeConversationId, clear } = useMessageStore();
    const { clearUnreadCount } = useConversationStore();
    const { currentUser } = useAuthStore();
    const { resumeAllQueues } = useMessageQueue();

    useEffect(() => {
        if (socket.connected) resumeAllQueues();

        socket.on("connect", resumeAllQueues);
        return () => socket.off("connect", resumeAllQueues);
    }, [resumeAllQueues]);

    useEffect(() => {
        // update in the window history on active conversationId
        const handlePopState = () => {
            if (activeConversationId) {
                clear();
            }
        };
        if (!activeConversationId) return;

        window.history.pushState({ conversation: activeConversationId }, "");
        window.addEventListener("popstate", handlePopState);

        // All messages seen on select convesation, ack server with lastMessage
        if (
            !activeConversationId ||
            activeConversationId === null ||
            activeConversationId === undefined
        ) {
            return;
        }

        if (String(activeConversationId).startsWith("temp-")) {
            return;
        }
        clearUnreadCount(activeConversationId);
        socket.emit("messages:seen", {
            conversationId: activeConversationId,
            userId: currentUser?.id,
        });

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [activeConversationId, clear, clearUnreadCount, currentUser]);

    useSocketListeners(useMessageHandlers());
    useSocketListeners(useCallHandlers());
};
