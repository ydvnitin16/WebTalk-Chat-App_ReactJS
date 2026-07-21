import { formatDateTime } from "@/utils/utils";
import React, { useMemo } from "react";
import { optimizeUrl } from "@/utils/imageOptimization";

const ConversationCard = ({
    user,
    isSelected,
    onClick,
    lastMessage,
    unreadCount = 0,
    currentUserId,
    isNew = false,
}) => {
    const formattedTime = useMemo(() => {
        return formatDateTime(lastMessage?.createdAt);
    }, [lastMessage?.createdAt]);

    return (
        <div
            className={`flex items-center gap-3 p-2 rounded-4xl cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 ${
                isSelected ? "bg-zinc-100 dark:bg-zinc-900" : ""
            }`}
            onClick={() => onClick(user)}
        >
            <div className='relative flex-shrink-0'>
                <img
                    loading='lazy'
                    src={optimizeUrl(user.avatar?.url, "medium")}
                    className='w-13 h-13 rounded-full object-cover'
                    alt={`${user.name} avatar`}
                />
                {user.isOnline && (
                    <span className='absolute right-0 bottom-0 bg-emerald-600 h-4 w-4 rounded-full border-2 border-white dark:border-black'></span>
                )}
            </div>

            <div className='flex-1 min-w-0'>
                <div className='flex justify-between items-center text-lg font-medium text-gray-800 dark:text-white'>
                    <span>
                        {user.name}{" "}
                        {isNew && (
                            <span className='text-sm italic text-zinc-500'>
                                - {`@${user.username}`}
                            </span>
                        )}
                    </span>
                    <div className='flex items-center gap-2'>
                        {lastMessage && (
                            <span className='text-xs text-gray-400'>
                                {formattedTime}
                            </span>
                        )}
                        {unreadCount > 0 && (
                            <span className='min-w-5 h-5 px-1 rounded-full bg-[#007AFF] text-white text-[11px] flex items-center justify-center'>
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </div>
                </div>

                <p className='text-sm text-gray-500 truncate dark:text-gray-400 w-full'>
                    {lastMessage
                        ? `${lastMessage.senderId === currentUserId ? "You: " : ""}${lastMessage.content}`
                        : "Start a new chat"}
                </p>
            </div>
        </div>
    );
};

export default React.memo(ConversationCard);
