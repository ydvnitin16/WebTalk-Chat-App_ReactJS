import useChatStore from "@/stores/useChatStore";
import React, { useMemo } from "react";
import ChatBubble from "./ChatBubble";
import useAuthStore from "@/stores/useAuthStore";
import TypingIndicator from "./TypingIndicator";
import { formatCallDuration, formatDateTime } from "@/services/utils";
import useCallStore from "@/stores/useCallStore";
import CallBubble from "./CallBubble";

const ChatList = () => {
    const { messages, selectedUserId, typingUsers, users } = useChatStore();
    const { callHistory } = useCallStore();
    const { currentUser } = useAuthStore();

    const chatItems = useMemo(() => {
        return [
            ...messages.map((msg) => ({
                type: "message",
                createdAt: msg.createdAt,
                data: msg,
            })),
            ...callHistory.map((call) => ({
                type: "call",
                createdAt: call.endedAt || call.startedAt,
                data: call,
            })),
        ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }, [messages, callHistory]);

    if (!messages) {
        return <p className=''>Start a chat</p>;
    }

    return (
        <div
            // ref={scrollContainerRef}
            // onScroll={handleScroll}
            className='relative flex-1 p-4 space-y-4 overflow-y-auto overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:w-2 pb-14 md:pb-4 
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                    bg-white dark:text-white dark:bg-zinc-950'
        >
            {/* Chats appear here */}

            {chatItems.length > 0 &&
                chatItems.map((item) => {
                    if (item.type === "message") {
                        return (
                            <ChatBubble
                                key={item.data._id || item.data.tempId}
                                user={users[selectedUserId]}
                                isMine={item.data.sender === currentUser.id}
                                content={item.data.content}
                                type={item.type}
                                time={formatDateTime(item.data.createdAt)}
                                status={item.data.status}
                            />
                        );
                    }
                    if (item.type === "call") {
                        return (
                            <CallBubble
                                isMine={item.data.caller === currentUser.id}
                                user={currentUser}
                                time={formatDateTime(item.data.endedAt)}
                                type={item.data.type}
                                key={item.data._id}
                                status={item.data.status}
                                duration={formatCallDuration(
                                    item.data.startedAt,
                                    item.data.endedAt,
                                )}
                            />
                        );
                    }
                })}

            {typingUsers[selectedUserId] && (
                <TypingIndicator user={users[selectedUserId]} />
            )}
            {/* Scroll anchor */}
            {/* <div ref={scrollDownRef}></div> */}
        </div>
    );
};

export default ChatList;
