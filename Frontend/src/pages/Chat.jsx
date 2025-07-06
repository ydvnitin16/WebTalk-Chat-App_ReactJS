import Sidebar from '../components/bars/Sidebar.jsx';
import ChatBox from '../components/chat/ChatBox.jsx';
import ProfilePanel from '../components/profile/ProfilePanel.jsx';

const Chat = () => {

    return (
        <>
            <div className="flex flex-col md:flex-row h-screen bg-black md:px-2 py-2 font-sans relative">
                <Sidebar />

                <ChatBox />

                <ProfilePanel />
            </div>
        </>
    );
};

export default Chat;
