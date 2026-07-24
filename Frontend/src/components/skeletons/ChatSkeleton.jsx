const ChatSkeleton = () => {
    return (
        <div
            className='relative flex-1 flex-col p-3 space-y-4 overflow-y-auto overflow-x-hidden py-20 md:pb-2 
      bg-[#FCFCFC] dark:bg-zinc-950'
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
                          ? "bg-[#007AFF] dark:bg-[#007AFF] rounded-4xl"
                          : "bg-zinc-200 dark:bg-zinc-900 rounded-4xl"
                  }
                `}
                            >
                                <div className='h-3 w-32 bg-white/90 dark:bg-white/20 rounded' />

                                <div className='h-2 w-10 bg-white/90 dark:bg-white/20 rounded ml-auto' />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatSkeleton;
