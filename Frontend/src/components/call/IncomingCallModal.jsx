import React, { useState } from 'react';

const IncomingCallModal = ({
    callerName,
    callerAvatar,
    onAccept,
    onReject,
}) => {
    const [isHidden, setIsHidden] = useState(false);

    if (isHidden) {
        return (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full shadow-md flex items-center gap-3 border border-zinc-700 w-[70%] sm:max-w-[18rem]">
                <img
                    src={callerAvatar}
                    alt="Avatar"z
                    className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {callerName}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    calling...
                </span>
                <button
                    onClick={() => setIsHidden(false)}
                    className="ml-2 text-blue-500 hover:text-blue-700 p-1"
                    aria-label="Expand"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-sm shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-700">
            <div className="flex items-center gap-4 p-4">
                <img
                    src={callerAvatar}
                    alt="Caller Avatar"
                    className="w-16 h-16 rounded-full "
                />
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {callerName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Incoming Call...
                    </p>
                </div>
                <button
                    onClick={() => setIsHidden(true)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                >
                    Hide
                </button>
            </div>

            <div className="flex justify-end gap-4 py-3 px-4 bg-zinc-100 dark:bg-zinc-800">
                <button
                    onClick={onReject}
                    className="flex flex-col items-center text-red-600"
                >
                    <div className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-full shadow-md cursor-pointer">
                        <span className="mt-1 text-sm">Reject</span>
                    </div>
                </button>
                <button
                    onClick={onAccept}
                    className="flex flex-col items-center text-green-600"
                >
                    <div className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full shadow-md cursor-pointer">
                        <span className="mt-1 text-sm">Accept</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default IncomingCallModal;
