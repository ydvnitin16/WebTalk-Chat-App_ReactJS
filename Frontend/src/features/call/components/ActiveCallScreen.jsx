import { localVideoRef, remoteVideoRef } from "@/stores/useCallStore";
import React from "react";
import Controls from "./Controls";

const ActiveCallScreen = ({ isCaller, call }) => {
    const user = isCaller ? call.receiver : call.caller;
    console.log(call);

    return (
        <div className='fixed inset-0 z-50 flex flex-col justify-between bg-white dark:bg-black dark:text-white '>
            <div className='pt-5 text-center'>
                <h1 className='text-md font-semibold mt-1'>{user.name}</h1>
                <p className='text-sm text-gray-400'>
                    {call.status === "calling"
                        ? "Calling..."
                        : call.status === "ringing"
                          ? "Ringing..."
                          : call.status === "connected"
                            ? "Timer"
                            : call.status === "rejected" && isCaller
                              ? "Rejected"
                              : call.status === "busy" && isCaller
                                ? "Busy on call"
                                : null}
                </p>
            </div>

            <div className='flex flex-col items-center justify-center flex-1'>
                <div className='relative'>
                    <img
                        src={user.avatar}
                        alt='callee'
                        className='w-52 h-52 rounded-full object-cover shadow-2xl'
                    />
                </div>
            </div>
            {call.type === "video" ? (
                <>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        className='h-40 w-40 border'
                    />
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className='h-40 w-40 border'
                    />
                </>
            ) : (
                <>
                    <video ref={remoteVideoRef} autoPlay className='hidden' />
                </>
            )}
            <Controls />
        </div>
    );
};

export default ActiveCallScreen;
