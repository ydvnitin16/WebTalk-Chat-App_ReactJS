import Loading from '../common/Loading.jsx';
import Topbar from './Topbar.jsx';
import Searchbar from './Searchbar.jsx';
import { formatDateTime } from '../../services/utils.js';
import { UseAuthStore } from '../../stores/UseAuthStore.jsx';
import { UseSelectedUserStore } from '../../stores/UseSelectedUserStore.jsx';
import { UseMessagesStore } from '../../stores/UseMessagesStore.jsx';
import { UseContactStore } from '../../stores/UseContactStore.jsx';
import { getLastMessage } from '../../services/utils.js';
import { useState } from 'react';

const Sidebar = () => {
    const userStore = UseAuthStore((state) => state.userStore); // stores my auth info
    const selectedUser = UseSelectedUserStore((state) => state.selectedUser); // store selected user info
    const setSelectedUser = UseSelectedUserStore(
        //set selected user info
        (state) => state.setSelectedUser
    );


    const messages = UseMessagesStore((state) => state.messages); // stores my messages
    const contacts = UseContactStore((state) => state.contacts); // stores all the users

    return (
        <>
            {!contacts && <Loading />}
            <aside
                className={`md:w-1/4 w-full bg-white overflow-y-auto scroll-smooth no-scrollbar rounded-2xl md:rounded-none md:rounded-l-4xl ml-1 md:block dark:bg-zinc-900 dark:text-white ${
                    selectedUser ? 'hidden md:block' : 'block'
                }`}
            >
                {/* Top Bar */}
                <Topbar />

                {/* Search Bar */}
                <Searchbar />

                {/* Contacts */}
                <div className="space-y-2 p-2 h-screen">
                    {contacts &&
                        contacts
                            .filter((u) => u._id !== userStore?.id)
                            .map((user) => (
                                <div
                                    key={user._id}
                                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                                        selectedUser?.name === user.name
                                            ? 'bg-zinc-100 dark:bg-zinc-700'
                                            : ''
                                    }`}
                                    onClick={() => {
                                        setSelectedUser({
                                            id: user._id,
                                            name: user.name,
                                            img: user.profilePic.url,
                                            bio: user.bio,
                                            isOnline: user.isOnline,
                                            lastSeen: formatDateTime(
                                                user.lastSeen
                                            ),
                                        });
                                    }}
                                >
                                    <div className='relative'>
                                        <img
                                            src={user.profilePic.url}
                                            className="w-12 h-12 rounded-full"
                                            alt="avatar"
                                        />
                                        {user.isOnline && <p className='absolute right-0 bottom-0 bg-green-600 h-3 w-3 rounded-full'></p>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 dark:text-white">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate dark:text-gray-300">
                                            {(() => {
                                                const lastMsg = getLastMessage(messages, user, userStore);
                                                console.log(lastMsg)
                                                return lastMsg && lastMsg.lastMessage !== undefined ? `${lastMsg.sendedByYou} ${lastMsg.lastMessage}` : 'Start a new chat';
                                            })()}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {(() => {
                                            const lastMsg = getLastMessage(messages, user, userStore);
                                            return lastMsg && lastMsg.createdAt ? formatDateTime(lastMsg.createdAt) : '';
                                        })()}
                                    </span>
                                </div>
                            ))}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
