import React, { useCallback } from "react";
import useAuthStore from "@/stores/useAuthStore";
import ConversationListSkeleton from "@/components/skeletons/ConversationListSkeleton";
import useConversationStore from "@/stores/useConversationStore";
import useMemberStore from "@/stores/useMemberStore";
import useMessageStore from "@/stores/useMessageStore";
import { useConversations } from "../hooks/useConversations";
import ConversationCard from "./ConversationCard";

const ConversationList = () => {
    const { conversations } = useConversationStore();
    const { activeConversationId, setActiveConversation } = useMessageStore();
    const { users } = useMemberStore();
    const { currentUser } = useAuthStore();

    const { isLoading, error } = useConversations();

    const handleSelect = useCallback(
        (conversation) => {
            setActiveConversation(conversation._id);
        },
        [setActiveConversation],
    );

    if (isLoading) {
        return <ConversationListSkeleton />;
    }

    if (error) {
        return (
            <p className='flex justify-center items-center h-full'>
                Something went wrong
            </p>
        );
    }

    return (
        <div className='space-y-2 py-2 px-1.5 h-full'>
            {conversations.length > 0 ? (
                conversations?.map((conversation) => {
                    const conversationWith = conversation.otherUserId;

                    const user = users[conversationWith];
                    if (!user) return null;

                    return (
                        <ConversationCard
                            key={conversation._id || user._id}
                            user={user}
                            onClick={() => handleSelect(conversation)}
                            isSelected={
                                activeConversationId === conversation?._id
                            }
                            lastMessage={conversation?.lastMessage}
                            unreadCount={conversation?.unreadCount || 0}
                            currentUserId={currentUser?.id}
                        />
                    );
                })
            ) : (
                <p className='flex justify-center items-center h-full'>
                    Start your first conversation
                </p>
            )}
        </div>
    );
};

export default ConversationList;
