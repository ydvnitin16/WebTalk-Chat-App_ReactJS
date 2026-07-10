import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Controls from "./Controls";

const VideoCall = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);

    const localvideoRef = useRef(null);
    const localStream = useRef(null);

    useEffect(() => {
        async function init() {
            localStream.current = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            localvideoRef.current.srcObject = localStream.current;
        }
        init();
    }, []);

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md'>
            <div className='relative w-full h-full md:w-[92%] md:max-w-5xl md:h-[88%] rounded-none md:rounded-3xl overflow-hidden shadow-2xl flex flex-col bg-white dark:bg-zinc-900 transition-colors duration-300'>
                <div className='absolute z-60 top-2 flex flex-col items-center justify-center w-full text-white pt-5 text-center'>
                    <h1 className='text-md font-semibold mt-1'>
                        Masoom Sharma
                    </h1>
                    <p className='text-sm text-gray-400'>Calling</p>
                </div>
                <div className='relative flex-1 bg-black'>
                    <video
                        ref={localvideoRef}
                        autoPlay
                        playsInline
                        className='w-full h-full object-cover'
                    />
                </div>

                <div className='absolute bottom-32 right-5 w-32 h-48 md:w-40 md:h-56 rounded-xl overflow-hidden border border-white/20 shadow-xl bg-black'>
                    <video
                        // ref={localvideoRef}
                        autoPlay
                        playsInline
                        className='w-full h-full object-cover'
                    />
                </div>
                <div className='absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-4'>
                    <Controls />
                </div>
            </div>
        </div>
    );
};

export default VideoCall;
