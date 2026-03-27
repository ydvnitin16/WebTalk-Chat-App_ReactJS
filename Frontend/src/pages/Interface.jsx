import ProfilePanel from "@/components/profile/ProfilePanel";
import CallManager from "@/features/call/components/CallManager";
import useCallHistory from "@/features/call/hooks/useCallHistory";
import ChatBox from "@/features/chat/components/ChatArea/ChatBox";
import Sidebar from "@/features/chat/components/Sidebar/Sidebar";
import { useConversations } from "@/features/chat/hooks/useConversations";
import { useMessages } from "@/features/chat/hooks/useMessages";

const Interface = () => {
    // Load conversations when component mounts
    useConversations();
    useMessages();
    useCallHistory();

    return (
        <>
            <div className='flex flex-col md:flex-row h-screen dark:bg-black md:px-2 font-sans relative'>
                <Sidebar />
                <ChatBox />
                <CallManager />
                <ProfilePanel />
            </div>
        </>
    );
};

export default Interface;

// In this architecture we will update the zustand store and get everything from there we will not keep stores
// Because everything happening in real-time we manage things through socket and api both so at once we update though api then we update the state on socket emits

// const onToggleMic = () => {
//         if (localStream.current) {
//             localStream.current.getAudioTracks().forEach((track) => {
//                 track.enabled = !track.enabled;
//             });
//             setIsMicOn((prev) => !prev);
//         }
//     };

//     // Toggle Camera
//     const onToggleCamera = () => {
//         if (localStream.current) {
//             localStream.current.getVideoTracks().forEach((track) => {
//                 track.enabled = !track.enabled;
//             });
//             setIsCameraOn((prev) => !prev);
//         }
//     };
