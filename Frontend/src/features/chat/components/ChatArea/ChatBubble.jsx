import { Check, CheckCheck } from "lucide-react";
import React from "react";

const ChatBubble = ({
    user,
    isMine,
    type,
    content,
    time,
    status = "sent",
    isSame,
}) => {
    const renderStatus = () => {
        if (!isMine) return null;

        if (status === "sent") return <Check size={14} />;
        if (status === "delivered") return <CheckCheck size={14} />;
        if (status === "seen")
            return <CheckCheck size={14} className='text-blue-400' />;
    };

    return (
        <div
            className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
        >
            {/* Avatar only for opposite user*/}
            {!isMine && (
                <img
                    src={user?.avatar?.url}
                    alt='avatar'
                    className='w-8 h-8 rounded-full mr-2 self-end'
                />
            )}

            <div
                className={`relative flex flex-col ${isMine ? "items-end" : "items-start"}`}
            >
                {!isSame && (
                    <div
                        className={`absolute  h-0 w-0 border-y-[14px] border-y-transparent  ${isMine ? "text-violet-600 dark:text-violet-500 -top-[8px] -right-3 -rotate-30 border-l-[25px]" : "text-zinc-100 dark:text-zinc-800 -top-[8px] -left-3 rotate-30 border-r-[25px]"}`}
                    />
                )}
                {/* TEXT MESSAGE */}
                {type !== "image" && (
                    <div
                        className={`
                            px-3 py-2 rounded-2xl max-w-xs text-sm
                            shadow-sm
                            ${
                                isMine
                                    ? "bg-violet-600 text-white dark:bg-violet-500  rounded-r-md"
                                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100  rounded-l-md"
                            }
                        `}
                    >
                        <div className='flex flex-wrap items-end gap-x-2'>
                            <span className='break-words text-[15px]'>
                                {content}
                            </span>

                            <span
                                className={`
                                    flex items-center gap-1 text-[10px] whitespace-nowrap
                                    ${
                                        isMine
                                            ? "text-zinc-200"
                                            : "text-zinc-500 dark:text-zinc-400"
                                    }
                                `}
                            >
                                {time || "23:12"}
                                {isMine && renderStatus()}
                            </span>
                        </div>
                    </div>
                )}

                {/* IMAGE MESSAGE */}
                {type === "image" && (
                    <div className='relative max-w-xs'>
                        <img
                            src={content}
                            alt='chat-img'
                            className='rounded-xl object-cover max-h-60 border border-zinc-200 dark:border-zinc-700'
                        />

                        <div className='absolute bottom-1 right-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded flex items-center gap-1'>
                            {time || "23:12"}
                            {isMine && renderStatus()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatBubble;
