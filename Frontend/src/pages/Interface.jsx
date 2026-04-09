import ProfilePanel from "@/components/profile/ProfilePanel";
import CallManager from "@/features/call/components/CallManager";
import ChatBox from "@/features/chat/components/ChatArea/ChatBox";
import Sidebar from "@/features/chat/components/Sidebar/Sidebar";
import { useConversations } from "@/features/chat/hooks/useConversations";

const Interface = () => {
    // Load conversations when component mounts
    useConversations();

    return (
        <>
            <div className='flex flex-col md:flex-row h-screen dark:bg-black bg-white md:px-2 font-sans relative'>
                <Sidebar />
                <ChatBox />
                <CallManager />
                <ProfilePanel />
            </div>
        </>
    );
};

export default Interface;

// 3. handle edge cases and fix teh architecture bugs needs to solve
// 4. scale it to a certain level and get ready for interview

// In this architecture we will update the zustand store and get everything from there we will not keep stores
// Because everything happening in real-time we manage things through socket and api both so at once we update though api then we update the state on socket emits
