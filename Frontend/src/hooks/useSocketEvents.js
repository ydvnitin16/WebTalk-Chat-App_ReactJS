import { socket } from "@/lib/socket";
import useChatStore from "@/stores/useChatStore.js";
import { useEffect } from "react";

export const useSocketEvents = () => {
    const {
        addMessage,
        setTyping,
        setUserStatus,
        updateConversationLastMessage,
    } = useChatStore();

    useEffect(() => {
        const handleUserOnline = (id) => {
            setUserStatus(id, true);
        };

        const handleUserOffline = (id) => {
            setUserStatus(id, false);
        };

        const handleIncomingMessage = (message) => {
            addMessage(message);
            updateConversationLastMessage(message);
        };

        const handleTyping = (userId) => {
            setTyping(userId, true);
        };

        const handleStopTyping = (userId) => {
            setTyping(userId, false);
        };

        socket.on("user-online", handleUserOnline);
        socket.on("user-offline", handleUserOffline);
        socket.on("message", handleIncomingMessage);
        socket.on("typing", handleTyping);
        socket.on("stop-typing", handleStopTyping);

        return () => {
            socket.off("message", handleIncomingMessage);
            socket.off("user-online", handleUserOnline);
            socket.off("user-offline", handleUserOffline);
            socket.off("typing", handleTyping);
            socket.off("stop-typing", handleStopTyping);
        };
    }, [
        addMessage,
        setTyping,
        setUserStatus,
        updateConversationLastMessage,
    ]);
};
