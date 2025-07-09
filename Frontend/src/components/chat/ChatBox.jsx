import React, { useEffect, useRef, useState } from 'react';
import ChatHeader from './ChatHeader.jsx';
import MessageInput from './MessageInput.jsx';
import ChatBubble from './ChatBubble.jsx';
import { sendMessage } from '../../services/useSocketEvents.js';
import { UseSelectedUserStore } from '../../stores/UseSelectedUserStore.jsx';
import { UseMessagesStore } from '../../stores/UseMessagesStore.jsx';
import { UseAuthStore } from '../../stores/UseAuthStore.jsx';

const ChatBox = () => {
    const [message, setMessage] = useState('');
    const selectedUser = UseSelectedUserStore((state) => state.selectedUser);
    const userStore = UseAuthStore((state) => state.userStore);
    const messages = UseMessagesStore((state) => state.messages);
    const scrollDownRef = useRef(null);

    useEffect(() => {
        if (scrollDownRef.current) {
            scrollDownRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (scrollDownRef.current) {
            scrollDownRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [selectedUser]);

    if (!selectedUser) {
        return (
            <div className="hidden md:flex flex-1 items-center justify-center h-full text-gray-400 bg-white rounded-4xl border-none md:rounded-none md:rounded-r-4xl  dark:bg-zinc-900 dark:text-white">
                Select a chat to start messaging
            </div>
        );
    }

    return (
        <main className="flex flex-col bg-white rounded-2xl md:rounded-none border-none md:rounded-r-4xl flex-1 ">
            {/* Header */}
            <ChatHeader />

            {/* Chats */}
            <div
                className="flex-1 p-4 space-y-4 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-2 pb-14 md:pb-4
                 [&::-webkit-scrollbar-track]:rounded-full
               [&::-webkit-scrollbar-track]:bg-gray-100
                 [&::-webkit-scrollbar-thumb]:rounded-full
               [&::-webkit-scrollbar-thumb]:bg-gray-300
               dark:[&::-webkit-scrollbar-track]:bg-neutral-700
               dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 bg-white dark:text-white dark:bg-zinc-900"
            >
                {messages &&
                    messages
                        .filter(
                            (msg) =>
                                (msg.sender === selectedUser.id &&
                                    msg.receiver === userStore?.id) ||
                                (msg.receiver === selectedUser.id &&
                                    msg.sender === userStore?.id)
                        )
                        .map((msg, idx) => (
                            <ChatBubble
                                key={idx}
                                user={selectedUser}
                                sender={
                                    msg?.sender === userStore?.id
                                        ? 'me'
                                        : 'other'
                                }
                                type="text"
                                message={msg?.message}
                            />
                        ))}
                <div className={`flex items-start gap-3 pl-11.5`}>
                    <div className="rounded-xl text-sm max-w-sm p-3 bg-zinc-200 dark:text-black text-left">
                        {/* <div class="bg-[#E6F8F1] px-7 py-4 rounded-[20px] rounded-bl-[2px] inline-block"> */}
                            <div className="flex items-center py-0.5 px-2">
                                <span className="dot w-[7px] h-[7px] bg-[#6CAD96] rounded-full mr-1 animate-mercury delay-[200ms]"></span>
                                <span className="dot w-[7px] h-[7px] bg-[#6CAD96] rounded-full mr-1 animate-mercury delay-[300ms]"></span>
                                <span className="dot w-[7px] h-[7px] bg-[#6CAD96] rounded-full animate-mercury delay-[400ms]"></span>
                            </div>
                        </div>
                    {/* </div> */}
                </div>
                <div ref={scrollDownRef}></div>
            </div>

            {/* Input */}
            <MessageInput
                room={selectedUser.id}
                message={message}
                setMessage={setMessage}
                onSend={sendMessage}
            />
        </main>
    );
};

export default ChatBox;
