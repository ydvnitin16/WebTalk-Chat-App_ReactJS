import React from "react";

const TypingIndicator = ({ user }) => {
    return (
        <div className='flex justify-start mb-3'>
            {/* Avatar */}
            <img
                src={user?.avatar?.url}
                alt='avatar'
                className='w-8 h-8 rounded-full mr-2 self-end'
            />

            {/* Bubble */}
            <div className='bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-2xl rounded-bl-md'>
                <div className='flex items-center justify-center mt-1.5 gap-1'>
                    <span className='w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]' />
                    <span className='w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]' />
                    <span className='w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce' />
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;
