import React, { useEffect, useState } from "react";
import { X, Camera } from "lucide-react";
import Button from "@/components/ui/Button";
import useProfile from "../hooks/useProfile";
import { optimizeUrl } from "@/services/imageOptimization";

const ProfileModal = ({ isOpen, onClose, user, onSave }) => {
    const [name, setName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [avatar, setAvatar] = useState(
        user?.avatar?.url || user?.avatar || "",
    );
    const [preview, setPreview] = useState(avatar);

    const { error, loading, updateProfile } = useProfile();

    useEffect(() => {
        const nextAvatar = user?.avatar?.url || user?.avatar || "";
        setName(user?.name || "");
        setUsername(user?.username || "");
        setAvatar(nextAvatar);
        setPreview(nextAvatar);
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPreview(url);
        setAvatar(file);
    };

    const handleSubmit = async () => {
        const updatedUser = await updateProfile({ name, username, avatar });
        onSave?.(updatedUser);
        onClose();
    };

    return (
        <div className='fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-[2px]'>
            <div className='w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 relative'>
                <Button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                >
                    <X />
                </Button>

                <h2 className='text-xl font-semibold text-zinc-800 dark:text-white mb-6'>
                    Edit Profile
                </h2>

                <div className='flex flex-col items-center mb-6'>
                    <div className='relative'>
                        <img
                            src={optimizeUrl(preview, "medium")}
                            alt='avatar'
                            className='w-24 h-24 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700'
                        />

                        <label className='absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700'>
                            <Camera size={16} className='text-white' />
                            <input
                                type='file'
                                accept='image/*'
                                className='hidden'
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                </div>

                <div className='space-y-4'>
                    {error && <p className='text-sm text-red-500'>{error}</p>}

                    <div>
                        <label className='text-sm text-zinc-600 dark:text-zinc-400'>
                            Name
                        </label>
                        <input
                            type='text'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className='w-full mt-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>

                    <div>
                        <label className='text-sm text-zinc-600 dark:text-zinc-400'>
                            Username (Allows others to find you)
                        </label>
                        <input
                            type='text'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className='w-full mt-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>
                </div>

                <div className='flex justify-end gap-3 mt-6'>
                    <Button
                        disabled={loading}
                        onClick={onClose}
                        className='px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white'
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className='px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white'
                    >
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
