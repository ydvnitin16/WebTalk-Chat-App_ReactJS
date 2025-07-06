import React, { useState } from 'react';
import ChatHeader from './ChatHeader.jsx';
import MessageInput from './MessageInput.jsx';
import ChatBubble from './ChatBubble.jsx';
import { sendMessage } from '../../services/socket.js';
import { UseSelectedUserStore } from '../../stores/UseSelectedUserStore.jsx';

const ChatBox = () => {
    const [message, setMessage] = useState('');
    const selectedUser = UseSelectedUserStore((state) => state.selectedUser);

    if (!selectedUser) {
        return (
            <div className="hidden md:flex flex-1 items-center justify-center h-full text-gray-400 bg-white rounded-4xl md:rounded-none md:rounded-r-4xl  dark:bg-zinc-900 dark:text-white">
                Select a chat to start messaging
            </div>
        );
    }

    return (
        <main className="flex flex-col bg-white rounded-2xl md:rounded-none md:rounded-r-4xl flex-1 ">
            {/* Header */}
            <ChatHeader />

            {/* Chats */}
            <div
                className="flex-1 p-4 space-y-4 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-2
                 [&::-webkit-scrollbar-track]:rounded-full
               [&::-webkit-scrollbar-track]:bg-gray-100
                 [&::-webkit-scrollbar-thumb]:rounded-full
               [&::-webkit-scrollbar-thumb]:bg-gray-300
               dark:[&::-webkit-scrollbar-track]:bg-neutral-700
               dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 bg-white dark:text-white dark:bg-zinc-900"
            >
                <ChatBubble
                    user={selectedUser}
                    sender="me"
                    type="text"
                    message="Hello, how are you?"
                />
                <ChatBubble
                    user={selectedUser}
                    sender="other"
                    type="text"
                    message="Hey, I am good!"
                />
                <ChatBubble
                    user={selectedUser}
                    sender="me"
                    type="text"
                    message="Can you call me? Right Now!"
                />
                <ChatBubble
                    user={selectedUser}
                    sender="other"
                    type="text"
                    message="Is everthing Okay?"
                />
                <ChatBubble
                    user={selectedUser}
                    sender="me"
                    type="text"
                    message="yeah! Just to talk my sim has no recharge pack... that's why i am saying you to call me locally!"
                />
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
