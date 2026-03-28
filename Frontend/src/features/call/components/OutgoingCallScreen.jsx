import React from "react";
import Controls from "./Controls";
import { localVideoRef, remoteVideoRef } from "@/stores/useCallStore";

const OutgoingCallScreen = ({ calleeName, calleeAvatar, onCancel }) => {
    return (
        <div className='fixed inset-0 z-50 flex flex-col justify-between bg-white dark:bg-black dark:text-white '>
            <div className='pt-5 text-center'>
                <h1 className='text-md font-semibold mt-1'>{calleeName}</h1>
                <p className='text-sm text-gray-400'>Calling</p>
            </div>

            <div className='flex flex-col items-center justify-center flex-1'>
                <div className='relative'>
                    <img
                        src={calleeAvatar}
                        alt='callee'
                        className='w-52 h-52 rounded-full object-cover shadow-2xl'
                    />
                </div>
            </div>
            <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className='h-40 w-40 border'
            />
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className='h-40 w-40 border'
            />
            <Controls onCancel={onCancel} />
        </div>
    );
};

export default OutgoingCallScreen;
