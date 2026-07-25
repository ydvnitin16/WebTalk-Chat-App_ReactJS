import { formatDateTime } from "@/utils/utils";
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
    isMine,
    type,
    content,
    time,
    status = "sent",
    isSame,
    isFirst,
    isLast,
    resend,
    data,
}) => {
    const renderStatus = () => {
        if (!isMine) return null;
        if (status === "failed")
            return <BadgeInfo size={14} className='text-red-500' />;
        if (status === "pending" || status === "sending")
            return <Clock3 size={14} />;
        if (status === "sent") return <Check size={14} />;
        if (status === "delivered")
            return <CheckCheck size={14} className='text-[#ffffff]' />;
        if (status === "seen")
            return <CheckCheck size={14} className='text-[#ffffff]/50' />;
    };

    const formattedTime = useMemo(() => {
        return formatDateTime(time, "time");
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
                {type !== "image" && (
                    <>
                        <div
                            className={`
                            px-3 py-2 rounded-4xl max-w-xs text-sm
                            shadow-sm
                            ${
                                isMine
                                    ? "text-white rounded-2xl bg-[#007AFF] dark:bg-[#007AFF]  border border-white/10 "
                                    : "px-3 py-2 rounded-2xl max-w-xs text-sm  bg-white/20 dark:bg-zinc-700/30 border border-white/20 dark:border-zinc-600/30 shadow-sm"
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
            </div>
        </div>
    );
};

export default React.memo(ChatBubble);
