import useChatStore from "@/stores/useChatStore";
import React, { useEffect, useMemo } from "react";
import ChatBubble from "./ChatBubble";
import useAuthStore from "@/stores/useAuthStore";
import TypingIndicator from "./TypingIndicator";
import { formatCallDuration, formatDateTime } from "@/services/utils";
import useCallStore from "@/stores/useCallStore";
import CallBubble from "./CallBubble";
import useAutoScroll from "../../hooks/useAutoScroll";
import { useMessages } from "../../hooks/useMessages";
import useResendMessage from "../../hooks/useResendMessage";
import { Loader } from "lucide-react";

const ChatList = () => {
    const {
        messages,
        selectedUserId,
        typingUsers,
        users,
        conversations,
        isFetching,
    } = useChatStore();
    const { callHistory } = useCallStore();
    const { currentUser } = useAuthStore();
    const { scrollDownRef, containerRef } = useAutoScroll();
    const { resendMessage } = useResendMessage();

    const { loadInitial, loadMore } = useMessages();

    const selectedConversation = conversations.find(
        (c) =>
            c.participants?.includes(selectedUserId) &&
            c.participants?.includes(currentUser?.id),
    );

    useEffect(() => {
        if (!selectedConversation?._id) return;

        loadInitial(selectedConversation._id);
    }, [selectedConversation?._id, loadInitial]);

    const chatItems = useMemo(() => {
        return [
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
        ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }, [messages, callHistory]);
    if (!messages) {
        return <p className=''>Start a chat</p>;
    }

    const handleScroll = async () => {
        const el = containerRef.current;

        if (el.scrollTop === 0) {
            const prevHeight = el.scrollHeight;

            await loadMore(); // fetch older messages

            requestAnimationFrame(() => {
                const newHeight = el.scrollHeight;
                el.scrollTop = newHeight - prevHeight;
            });
        }
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className='flex-1 flex-col p-3 space-y-4 overflow-y-auto overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:w-2 py-20 md:pb-2 
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                    bg-white dark:text-white dark:bg-zinc-950'
        >
            {/* Chats appear here */}
            {isFetching && (
                <p className='flex justify-center items-center '>
                    <Loader />
                </p>
            )}
            {chatItems.length > 0 &&
                chatItems.map((item, idx) => {
                    const isSame =
                        (chatItems[idx]?.data?.sender ||
                            chatItems[idx]?.data?.caller) ===
                        (chatItems[idx - 1]?.data?.sender ||
                            chatItems[idx - 1]?.data?.caller ||
                            null);

                    if (item.type === "message") {
                        return (
                            <ChatBubble
                                key={item.data._id || item.data.tempId}
                                user={users[selectedUserId]}
                                isMine={item.data.sender === currentUser.id}
                                content={item.data.content}
                                type={item.type}
                                time={item.data.createdAt}
                                status={item.data.status}
                                isSame={isSame}
                                data={item.data}
                                resend={resendMessage}
                            />
                        );
                    }
                    if (item.type === "call") {
                        return (
                            <CallBubble
                                isMine={item.data.caller === currentUser.id}
                                user={users[selectedUserId]}
                                time={formatDateTime(
                                    item.data?.endedAt || item.data?.createdAt,
                                )}
                                type={item.data.type}
                                key={item.data._id}
                                status={item.data.status}
                                duration={formatCallDuration(
                                    item.data?.startedAt,
                                    item.data?.endedAt,
                                )}
                                isSame={isSame}
                            />
                        );
                    }
                })}

            {typingUsers[selectedUserId] && (
                <TypingIndicator user={users[selectedUserId]} />
            )}

            {/* Scroll anchor */}
            <div ref={scrollDownRef} />
        </div>
    );
};

export default ChatList;
