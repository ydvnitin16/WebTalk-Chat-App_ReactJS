import { socket } from "@/lib/socket";
import { useEffect, useRef } from "react";
import useMessageManager from "./useMessageManager";

const useTyping = (receiverId) => {
    const typingTimeout = useRef(null);
    const isTyping = useRef(false);

    const { emitTypingStart, emitTypingStop } = useMessageManager();

    const handleTyping = () => {
        if (!receiverId) return;

        if (!isTyping.current) {
            emitTypingStart(receiverId);
            isTyping.current = true;
        }

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            emitTypingStop(receiverId);
            isTyping.current = false;
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }

            if (receiverId && isTyping.current) {
                emitTypingStop(receiverId);
                isTyping.current = false;
            }
        };
    }, [receiverId]);

    return { handleTyping };
};

export default useTyping;
