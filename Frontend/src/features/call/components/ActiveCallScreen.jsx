import {
    localStream,
    localVideoRef,
    remoteStream,
    remoteVideoRef,
} from "@/stores/useCallStore";
import React, { useEffect } from "react";
import Controls from "./Controls";
import useDurationTimer from "../hooks/useDurationTimer";

const ActiveCallScreen = ({ isCaller, call, endCall }) => {
    const user = isCaller ? call.receiver : call.caller;
    const { duration } = useDurationTimer(call.startedAt);

    console.log(call);

    useEffect(() => {
        if (localVideoRef.current && localStream.current) {
            localVideoRef.current.srcObject = localStream.current;
        }

        if (remoteVideoRef.current && remoteStream.current) {
            remoteVideoRef.current.srcObject = remoteStream.current;
        }
    }, [call]);

    return (
        <div className='fixed inset-0 z-50 flex flex-col bg-black text-white'>
            {/* Name and status always stay fix here */}
            <div className='pt-5 text-center z-20'>
                <h1 className='text-md font-semibold mt-1'>{user.name}</h1>
                <p className='text-sm text-gray-400'>
                    {call.status === "calling"
                        ? "Calling..."
                        : call.status === "ringing"
                          ? "Ringing..."
                          : call.status === "connected"
                            ? duration
                            : call.status === "rejected" && isCaller
                              ? "Rejected"
                              : call.status === "busy" && isCaller
                                ? "Busy on call"
                                : null}
                </p>
            </div>

            <div className='relative flex-1 w-full h-full overflow-hidden'>
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    className='absolute inset-0 w-full h-full object-cover z-0'
                />

                {(call.type === "audio" || call.status !== "connected") && (
                    <div className='absolute inset-0 flex items-center justify-center z-10'>
                        <img
                            src={user.avatar?.url || user.avatar}
                            alt='callee'
                            className='w-40 h-40 rounded-full object-cover shadow-2xl'
                        />
                    </div>
                )}

                {call.type === "video" && (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className='absolute bottom-24 right-4 w-28 h-40 object-cover rounded-lg border-2 border-white z-20 shadow-lg'
                    />
                )}
            </div>

            {/* Controls ALWAYS ON TOP */}
            <div className='z-30'>
                <Controls endCall={endCall} />
            </div>
        </div>
    );
};

export default ActiveCallScreen;
