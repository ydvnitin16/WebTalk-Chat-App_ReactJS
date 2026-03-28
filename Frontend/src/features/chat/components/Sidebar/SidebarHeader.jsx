import React, { useState } from "react";
import ConfirmModal from "../../../../components/ui/ConfirmModal.jsx";
import {
    LogOut,
    MessageCircle,
    Send,
    SendHorizonal,
    UserRound,
} from "lucide-react";

const SidebarHeader = ({ user, handleLogout }) => {
    const [logoutModal, setLogoutModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <>
            {/* Logout MOdal */}
            <ConfirmModal
                isOpen={logoutModal}
                onClose={() => setLogoutModal(false)}
                onConfirm={handleLogout}
                title='Confirm Logout'
                description='Are you sure you want to logout?'
                actionTitle={"Yes, Logout"}
            />

            <div className='flex justify-between items-center px-3 pt-3 pb-1.5  mx-1  dark:text-white'>
                <h1 className='flex gap-1 items-center text-xl font-bold'>
                    <div
                        className='w-10 h-10 bg-black dark:bg-white '
                        style={{
                            WebkitMaskImage: "url('/sendx-icon-dark.png')",
                            WebkitMaskRepeat: "no-repeat",
                            WebkitMaskSize: "contain",
                            maskImage: "url('/sendx-icon-dark.png')",
                            maskRepeat: "no-repeat",
                            maskSize: "contain",
                        }}
                    />
                    SendX
                </h1>
                <div className='relative'>
                    <img
                        src={user?.avatar}
                        alt={user?.name}
                        className='w-10 h-10 rounded-full cursor-pointer'
                        onClick={() => setShowDropdown(!showDropdown)}
                    />
                    {showDropdown && (
                        <div className='absolute right-0 mt-2 w-48 bg-white border border-zinc-300 dark:border-zinc-700 rounded-lg shadow z-50 dark:bg-zinc-900'>
                            <ul className='text-md p-1'>
                                <li className='flex gap-2 p-2 hover:bg-zinc-600 rounded-lg cursor-pointer'>
                                    <UserRound /> Go To Profile
                                </li>
                                <li
                                    onClick={() => setLogoutModal(true)}
                                    className='flex gap-2 p-2 hover:bg-zinc-600 rounded-lg cursor-pointer'
                                >
                                    <LogOut /> Logout
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SidebarHeader;
