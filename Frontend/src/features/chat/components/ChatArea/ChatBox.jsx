import { useChatStore } from "@/stores/useChatStore";
import React from "react";
import ChatHeader from "./ChatHeader";
import ChatList from "./ChatList";
import MessageInput from "./MessageInput";

const ChatBox = () => {
    const { selectedUser } = useChatStore();

    // If no chat is selected
    if (!selectedUser) {
        return (
            <div className='hidden md:flex flex-1 items-center justify-center h-full text-gray-400 bg-white rounded-4xl border-none md:rounded-none md:rounded-r-4xl dark:bg-zinc-900 dark:text-white'>
                Select a chat to start messaging
            </div>
        );
    }

    return (
        <main className='flex flex-col bg-white dark:bg-zinc-900 rounded-2xl md:rounded-none border-none md:rounded-r-4xl flex-1 z-50'>
            <ChatHeader />
            <ChatList />
            <MessageInput />
        </main>
    );
};

export default ChatBox;
