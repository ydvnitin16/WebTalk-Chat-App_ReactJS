import useChatStore from "@/stores/useChatStore";
import React from "react";
import ConversationCard from "./ConversationCard";
import useAuthStore from "@/stores/useAuthStore";

const ConversationList = () => {
    const { conversations, selectedUserId, setSelectedUserId, users } =
        useChatStore();
    const { currentUser } = useAuthStore();

    return (
        <div className='space-y-2 p-2 h-screen'>
            {conversations?.map((conversation) => {
                // extract user from participants array
                const conversationWith =
                    conversation.participants[0] === currentUser.id
                        ? conversation.participants[1]
                        : conversation.participants[0];
                const user = users[conversationWith];
                if (!user) return null;
                return (
                    <ConversationCard
                        key={conversation._id || user._id}
                        user={user}
                        onClick={() => setSelectedUserId(conversationWith)}
                        isSelected={selectedUserId === conversationWith}
                        lastMessage={conversation.lastMessage}
                    />
                );
            })}
        </div>
    );
};

export default ConversationList;
