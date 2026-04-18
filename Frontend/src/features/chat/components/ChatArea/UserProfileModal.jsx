import React, { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatDateTime } from "@/utils/utils";
import AvatarScreen from "@/components/ui/AvatarScreen";
import { optimizeUrl } from "@/utils/imageOptimization";

const UserProfileModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);
    console.log(user);

    return (
        <>
            <AvatarScreen
                isOpen={isAvatarOpen}
                onClose={() => setIsAvatarOpen(false)}
                src={user.avatar?.url}
            />
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]'>
                <div className='w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 relative'>
                    <Button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                    >
                        <X />
                    </Button>

                    <div className='flex flex-col items-center mb-4 cursor-pointer'>
                        <img
                            onClick={() => setIsAvatarOpen(true)}
                            loading='lazy'
                            src={optimizeUrl(user.avatar?.url, "medium")}
                            alt='avatar'
                            className='w-35 h-35 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700'
                        />
                    </div>

                    <div className='text-center space-y-2'>
                        <h2 className='text-xl font-semibold text-zinc-800 dark:text-white'>
                            {user.name}
                        </h2>

                        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                            @{user.username}
                        </p>

                        <p
                            className={`text-xs ${user.isOnline ? "text-emerald-500" : " text-zinc-400"}`}
                        >
                            {user.isOnline
                                ? "Online"
                                : user.lastSeen
                                  ? `Last seen ${formatDateTime(user.lastSeen)}`
                                  : ""}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProfileModal;
