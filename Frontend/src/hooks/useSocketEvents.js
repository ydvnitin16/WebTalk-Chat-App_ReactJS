import { socket } from "@/lib/socket";
import useChatStore from "@/stores/useChatStore.js";
import { useEffect } from "react";

export const useSocketEvents = (toast) => {
    const { addMessage, setTyping, selectedUser, setSelectedUser } =
        useChatStore();

    useEffect(() => {
        socket.on("user-online", (id) => {
            if (id === selectedUser?._id) {
                setSelectedUser({ ...selectedUser, isOnline: true });
            }
        });

        socket.on("user-offline", (id) => {
            if (id === selectedUser?._id) {
                setSelectedUser({
                    ...selectedUser,
                    isOnline: false,
                    lastSeen: new Date(),
                });
            }
        });

        socket.on("message", (message) => {
            addMessage(message);
        });

        socket.on("typing", (userId) => {
            setTyping(userId, true);
        });

        socket.on("stop-typing", (userId) => {
            setTyping(userId, false);
        });

        return () => {
            socket.off("message");
            socket.off("online");
            socket.off("offline");
            socket.off("typing");
            socket.off("stop-typing");
        };
    }, [addMessage, setTyping, selectedUser, setSelectedUser]);
};
