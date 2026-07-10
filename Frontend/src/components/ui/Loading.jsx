import React from "react";

const Loading = () => {
    return (
        <>
            <div className='absolute flex items-center justify-center w-full h-screen z-1000'>
                <div className='relative h-10 w-10'>
                    <div className='absolute inset-0 rounded-full border-4 border-zinc-200' />
                    <div className='absolute inset-0 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin' />
                </div>
            </div>
        </>
    );
};

export default Loading;
