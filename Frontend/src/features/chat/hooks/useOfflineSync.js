import { useEffect } from "react";
import { socket } from "@/lib/socket";

const QUEUE_KEY = "chat_messages";

const useOfflineSync = () => {
    useEffect(() => {
        const flushQueue = () => {
            if (!socket.connected) return;
            
            const all = JSON.parse(localStorage.getItem(QUEUE_KEY)) || {};
            
            Object.entries(all).forEach(([conversationId, messages]) => {
                messages.forEach((msg) => {
                    socket.emit("message:send", {
                        content: msg.content,
                        conversationId: msg.conversation,
                        receiverId: msg.receiverId,
                        tempId: msg.tempId,
                    });
                });
            });
            // do NOT remove here — removal only happens in onMessageSendAck
            // re-emitting is safe as long as your server dedupes by tempId
        };

        window.addEventListener("online", flushQueue);

        return () => {
            window.removeEventListener("online", flushQueue);
        };
    }, []);
};

export default useOfflineSync;
