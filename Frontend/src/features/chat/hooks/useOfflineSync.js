import { useEffect } from "react";
import { getQueue, removeFromQueue } from "@/utils/offlineQueue";
import { socket } from "@/lib/socket";

const useOfflineSync = () => {
    useEffect(() => {
        const handleOnline = async () => {
            const queue = getQueue();

            for (const msg of queue) {
                socket.emit("send-message", {
                    content: msg.content,
                    sendTo: msg.receiver,
                    tempId: msg.tempId,
                });

                removeFromQueue(msg.tempId);
            }
        };

        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("online", handleOnline);
        };
    }, []);
};

export default useOfflineSync;
