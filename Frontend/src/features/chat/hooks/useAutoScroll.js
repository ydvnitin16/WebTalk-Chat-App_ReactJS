import useCallStore from "@/stores/useCallStore";
import useChatStore from "@/stores/useChatStore";
import { useLayoutEffect, useRef } from "react";

const useAutoScroll = () => {
    const { messages, selectedUserId, typingUsers } = useChatStore();
    const { callHistory } = useCallStore();

    const containerRef = useRef(null);
    const scrollDownRef = useRef(null);
    const previousSelectedUserIdRef = useRef(null);
    const shouldForceScrollRef = useRef(false);

    // helper
    const isNearBottom = () => {
        const el = containerRef.current;
        if (!el) return true;

        return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    };

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const hasConversationChanged =
            previousSelectedUserIdRef.current !== selectedUserId;
        previousSelectedUserIdRef.current = selectedUserId;

        if (hasConversationChanged) {
            shouldForceScrollRef.current = true;
        }

        if (shouldForceScrollRef.current) {
            requestAnimationFrame(() => {
                const scrollContainer = containerRef.current;
                if (!scrollContainer) return;

                scrollContainer.scrollTop = scrollContainer.scrollHeight;
                scrollDownRef.current?.scrollIntoView({
                    block: "end",
                });
            });

            shouldForceScrollRef.current = false;
            return;
        }

        // only scroll if already near bottom
        if (isNearBottom()) {
            scrollDownRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }
    }, [
        messages.length,
        callHistory.length,
        typingUsers[selectedUserId],
        selectedUserId,
    ]);

    return { containerRef, scrollDownRef };
};

export default useAutoScroll;
