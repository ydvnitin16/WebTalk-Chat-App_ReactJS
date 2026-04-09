import React from "react";

const TypingIndicator = () => {
    return (
        <div className='flex justify-start mb-3'>
            <div className='px-3 py-2 rounded-2xl rounded-bl-sm max-w-xs text-sm backdrop-blur-md bg-white/20 dark:bg-zinc-700/30 border border-white/20 dark:border-zinc-600/30 shadow-sm'>
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
