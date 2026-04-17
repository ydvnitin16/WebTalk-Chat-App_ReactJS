import useCallStore from "@/stores/useCallStore";
import useChatStore from "@/stores/useChatStore";
import { useEffect, useLayoutEffect, useRef } from "react";

const useAutoScroll = () => {
    const { messages, selectedUserId, typingUsers, isFetching } =
        useChatStore();
    const { callHistory } = useCallStore();

    const containerRef = useRef(null);
    const scrollDownRef = useRef(null);
    const previousSelectedUserIdRef = useRef(null);
    const forceScrollOnceRef = useRef(false);
    const prevScrollHeightRef = useRef(0);

    const isNearBottom = () => {
        const el = containerRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    };

    useEffect(() => {
        if (previousSelectedUserIdRef.current !== selectedUserId) {
            previousSelectedUserIdRef.current = selectedUserId;
            forceScrollOnceRef.current = true;
        }
    }, [selectedUserId]);

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        if (forceScrollOnceRef.current && messages.length > 0) {
            el.scrollTop = el.scrollHeight;
            forceScrollOnceRef.current = false;
            return;
        }

        if (prevScrollHeightRef.current > 0) {
            el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
            prevScrollHeightRef.current = 0;
            return;
        }

        if (isNearBottom()) {
            scrollDownRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length, callHistory.length, typingUsers[selectedUserId]]);

    const captureScrollHeight = () => {
        const el = containerRef.current;
        if (el) prevScrollHeightRef.current = el.scrollHeight;
    };

    return { containerRef, scrollDownRef, captureScrollHeight };
};

export default useAutoScroll;
