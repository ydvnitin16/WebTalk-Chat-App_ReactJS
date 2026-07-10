import React from "react";
import ChatHeader from "./ChatHeader";
import ChatList from "./ChatList";
import MessageInput from "./MessageInput";

const ChatBox = () => {
  return (
    <main className="flex flex-col bg-white dark:bg-zinc-900 rounded-2xl md:rounded-none border-none md:rounded-r-4xl flex-1 z-3 overflow-hidden">
      <ChatHeader />
      <ChatList />
      <MessageInput />
    </main>
  );
};

export default ChatBox;
