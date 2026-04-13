import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Phone, PhoneOff } from "lucide-react";
import ringtone from "../../../assets/ringtone.mp3";
import { optimizeUrl } from "@/services/imageOptimization";

const IncomingCallScreen = ({
    callerName,
    callerAvatar,
    onAccept,
    onReject,
}) => {
    const [isHidden, setIsHidden] = useState(true);

    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) return;

        const audio = new Audio(ringtone);
        audio.loop = true;
        audio.volume = 1;

        audioRef.current = audio;

        audio.play().catch(() => {
            console.log("Autoplay blocked");
        });

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    if (isHidden) {
        return (
            <div
                onClick={() => setIsHidden(false)}
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-100 min-w-70 flex items-center justify-between gap-3 px-2 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg shadow-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer`}
            >
                <img
                    src={optimizeUrl(callerAvatar, "medium")}
                    alt='avatar'
                    className='w-11 h-11 rounded-full object-cover'
                />
                <div className='flex items-center flex-col text-sm'>
                    <span className='font-medium text-gray-900 dark:text-white'>
                        {callerName}
                    </span>
                    <span className='text-gray-500 dark:text-gray-400'>
                        calling...
                    </span>
                </div>
                <div className='flex gap-2'>
                    <button
                        onClick={onReject}
                        className='flex flex-col items-center gap-1'
                    >
                        <div
                            className='p-3 rounded-full 
                        bg-red-600 text-white flex items-center justify-center 
                        shadow-lg hover:opacity-50 active:scale-95 transition cursor-pointer'
                        >
                            <Phone className='rotate-135' size={16} />
                        </div>
                    </button>
                    <button
                        onClick={onAccept}
                        className='flex flex-col items-center gap-1'
                    >
                        <div
                            className='p-3 rounded-full 
                        bg-green-600 text-white flex items-center justify-center 
                        shadow-lg hover:opacity-50 active:scale-95 transition cursor-pointer'
                        >
                            <Phone size={16} />
                        </div>
                    </button>
                </div>
            </div>
        );
    }
    return (
        <>
            <div
                className={` fixed inset-0 z-50 flex flex-col justify-between dark:bg-gradient-to-b bg-white text-black dark:text-white dark:via-black dark:from-zinc-900 dark:to-black`}
            >
                {/* <audio ref={audioRef} src={ringtone} loop autoPlay /> */}

                <div className='pt-5 text-center'>
                    <h1 className='text-md font-semibold mt-1'>{callerName}</h1>
                    <p className='text-sm text-gray-400'>calling</p>
                </div>

                <div className='flex flex-col items-center justify-center flex-1'>
                    <div className='relative'>
                        <img
                            src={optimizeUrl(callerAvatar, "medium")}
                            alt='callee'
                            className='w-52 h-52 rounded-full object-cover shadow-2xl'
                        />
                    </div>
                </div>

                <div className='pb-10 px-6'>
                    <div className='flex justify-between items-center max-w-md mx-auto'>
                        <button
                            onClick={onReject}
                            className='flex flex-col items-center gap-2 group'
                        >
                            <div className='text-white w-16 h-16 md:w-18 md:h-18 flex items-center justify-center rounded-full bg-red-600 shadow-lg group-hover:bg-red-700 transition'>
                                <Phone className='rotate-135' size={26} />
                            </div>
                            <span className='text-xs text-zinc-400'>
                                Decline
                            </span>
                        </button>

                        <div
                            className='flex flex-col items-center text-black dark:text-white cursor-pointer animate-bounce'
                            onClick={() => setIsHidden(true)}
                        >
                            <ChevronUp />
                            Minimize
                        </div>

                        {/* Accept */}
                        <button
                            onClick={onAccept}
                            className='flex flex-col items-center gap-2 group'
                        >
                            <div className='text-white w-16 h-16 md:w-18 md:h-18 flex items-center justify-center rounded-full bg-green-600 shadow-lg group-hover:bg-green-700 transition'>
                                <Phone size={26} />
                            </div>
                            <span className='text-xs text-zinc-400'>
                                Accept
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default IncomingCallScreen;
