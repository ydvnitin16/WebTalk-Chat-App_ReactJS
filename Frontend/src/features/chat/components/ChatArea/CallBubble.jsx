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
    isSame,
}) => {
    const getIcon = () => {
        if (
            status === "missed" ||
            status === "rejected" ||
            status === "cancelled"
        )
            return <PhoneMissed size={16} className='text-red-500' />;
        if (status === "completed" && isMine)
            return <PhoneOutgoing size={16} className='text-green-500' />;
        if (status === "completed" && !isMine)
            return <PhoneIncoming size={16} className='text-green-500' />;
        return <Phone size={16} className='text-green-500' />;
    };

    const getCallLabel = () => {
        return type === "video" ? "Video Call" : "Voice Call";
    };

    const getDuration = () => {
        if (status === "missed") return "Call Missed";
        if (status === "rejected") return "Call Rejected";
        if (status === "connected") return "Active Call";
        if (status === "cancelled") return "Cancelled";
        if (status === "completed") return duration;
    };

    return (
        <div
            className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
        >
            {/* Avatar only for other user */}
            {!isMine && (
                <img
                    src={user?.avatar?.url || user?.avatar}
                    alt='avatar'
                    className='w-8 h-8 rounded-full mr-2 self-end'
                />
            )}
            {/* Actual bubble box */}
            <div
                className={`shadow-sm relative flex flex-col rounded-2xl  p-1 pb-0 ${isMine ? "items-end bg-violet-600 text-white dark:bg-violet-500 rounded-br-md rounded-tr-md" : "items-start bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-md rounded-tl-md"}`}
            >
                {/* left-right arrow on top borders */}
                {!isSame && (
                    <div
                        className={`absolute  h-0 w-0 border-y-[14px] border-y-transparent  ${isMine ? "text-violet-600 dark:text-violet-500 -top-[8px] -right-3 -rotate-30 border-l-[25px]" : "text-zinc-100 dark:text-zinc-800 -top-[8px] -left-3 rotate-30 border-r-[25px]"}`}
                    />
                )}
                {/* Box to show details */}
                <div
                    className={`
                        z-1 px-3 py-2 rounded-2xl max-w-xs text-sm dark:shadow-sm
                        flex items-center gap-2
                        ${isMine ? "bg-violet-700 text-white dark:bg-violet-800" : "bg-zinc-50 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"}
                    `}
                >
                    <div
                        className={` rounded-full p-3.5 ${isMine ? "bg-violet-600 text-white dark:bg-violet-600" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"}`}
                    >
                        {getIcon()}
                    </div>

                    <div className='flex flex-col gap-0.5'>
                        <span className='text-sm font-medium'>
                            {getCallLabel()}
                        </span>

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
                {/* show created time */}
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
