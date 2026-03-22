import ProfilePanel from "@/components/profile/ProfilePanel.jsx";
import VideoCall from "../../../pages/VideoCall.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import ChatBox from "../components/ChatArea/ChatBox.jsx";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages.js";

const Chat = () => {
    // Load conversations when component mounts
    useConversations();
    useMessages()

    return (
        <>
            <div className='flex flex-col md:flex-row h-screen bg-black md:px-2 py-2 font-sans relative'>
                <Sidebar />

                <ChatBox />
                <VideoCall />

                <ProfilePanel />
            </div>
        </>
    );
};

export default Chat;

// In this architecture we will update the zustand store and get everything from there we will not keep stores
// Because everything happening in real-time we manage things through socket and api both so at once we update though api then we update the state on socket emits
