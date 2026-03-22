import useChatStore from "@/stores/useChatStore";
import React from "react";
import ChatBubble from "./ChatBubble";
import useAuthStore from "@/stores/useAuthStore";
import TypingIndicator from "./TypingIndicator";
import { formatDateTime } from "@/services/utils";

const ChatList = () => {
    const { messages, selectedUserId, typingUsers, users } = useChatStore();
    const { currentUser } = useAuthStore();

    if (!messages) {
        return <p className=''>Start a chat</p>;
    }

    return (
        <div
            // ref={scrollContainerRef}
            // onScroll={handleScroll}
            className='flex-1 p-4 space-y-4 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-2 pb-14 md:pb-4
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                    bg-white dark:text-white dark:bg-zinc-900'
        >
            {/* Chats appear here */}

            {messages.length > 0 &&
                messages.map((message) => {
                    return (
                        <ChatBubble
                            key={message._id || message.tempId}
                            user={users[selectedUserId]}
                            isMine={message.sender === currentUser.id}
                            content={message.content}
                            type={message.type}
                            time={formatDateTime(message.createdAt)}
                            status={message.status}
                        />
                    );
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
