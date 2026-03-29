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

// 1. Implement message status
// 2. Implement photos send on real-time no db interference
// 3. handle edge cases and fix teh architecture bugs needs to solve
// 4. scale it to a certain level and get ready for interview

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

// 1. App has a bug to fix :- if user calls and reject itself so the socket even end-active-call is triggered which update the call status in the db as completed fix it by adding a condtion if call is not connected and we are rejecting call so dont trigger the db status udpate as completed
