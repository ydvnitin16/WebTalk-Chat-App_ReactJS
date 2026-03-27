import React from "react";
import {
    Phone,
    Video,
    PhoneMissed,
    PhoneIncoming,
    PhoneOutgoing,
} from "lucide-react";

const CallBubble = ({
    user,
    isMine,
    time,
    type = "voice", // "voice" | "video"
    status = "outgoing", // "missed" | "incoming" | "outgoing"
    duration, // "2:14"
}) => {
    const getIcon = () => {
        if (status === "missed" || status === "rejected")
            return <PhoneMissed size={16} className='text-red-500' />;
        if (status === "completed" && isMine)
            return <PhoneOutgoing size={16} className='text-green-500' />;
        if (status === "completed" && !isMine)
            return <PhoneIncoming size={16} className='text-green-500' />;
        return <Phone size={16} className='text-green-500' />;
    };

    const getCallLabel = () => {
        return type === "video" ? "Video call" : "Voice call";
    };

    const getDuration = () => {
        if (status === "missed") return "Call missed";
        if (status === "rejected") return "Call rejected";
        if (status === "connected") return "Active call";
        if (status === "completed") return duration;
    };

    return (
        <div
            className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}
        >
            {/* Avatar (only for other user) */}
            {!isMine && (
                <img
                    src={user?.avatar?.url || user?.avatar}
                    alt='avatar'
                    className='w-8 h-8 rounded-full mr-2 self-end'
                />
            )}

            <div
                className={`relative flex flex-col rounded-2xl  p-1 pb-0 ${isMine ? "items-end bg-violet-600 text-white dark:bg-violet-500 rounded-br-md rounded-tr-xs" : "items-start bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-md"}`}
            >
                <div
                    className={`absolute  h-0 w-0 border-y-[11px] border-y-transparent  ${isMine ? "text-violet-600 dark:text-violet-500 -top-1.5 -right-3 -rotate-30 border-l-[20px]" : "text-zinc-100 dark:text-zinc-800 -top-1.5 -left-3 rotate-30 border-r-[20px]"}`}
                />

                <div
                    className={`
                        px-3 py-2 rounded-2xl max-w-xs text-sm shadow-sm
                        flex items-center gap-2
                        ${isMine ? "bg-violet-600 text-white dark:bg-violet-800" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"}
                    `}
                >
                    {/* Call Icon */}
                    <div
                        className={` rounded-full p-3.5 ${isMine ? "bg-violet-600 text-white dark:bg-violet-950" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"}`}
                    >
                        {getIcon()}
                    </div>

                    <div className='flex flex-col'>
                        {/* Call Type */}
                        <span className='text-sm font-medium'>
                            {getCallLabel()}
                        </span>

                        {/* Time + Duration */}
                        <span
                            className={`
                                text-[10px] font-medium
                                ${
                                    isMine
                                        ? "text-zinc-200"
                                        : "text-zinc-500 dark:text-zinc-400"
                                }
                            `}
                        >
                            {getDuration()}
                        </span>
                    </div>
                </div>
                <span
                    className={`
                                    p-0.5 text-[10px] whitespace-nowrap text-end
                                    ${
                                        isMine
                                            ? "text-zinc-200"
                                            : "text-zinc-500 dark:text-zinc-400"
                                    }
                                `}
                >
                    {time || "23:12"}
                </span>
            </div>
        </div>
    );
};

export default CallBubble;
