import useCallStore from "@/stores/useCallStore";
import useMessageStore from "@/stores/useMessageStore";
import useUIStore from "@/stores/useUIStore";
import { useEffect, useLayoutEffect, useRef } from "react";
import useActiveConversation from "./useActiveConversation";

const useAutoScroll = () => {
    const { messages, activeConversationId } = useMessageStore();
    const { selectedUserId } = useActiveConversation();
    const { typingUsers } = useUIStore();
    const { callHistory } = useCallStore();

    const containerRef = useRef(null);
    const scrollDownRef = useRef(null);
    const previousConversationId = useRef(null);
    const forceScrollOnceRef = useRef(false);
    const prevScrollHeightRef = useRef(0);
    const isTyping = typingUsers[selectedUserId] || false;

    const isNearBottom = () => {
        const el = containerRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    };

    useEffect(() => {
        if (previousConversationId.current !== activeConversationId) {
            previousConversationId.current = activeConversationId;
            forceScrollOnceRef.current = true;
        }
    }, [activeConversationId]);

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
    }, [messages.length, callHistory.length, isTyping]);

    const captureScrollHeight = () => {
        const el = containerRef.current;
        if (el) prevScrollHeightRef.current = el.scrollHeight;
    };

    return { containerRef, scrollDownRef, captureScrollHeight };
};

export default useAutoScroll;
