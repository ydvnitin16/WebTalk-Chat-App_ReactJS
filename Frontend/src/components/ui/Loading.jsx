import React from 'react';

const Loading = () => {
    return (
        <>
            <div className="absolute w-screen h-screen flex justify-center items-center bg-black opacity-40 z-100">
                <div className="flex flex-row gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-400 animate-bounce"></div>
                    <div className="w-4 h-4 rounded-full bg-green-400 animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-4 h-4 rounded-full bg-green-400 animate-bounce [animation-delay:-.5s]"></div>
                </div>
            </div>
        </>
    );
};

export default Loading;
