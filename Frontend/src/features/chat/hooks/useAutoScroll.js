import useChatStore from "@/stores/useChatStore";
import React, { useEffect, useRef } from "react";

const useAutoScroll = () => {
    const { messages, selectedUserId, typingUsers } = useChatStore();
    const scrollDownRef = useRef();

    useEffect(() => {
        scrollDownRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedUserId, typingUsers[selectedUserId]]);

    return { scrollDownRef };
};

export default useAutoScroll;
