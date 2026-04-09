import useChatStore from "@/stores/useChatStore";
import React, { useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatList from "./ChatList";
import MessageInput from "./MessageInput";
import { useMessages } from "../../hooks/useMessages";
import useAuthStore from "@/stores/useAuthStore";

const ChatBox = () => {
    const { selectedUserId, conversations } = useChatStore();
    const { currentUser } = useAuthStore();
    const { loadInitial } = useMessages();

    const selectedConversation = conversations.find(
        (c) =>
            c.participants?.includes(selectedUserId) &&
            c.participants?.includes(currentUser?.id),
    );

    useEffect(() => {
        if (!selectedConversation?._id) return;

        loadInitial(selectedConversation._id);
    }, [selectedConversation?._id, loadInitial]);
    
    // If no chat is selected
    if (!selectedUserId) {
        return (
            <div className='hidden md:flex flex-1 items-center justify-center h-full text-gray-400 bg-white rounded-4xl border-none md:rounded-none md:rounded-r-4xl dark:bg-zinc-900 dark:text-white'>
                Select a chat to start messaging
            </div>
        );
    }
    return (
        <main className='flex flex-col bg-white dark:bg-zinc-900 rounded-2xl md:rounded-none border-none md:rounded-r-4xl flex-1 z-50 overflow-hidden'>
            <ChatHeader />
            <ChatList />
            <MessageInput />
        </main>
    );
};

export default ChatBox;
