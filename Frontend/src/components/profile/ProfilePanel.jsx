import useChatStore from "@/stores/useChatStore";
import { X } from "lucide-react";
import React from "react";

const ProfilePanel = ({ isOpen = false, onClose }) => {
    if (!isOpen) return;
    
    const { selectedUserId, users } = useChatStore();
    if (!selectedUserId) return null;

    const selectedUser = users[selectedUserId];

    return (
        <aside className='w-1/4 bg-white hidden lg:flex flex-col p-4 rounded-4xl ml-3 dark:bg-zinc-900 dark:text-white overflow-y-auto'>
            <div className='flex justify-between px-2'>
                <h2 className='text-lg font-semibold mb-4'>User Info</h2>
                <span onClick={onClose}>
                    <X />
                </span>
            </div>

            <div className='flex flex-col items-center text-center'>
                <img
                    src={selectedUser.avatar.url || selectedUser.avatar}
                    className='w-24 h-24 rounded-full mb-3'
                    alt='profile'
                />
                <p className='font-bold text-xl text-gray-800 dark:text-gray-200'>
                    {selectedUser.name}
                </p>
                <p className='text-sm text-gray-500 dark:text-gray-300 my-2'>
                    {selectedUser.bio}
                </p>
            </div>

            <hr className='my-6 text-zinc-300 dark:text-zinc-800' />

            <div>
                <h3 className='font-semibold mb-2'>All Media</h3>
                <div className='grid grid-cols-3 gap-2'>
                    {[...Array(9)].map((_, i) => (
                        <img
                            key={i}
                            src={`https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?cs=srgb&dl=pexels-souvenirpixels-414612.jpg&fm=jpg`}
                            className='rounded-md object-cover w-full h-20'
                            alt={`media-${i}`}
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default ProfilePanel;
