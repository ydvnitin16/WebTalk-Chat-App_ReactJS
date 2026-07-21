import React, { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatDateTime } from "@/utils/utils";
import AvatarScreen from "@/components/ui/AvatarScreen";
import { optimizeUrl } from "@/utils/imageOptimization";

const UserProfileModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);

    return (
        <>
            <AvatarScreen
                isOpen={isAvatarOpen}
                onClose={() => setIsAvatarOpen(false)}
                src={user.avatar?.url}
            />
            <div
                onClick={onClose}
                className='fixed inset-0 z-50 flex items-center justify-center'
            >
                <div className='fixed inset-0 bg-black/40 backdrop-blur-[0.5px]'></div>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    className='w-full max-w-sm backdrop-blur-[5px] bg-white/30 dark:bg-[#101010]  border border-zinc-300 rounded-4xl dark:border-zinc-800 p-6 relative'
                >
                    <Button
                        onClick={onClose}
                        variant='outline'
                        className='absolute top-4 right-4 text-zinc-200 hover:text-zinc-800 dark:hover:text-white'
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

                    <div className='mt-5 text-center'>
                        <h2 className='text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white'>
                            {user.name}
                        </h2>

                        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                            @{user.username}
                        </p>

                        <div className='mt-3 flex justify-center'>
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                                    user.isOnline
                                        ? "bg-emerald-300/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500"
                                }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        user.isOnline
                                            ? "bg-emerald-500"
                                            : "bg-zinc-400"
                                    }`}
                                />
                                {user.isOnline ? "Online" : "Offline"}
                            </span>
                        </div>
                    </div>
                    <div className='mt-6 space-y-5'>
                        {/* Bio */}
                        <div>
                            <p className='text-xs uppercase tracking-wider text-zinc-500 mb-1'>
                                About
                            </p>

                            <p className='text-sm leading-6 text-zinc-700 dark:text-zinc-300'>
                                {user.bio || "Hey there! I'm using SendX."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProfileModal;
