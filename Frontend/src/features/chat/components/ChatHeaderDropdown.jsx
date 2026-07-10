import React from "react";

const ChatHeaderDropdown = ({ onClose, onOpenProfile }) => {
    return (
        <div className='absolute top-10 right-0 mt-2 w-48 bg-white border border-zinc-300 dark:border-zinc-700 rounded-lg shadow z-50 dark:bg-zinc-900'>
            <ul className='text-md p-1'>
                <li
                    onClick={() => {
                        onOpenProfile();
                        onClose();
                    }}
                    className='flex gap-2 p-2 hover:bg-zinc-600 rounded-lg cursor-pointer'
                >
                    User Profile
                </li>
            </ul>
        </div>
    );
};

export default ChatHeaderDropdown;
