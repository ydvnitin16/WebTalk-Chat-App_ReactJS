import useChatStore from "@/stores/useChatStore";
import React from "react";
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

    if (!messages) {
        return <p className=''>Start a chat</p>;
    }

    return (
        <div
            // ref={scrollContainerRef}
            // onScroll={handleScroll}
            className='relative flex-1 p-4 space-y-4 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-2 pb-14 md:pb-4 
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                    bg-white dark:text-white dark:bg-zinc-950'
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
            {callHistory.length > 0 &&
                callHistory.map((call) => (
                    <CallBubble
                        isMine={call.caller === currentUser.id}
                        user={currentUser}
                        time={formatDateTime(call.endedAt)}
                        type={call.type}
                        key={call._id}
                        status={call.status}
                        duration={formatCallDuration(call.startedAt, call.endedAt)}
                    />
                ))}

            {typingUsers[selectedUserId] && (
                <TypingIndicator user={users[selectedUserId]} />
            )}
            {/* Scroll anchor */}
            {/* <div ref={scrollDownRef}></div> */}
        </div>
    );
};

export default ChatList;
