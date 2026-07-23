import Button from "@/components/ui/Button";
import useConversationStore from "@/stores/useConversationStore";
import useMemberStore from "@/stores/useMemberStore";
import useMessageStore from "@/stores/useMessageStore";
import React from "react";

const ConversationStart = () => {
    const { users } = useMemberStore();
    const { getById } = useConversationStore();
    const { activeConversationId } = useMessageStore();
    const conversation = getById(activeConversationId);

    const user = users[conversation.otherUserId];

    return (
        <div className='flex flex-col justify-center  items-center gap-2'>
            <div>
                <img
                    src={user.avatar.url}
                    className='rounded-full h-25 w-25 object-cover'
                    alt='profile picture'
                />
            </div>
            <div className='flex flex-col items-center'>
                <div className='text-xl font-medium'>{user.name}</div>
                <div className='dark:text-zinc-500'>@{user.username}</div>
                <Button variant='secondary' className={"w-40 mt-1"}>
                    View Profile
                </Button>
            </div>
        </div>
    );
};

export default ConversationStart;
