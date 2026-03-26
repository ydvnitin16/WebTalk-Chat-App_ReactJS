import ProfilePanel from "@/components/profile/ProfilePanel";
import CallManager from "@/features/call/components/CallManager";
import ChatBox from "@/features/chat/components/ChatArea/ChatBox";
import Sidebar from "@/features/chat/components/Sidebar/Sidebar";
import { useConversations } from "@/features/chat/hooks/useConversations";
import { useMessages } from "@/features/chat/hooks/useMessages";

const Interface = () => {
    // Load conversations when component mounts
    useConversations();
    useMessages();

    return (
        <>
            <div className='flex flex-col md:flex-row h-screen bg-black md:px-2 py-2 font-sans relative'>
                <Sidebar />

                <ChatBox />
                {/* Here we can add a CAll UNIT component which has all the modals and functinality of call wiht managing the hooks etc */}
                {/* Steps */}
                {/* 1. We trigger the global state to show user is calling someone */}
                {/* 2. We manage the hooks and make the call connection */}
                {/* 3. callee get the call and get his state updated that someone is calling you with details */}
                {/* 4. ALso manage the user is busy or not */}
                {/* 5. We also send the flag that call is received or not so caller can know user is getting the call or not */}
                <CallManager />
                <ProfilePanel />
            </div>
        </>
    );
};

export default Interface;

// In this architecture we will update the zustand store and get everything from there we will not keep stores
// Because everything happening in real-time we manage things through socket and api both so at once we update though api then we update the state on socket emits
