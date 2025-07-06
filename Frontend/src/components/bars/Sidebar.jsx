import React, { useContext, useEffect, useState } from 'react';
import Loading from '../common/Loading.jsx';
import Topbar from './Topbar.jsx';
import { fetchUsers } from '../../services/fetchUsers.js';
import { formatDateTime } from '../../services/utils.js';
import { roomContext } from '../../App.jsx';
import { UseAuthStore } from '../../stores/UseAuthStore.jsx';
import Searchbar from './Searchbar.jsx';

const Sidebar = ({ selectedUser, setSelectedUser }) => {
    const [users, setUsers] = useState(null);
    const userStore = UseAuthStore((state) => state.userStore);

    const { setRoom } = useContext(roomContext);

    useEffect(() => {
        async function getUsers() {
            const res = await fetchUsers();
            const data = await res.json();
            setUsers(data.users);
        }
        getUsers();
    }, []);

    return (
        <>
            {!users && <Loading />}
            <aside
                className={`md:w-1/4 w-full bg-white overflow-y-auto scroll-smooth no-scrollbar rounded-2xl md:rounded-none md:rounded-l-4xl ml-1 md:block dark:bg-zinc-900 dark:text-white ${
                    selectedUser ? 'hidden md:block' : 'block'
                }`}
            >
                <Topbar />
                <Searchbar />
                <div className="space-y-2 p-2 h-screen">
                    {users &&
                        users
                            .filter((u) => u._id !== userStore.id)
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
                                        setRoom(user._id);
                                    }}
                                >
                                    <img
                                        src={user.profilePic.url}
                                        className="w-12 h-12 rounded-full"
                                        alt="avatar"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 dark:text-white">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate dark:text-gray-300">
                                            Last message...
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        1h
                                    </span>
                                </div>
                            ))}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
