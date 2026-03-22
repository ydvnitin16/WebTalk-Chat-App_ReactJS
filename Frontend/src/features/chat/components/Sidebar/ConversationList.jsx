import { useChatStore } from "@/stores/useChatStore";
import React from "react";
import ConversationCard from "./ConversationCard";
import useAuthStore from "@/stores/useAuthStore";

const ConversationList = () => {
    const { conversations, selectedUser, setSelectedUser } = useChatStore();
    const { currentUser } = useAuthStore();

    return (
        <div className='space-y-2 p-2 h-screen'>
            {conversations?.map((conversation) => {
                // extract user from participants array
                const conversationWith =
                    conversation.participants[0]._id === currentUser.id
                        ? conversation.participants[1]
                        : conversation.participants[0];

                return (
                    <ConversationCard
                        key={conversation._id}
                        user={conversationWith}
                        onClick={() => setSelectedUser(conversationWith)}
                        isSelected={selectedUser?._id === conversationWith._id}
                        lastMessage={conversation.lastMessage}
                    />
                );
            })}
        </div>
    );
};

export default ConversationList;

{
    /* <div
                    key={conversation._id}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer ${
                        selectedUser?.name === user.name
                            ? "bg-zinc-100 dark:bg-zinc-900"
                            : ""
                    }`}
                    onClick={() => {
                        setSelectedUser({
                            id: user._id,
                            name: user.name,
                            img: user.profilePic.url,
                            bio: user.bio,
                            isOnline: user.isOnline,
                            lastSeen: formatDateTime(user.lastSeen),
                        });
                    }}
                >
                    <div className='relative'>
                        <img
                            src={user.profilePic.url}
                            className='w-12 h-12 rounded-full'
                            alt='avatar'
                        />
                        {user.isOnline && (
                            <p className='absolute right-0 bottom-0 bg-green-600 h-3 w-3 rounded-full'></p>
                        )}
                    </div>
                    <div className='flex-1'>
                        <p className='font-medium text-gray-800 dark:text-white'>
                            {user.name}
                        </p>
                        <p className='text-xs text-gray-500 truncate dark:text-gray-300'>
                            {(() => {
                                const lastMsg = getLastMessage(
                                    messages,
                                    user,
                                    currentUser,
                                );
                                console.log(lastMsg);
                                return lastMsg &&
                                    lastMsg.lastMessage !== undefined
                                    ? `${lastMsg.sendedByYou} ${lastMsg.lastMessage}`
                                    : "Start a new chat";
                            })()}
                        </p>
                    </div>
                    <span className='text-xs text-gray-400'>
                        {(() => {
                            const lastMsg = getLastMessage(
                                messages,
                                user,
                                currentUser,
                            );
                            return lastMsg && lastMsg.createdAt
                                ? formatDateTime(lastMsg.createdAt)
                                : "";
                        })()}
                    </span>
                </div> */
}
