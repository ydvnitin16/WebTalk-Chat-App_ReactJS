import { formatDateTime } from "@/services/utils";
import {
    BadgeInfo,
    Check,
    CheckCheck,
    Clock3,
    Info,
    RotateCw,
    Timer,
} from "lucide-react";
import React, { useCallback, useMemo } from "react";

const ChatBubble = ({
    user,
    isMine,
    type,
    content,
    time,
    status = "sent",
    isSame,
    resend,
    data,
}) => {
    const renderStatus = () => {
        if (!isMine) return null;
        if (status === "failed")
            return <BadgeInfo size={14} className='text-red-500' />;
        if (status === "pending") return <Clock3 size={14} />;
        if (status === "sent") return <Check size={14} />;
        if (status === "delivered") return <CheckCheck size={14} />;
        if (status === "seen")
            return <CheckCheck size={14} className='text-blue-400' />;
    };

    const formattedTime = useMemo(() => {
        return formatDateTime(time);
    }, [time]);

    const handleResend = useCallback(() => {
        resend(data);
    }, [resend, data]);

    return (
        <div
            className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}
        >
            <div
                className={`relative flex flex-col ${isMine ? "items-end" : "items-start"}`}
            >
                {!isSame && (
                    <div
                        className={`absolute  h-0 w-0 border-y-[14px] border-y-transparent   ${isMine ? "text-[#0A84FF] -top-[8px] -right-3 -rotate-30 border-l-[25px]" : "backdrop-blur-md text-white/20 dark:text-zinc-700/30  -top-[8px] -left-3 rotate-30 border-r-[25px]"}`}
                    />
                )}

                {type !== "image" && (
                    <>
                        <div
                            className={`
                            px-3 py-2 rounded-2xl max-w-xs text-sm
                            shadow-sm
                            ${
                                isMine
                                    ? "text-white rounded-2xl bg-[#0A84FF]/80 backdrop-blur-md border border-white/10 "
                                    : "px-3 py-2 rounded-2xl max-w-xs text-sm backdrop-blur-md bg-white/20 dark:bg-zinc-700/30 border border-white/20 dark:border-zinc-600/30 shadow-sm"
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
                                    {formattedTime || "23:12"}
                                    {isMine && renderStatus()}
                                </span>
                            </div>
                        </div>
                        {status === "failed" && (
                            <div
                                className='cursor-pointer hover:opacity-70'
                                onClick={() => handleResend(data)}
                            >
                                <RotateCw size={16} />
                            </div>
                        )}
                    </>
                )}

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

export default React.memo(ChatBubble);
