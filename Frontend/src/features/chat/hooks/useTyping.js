import { socket } from "@/lib/socket";
import { useEffect, useRef } from "react";

const useTyping = (receiverId) => {
    const typingTimeout = useRef(null);
    const isTyping = useRef(false);

    const handleTyping = () => {
        if (!receiverId) return;

        if (!isTyping.current) {
            socket.emit("typing", receiverId);
            isTyping.current = true;
        }

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            socket.emit("stop-typing", receiverId);
            isTyping.current = false;
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }

            if (receiverId && isTyping.current) {
                socket.emit("stop-typing", receiverId);
                isTyping.current = false;
            }
        };
    }, [receiverId]);

    return { handleTyping };
};

export default useTyping;
