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
    duration,
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
            className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}
        >
            <div
                className={`relative flex flex-col ${
                    isMine ? "items-end" : "items-start"
                }`}
            >
                {!isSame && (
                    <div
                        className={`absolute h-0 w-0 border-y-[14px] border-y-transparent ${
                            isMine
                                ? "text-[#0A84FF]/80 -top-[8px] -right-3 -rotate-30 border-l-[25px]"
                                : "backdrop-blur-md text-white/20 dark:text-zinc-700/30 -top-[8px] -left-3 rotate-30 border-r-[25px]"
                        }`}
                    />
                )}

                <div
                    className={`
                        px-3 py-2 rounded-2xl max-w-xs text-sm shadow-sm
                        ${
                            isMine
                                ? "text-white bg-[#0A84FF]/80 backdrop-blur-md border border-white/10"
                                : "backdrop-blur-md bg-white/20 dark:bg-zinc-700/30 border border-white/20 dark:border-zinc-600/30 text-zinc-800 dark:text-zinc-100"
                        }
                    `}
                >
                    <div className='flex items-center gap-3'>
                        <div
                            className={`rounded-full p-3 ${
                                isMine
                                    ? "bg-white/20 backdrop-blur-md border border-white/20"
                                    : "bg-white dark:bg-zinc-700/40 backdrop-blur-md border border-white/20 dark:border-zinc-600/30"
                            }`}
                        >
                            {getIcon()}
                        </div>

                        <div className='flex flex-col'>
                            <span className='text-sm font-medium'>
                                {getCallLabel()}
                            </span>

                            <span
                                className={`text-[10px] ${
                                    isMine
                                        ? "text-zinc-200"
                                        : "text-zinc-500 dark:text-zinc-400"
                                }`}
                            >
                                {getDuration()}
                            </span>
                        </div>
                    </div>

                    <div
                        className={`flex justify-end mt-1 text-[10px] ${
                            isMine
                                ? "text-zinc-200"
                                : "text-zinc-500 dark:text-zinc-400"
                        }`}
                    >
                        {time || "23:12"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CallBubble);
