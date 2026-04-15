import React, { useCallback, useRef, useState } from "react";
import useSearchUser from "../../hooks/useSearchUser";
import ConversationCard from "./ConversationCard";
import useChatStore from "@/stores/useChatStore";
import useAuthStore from "@/stores/useAuthStore";
import { Search } from "lucide-react";
import ConversationListSkeleton from "@/components/skeletons/ConversationListSkeleton";

const SearchUsersInput = () => {
    const { searchUsername, setSearchUsername, users, loading, error } =
        useSearchUser();

    const { setSelectedUserId, addConversation, addUser } = useChatStore();
    const { currentUser } = useAuthStore();

    const handleNewConversation = useCallback(
        (user) => {
            const tempId = Date.now();

            addConversation({
                _id: tempId,
                tempId,
                participants: [user._id, currentUser.id],
            });

            addUser(user);
            setSelectedUserId(user._id);
            setSearchUsername("");
        },
        [
            addConversation,
            addUser,
            setSelectedUserId,
            setSearchUsername,
            currentUser.id,
        ],
    );

    return (
        <div className='p-2 relative'>
            {/* Search input */}
            <div className='flex gap-2 items-center w-full px-4 py-2 border border-gray-300 group-focus-within:ring-blue-500 focus:outline-none focus:ring-2  rounded-full dark:bg-zinc-800 dark:border-zinc-700 dark:text-white'>
                <Search size={22} className='dark:text-zinc-400' />
                <input
                    type='text'
                    placeholder='Search users by username'
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className=' text-md w-full focus:outline-none'
                />
            </div>

            {/* Users dropdown */}
            {searchUsername.length > 0 && (
                <div className='absolute top-14 left-0 w-full bg-white p-1  rounded-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg max-h-60 overflow-y-auto z-50'>
                    {loading && (
                        <div className='p-2 text-gray-400'>
                            <ConversationListSkeleton />{" "}
                        </div>
                    )}

                    {!loading && users?.length === 0 && !error && (
                        <p className='p-2 text-gray-400'>No users found</p>
                    )}

                    {users &&
                        users.map((user) => (
                            <ConversationCard
                                key={user._id}
                                user={user}
                                onClick={handleNewConversation}
                                currentUserId={currentUser.id}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export default SearchUsersInput;
