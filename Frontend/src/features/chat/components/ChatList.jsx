import React, { useEffect, useMemo, useRef } from "react";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import {
    deriveMessageStatus,
    formatCallDuration,
    formatDateTime,
    isSameDate,
} from "@/utils/utils";
import useCallStore from "@/stores/useCallStore";
import CallBubble from "./CallBubble";
import useAutoScroll from "../hooks/useAutoScroll";
import { useMessages } from "../hooks/useMessages";
import { Loader } from "lucide-react";
import useMessageStore from "@/stores/useMessageStore";
import useUIStore from "@/stores/useUIStore";
import useActiveConversation from "../hooks/useActiveConversation";
import ConversationStart from "./ConversationStart";
import useMemberStore from "@/stores/useMemberStore";
import useMessageManager from "../hooks/useMessageManager";
import { sortTimelineItems } from "../utils/timelineUtils";
import ChatDivider from "./ChatDivider";

const ChatList = () => {
    const { activeConversationId, users, currentUser, selectedUserId } =
        useActiveConversation();
    const { resendMessage } = useMessageManager();
    const { loadInitial, loadMore } = useMessages();
    const { scrollDownRef, containerRef, captureScrollHeight } =
        useAutoScroll();

    const cursor = useMemberStore((s) => s.membersCursor[activeConversationId]);
    const { messages, isFetchingMore, hasMore } = useMessageStore();
    const { callHistory } = useCallStore();
    const typingUsers = useUIStore((state) => state.typingUsers);

    useEffect(() => {
        if (
            !activeConversationId ||
            String(activeConversationId).startsWith("temp-")
        )
            return;

        loadInitial(activeConversationId);
    }, [activeConversationId, loadInitial]);

    const chatItems = useMemo(() => {
        return sortTimelineItems([
            ...messages.map((msg) => ({
                type: "message",
                createdAt: msg.createdAt,
                data: msg,
            })),
            ...callHistory.map((call) => ({
                type: "call",
                createdAt: call.createdAt,
                data: call,
            })),
        ]);
    }, [messages, callHistory]);

    if (!messages) {
        return <p>Start a chat</p>;
    }

    const handleScroll = async () => {
        const el = containerRef.current;
        if (el.scrollTop <= 1 && hasMore && !isFetchingMore) {
            captureScrollHeight();
            await loadMore();
        }
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className='flex-1 flex flex-col p-3 space-y-1 overflow-y-auto overflow-x-hidden scroll-smooth py-20 md:pb-2 bg-[#FCFCFC] dark:text-white dark:bg-black'
        >
            <div className='mt-auto flex flex-col space-y-4 w-full'>
                {(!hasMore || messages.length === 0) && <ConversationStart />}
                {isFetchingMore && (
                    <p className='flex justify-center items-center text-zinc-700 dark:text-zinc-400 animate-spin'>
                        <Loader />
                    </p>
                )}

                {/* Chats appear here */}
                {chatItems.length > 0 &&
                    chatItems.map((item, idx) => {
                        const previousItem = chatItems[idx - 1];

                        const showDateBubble =
                            !previousItem ||
                            !isSameDate(
                                previousItem.data.createdAt,
                                item.data.createdAt,
                            );

                        const dividerText = showDateBubble
                            ? formatDateTime(item.data.createdAt, "relative")
                            : null;

                        return (
                            <React.Fragment
                                key={
                                    item.data._id ||
                                    item.data.clientMessageId ||
                                    item.data.clientCallId
                                }
                            >
                                {dividerText && (
                                    <ChatDivider value={dividerText} />
                                )}

                                {item.type === "message" ? (
                                    <ChatBubble
                                        user={users[selectedUserId]}
                                        isMine={
                                            item.data.senderId ===
                                            currentUser.id
                                        }
                                        content={item.data.content}
                                        type={item.type}
                                        time={item.data.createdAt}
                                        status={deriveMessageStatus(
                                            item.data,
                                            cursor,
                                        )}
                                        data={item.data}
                                        resend={resendMessage}
                                    />
                                ) : (
                                    <CallBubble
                                        isMine={
                                            item.data.callerId ===
                                            currentUser.id
                                        }
                                        user={users[selectedUserId]}
                                        time={formatDateTime(
                                            item.data.endedAt ||
                                                item.data.createdAt,
                                            "time",
                                        )}
                                        type={item.data.type}
                                        status={item.data.status}
                                        duration={formatCallDuration(
                                            item.data.startedAt,
                                            item.data.endedAt,
                                        )}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}

                {typingUsers[selectedUserId] && (
                    <TypingIndicator user={users[selectedUserId]} />
                )}
            </div>

            {/* Scroll anchor */}
            <div ref={scrollDownRef} />
        </div>
    );
};

export default ChatList;
