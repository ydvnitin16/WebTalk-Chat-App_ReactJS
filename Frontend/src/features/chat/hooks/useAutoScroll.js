import useCallStore from "@/stores/useCallStore";
import useChatStore from "@/stores/useChatStore";
import React, { useEffect, useRef } from "react";

const useAutoScroll = () => {
    const { messages, selectedUserId, typingUsers } = useChatStore();
    const { callsHistory } = useCallStore();
    const scrollDownRef = useRef();

    useEffect(() => {
        scrollDownRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, selectedUserId, typingUsers[selectedUserId], callsHistory]);

    return { scrollDownRef };
};

export default useAutoScroll;
