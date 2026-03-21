import React from "react";

const ConversationCard = ({
    user,
    isSelected,
    onClick,
    lastMessage,
    lastMessageTime,
}) => {
    return (
        <div
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 ${
                isSelected ? "bg-zinc-100 dark:bg-zinc-900" : ""
            }`}
            onClick={onClick}
        >
            {/* Avatar */}
            <div className='relative'>
                <img
                    src={user.avatar?.url}
                    className='w-12 h-12 rounded-full'
                    alt='avatar'
                />
                {user.isOnline && (
                    <span className='absolute right-0 bottom-0 bg-green-600 h-3 w-3 rounded-full'></span>
                )}
            </div>

            {/* Info */}
            <div className='flex-1'>
                <p className='font-medium text-gray-800 dark:text-white'>
                    {user.name}
                </p>

                <p className='text-xs text-gray-500 truncate dark:text-gray-300'>
                    {lastMessage ? lastMessage : "Start a new chat"}
                </p>
            </div>

            {/* Time */}
            {lastMessageTime && (
                <span className='text-xs text-gray-400'>{lastMessageTime}</span>
            )}
        </div>
    );
};

export default ConversationCard;
