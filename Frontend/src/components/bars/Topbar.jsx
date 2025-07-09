import React, { useState } from 'react';
import { UseAuthStore } from '../../stores/UseAuthStore';
import { logoutUser } from '../../services/auth';
import ConfirmModal from '../common/ConfirmModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../App.jsx';

const Topbar = () => {
    const clearUserStore = UseAuthStore(state => state.clearUserStore)
    const navigate = useNavigate()

    async function handleLogout(){
        const res = await logoutUser();
        const data = await res.json()
        setConfirmModal(false)
        clearUserStore()
        navigate('/login')
        toast.success(data.message)
        socket.disconnect()
    }

    const userStore = UseAuthStore(state => state.userStore)
    const [confirmModal, setConfirmModal] = useState(false)

    const [showDropdown, setShowDropdown] = useState(false)
    return (
        <>
         <ConfirmModal isOpen={confirmModal} onClose={() => setConfirmModal(false)} onConfirm={handleLogout} title='"Confirm Logout"' description='Are you sure you want to logout?'  />
        <div className="flex justify-between items-center p-3 bg-white mx-1 dark:bg-zinc-900 dark:text-white">
            <h1 className="text-xl font-bold">Chats</h1>
            <div className="relative">
                <img
                    src={userStore?.picUrl}
                    alt="user"
                    className="w-10 h-10 rounded-full cursor-pointer"
                    onClick={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow z-50 dark:bg-zinc-900">
                        <ul className="text-sm">
                            <li className="p-2 hover:bg-zinc-600 rounded-lg cursor-pointer">
                                Go To Profile
                            </li>
                            <li className="p-2 hover:bg-zinc-600 rounded-lg cursor-pointer">
                                Invite User
                            </li>
                            <li onClick={() => setConfirmModal(true) } className="p-2 hover:bg-zinc-600 rounded-lg cursor-pointer">
                                Logout
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default Topbar;
