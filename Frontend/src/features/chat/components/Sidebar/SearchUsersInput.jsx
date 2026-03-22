import React, { useRef, useState } from "react";
import useSearchUser from "../../hooks/useSearchUser";
import ConversationCard from "./ConversationCard";
import useChatStore from "@/stores/useChatStore";
import useAuthStore from "@/stores/useAuthStore";

const SearchUsersInput = () => {
    const { searchUsername, setSearchUsername, users, loading, error } =
        useSearchUser();

    const { setSelectedUserId, addConversation, addUser } = useChatStore();
    const { currentUser } = useAuthStore();

    return (
        <div className='p-2 relative'>
            {/* Search input */}
            <input
                type='text'
                placeholder='Search users by username'
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white'
            />

            {/* Users dropdown */}
            {searchUsername.length > 0 && (
                <div className='absolute top-14 left-0 w-full bg-white p-1  rounded-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg max-h-60 overflow-y-auto z-50'>
                    {loading && (
                        <p className='p-2 text-gray-400'>Searching...</p>
                    )}

                    {!loading && !users && (
                        <p className='p-2 text-gray-400'>No users found</p>
                    )}

                    {users &&
                        users.map((user) => (
                            <ConversationCard
                                key={user._id}
                                user={user}
                                onClick={() => {
                                    const tempId = Date.now();
                                    addConversation({
                                        _id: tempId,
                                        tempId,
                                        participants: [
                                            user._id,
                                            currentUser.id,
                                        ],
                                    });
                                    addUser(user);
                                    setSelectedUserId(user._id);
                                    setSearchUsername("");
                                }}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export default SearchUsersInput;
