import { socket } from "@/lib/socket";
import { useEffect } from "react";
import useChatStore from "@/stores/useChatStore";
import { useMessageHandlers } from "./useMessageHandlers";
import { useCallHandlers } from "./useCallHandlers";

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
    const { selectedUserId } = useChatStore();

    // Mark messages seen when switching conversations
    useEffect(() => {
        if (!selectedUserId) return;
        socket.emit("messages-seen", { senderId: selectedUserId });
    }, [selectedUserId]);

    useSocketListeners(useMessageHandlers());
    useSocketListeners(useCallHandlers());
};
