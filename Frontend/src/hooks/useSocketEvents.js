import { socket } from "@/lib/socket";
import { useEffect } from "react";
import useChatStore from "@/stores/useChatStore";
import { useMessageHandlers } from "./useMessageHandlers";
import { useCallHandlers } from "./useCallHandlers";

// Generic register/unregister for any handlers map
const useSocketListeners = (handlers) => {
    useEffect(() => {
        Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));
        return () =>
            Object.entries(handlers).forEach(([event, fn]) =>
                socket.off(event, fn),
            );
    }, []); // handlers are stable — defined outside render
};

export const useSocketEvents = () => {
    const { selectedUserId } = useChatStore();

    // Mark messages seen when switching conversations
    useEffect(() => {
        if (!selectedUserId) return;
        socket.emit("messages-seen", { senderId: selectedUserId });
    }, [selectedUserId]);

    useSocketListeners(useMessageHandlers());
    useSocketListeners(useCallHandlers());
};
