import React from 'react';
import { UseSelectedUserStore } from '../../stores/UseSelectedUserStore';

const ProfilePanel = () => {
    const selectedUser = UseSelectedUserStore((state) => state.selectedUser);
    if (!selectedUser) return null;

    return (
        <aside className="w-1/4 bg-white hidden lg:flex flex-col p-4 rounded-4xl mx-1 dark:bg-zinc-900 dark:text-white overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">User Info</h2>

            <div className="flex flex-col items-center text-center">
                <img
                    src={selectedUser.img}
                    className="w-24 h-24 rounded-full mb-3"
                    alt="profile"
                />
                <p className="font-bold text-xl text-gray-800 dark:text-gray-200">
                    {selectedUser.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300 my-2">
                    {selectedUser.bio}
                </p>
            </div>

            <hr className="my-6" />

            <div>
                <h3 className="font-semibold mb-2">Pinned Media</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[...Array(3)].map((_, i) => (
                        <img
                            key={i}
                            src={`https://images.unsplash.com/photo-1593696954577-ab3d39317b97?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGZyZWUlMjBpbWFnZXN8ZW58MHx8MHx8fDA%3D`}
                            className="rounded-md object-cover w-full h-20"
                            alt={`pinned-${i}`}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-2">All Media</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[...Array(9)].map((_, i) => (
                        <img
                            key={i}
                            src={`https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?cs=srgb&dl=pexels-souvenirpixels-414612.jpg&fm=jpg`}
                            className="rounded-md object-cover w-full h-20"
                            alt={`media-${i}`}
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default ProfilePanel;
