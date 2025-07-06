import { useState } from 'react';
import Sidebar from '../components/bars/Sidebar.jsx';
import ChatBox from '../components/chat/ChatBox.jsx';
import ProfilePanel from '../components/profile/ProfilePanel.jsx';
import { UseAuthStore } from '../stores/UseAuthStore.jsx';

const Chat = () => {
    const userStore = UseAuthStore((state) => state.userStore);

    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <>
            <div className="flex flex-col md:flex-row h-screen bg-black p-1 font-sans relative">
                <Sidebar
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    user={userStore}
                />

                <ChatBox
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                />

                <ProfilePanel selectedUser={selectedUser} />
            </div>
        </>
    );
};

export default Chat;
