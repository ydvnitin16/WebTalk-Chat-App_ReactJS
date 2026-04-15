import React from "react";

const ConversationListSkeleton = () => {
    return (
        <div className='w-full p-4 space-y-4 bg-zinc-100 dark:bg-zinc-950'>
            {[...Array(5)].map((_, i) => (
                <div key={i} className='flex gap-3 items-center'>
                    <div className='w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse' />
                    <div className='flex-1 space-y-2'>
                        <div className='h-3 bg-zinc-30s0 dark:bg-zinc-700 rounded w-1/2 animate-pulse' />
                        <div className='h-3 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4 animate-pulse' />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ConversationListSkeleton;
