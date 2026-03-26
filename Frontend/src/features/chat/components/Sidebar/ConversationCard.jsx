import { formatDateTime } from "@/services/utils";
import React from "react";

const ConversationCard = ({ user, isSelected, onClick, lastMessage }) => {
    return (
        <div
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 ${
                isSelected ? "bg-zinc-100 dark:bg-zinc-900" : ""
            }`}
            onClick={onClick}
        >
            <div className='relative'>
                <img
                    src={user.avatar?.url}
                    className='w-12 h-12 rounded-full bg-contain'
                    alt='avatar'
                />
                {user.isOnline && (
                    <span className='absolute right-0 bottom-0 bg-emerald-600 h-4 w-4 rounded-full border-2 border-white dark:border-black'></span>
                )}
            </div>

            <div className='flex-1'>
                <p className='flex justify-between items-center text-lg font-medium text-gray-800 dark:text-white'>
                    <span>{user.name}</span>
                    {lastMessage && (
                        <span className='text-xs text-gray-400'>
                            {formatDateTime(lastMessage.createdAt)}
                        </span>
                    )}
                </p>

                <p className='text-sm text-gray-500 truncate dark:text-gray-300'>
                    {lastMessage ? lastMessage.content : "Start a new chat"}
                </p>
            </div>
        </div>
    );
};

export default ConversationCard;
