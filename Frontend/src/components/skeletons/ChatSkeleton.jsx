const ChatSkeleton = () => {
    return (
        <div
            className='relative flex-1 flex-col p-3 space-y-4 overflow-y-auto overflow-x-hidden py-20 md:pb-2 
      bg-white dark:bg-zinc-950'
        >
            {[...Array(10)].map((_, i) => {
                const isMine = i % 3 === 0;

                return (
                    <div
                        key={i}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                        <div className='flex items-end gap-2 max-w-xs'>
                            <div
                                className={`
                  px-4 py-3 rounded-2xl space-y-2 animate-pulse
                  ${
                      isMine
                          ? "bg-blue-300 dark:bg-blue-700 rounded-br-sm"
                          : "bg-zinc-300 dark:bg-zinc-700 rounded-bl-sm"
                  }
                `}
                            >
                                <div className='h-3 w-24 bg-white/40 dark:bg-white/20 rounded' />

                                <div className='h-3 w-32 bg-white/40 dark:bg-white/20 rounded' />

                                <div className='h-2 w-10 bg-white/30 dark:bg-white/20 rounded ml-auto' />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatSkeleton;
