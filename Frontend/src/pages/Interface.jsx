import { lazy, Suspense, useEffect } from "react";
import Loading from "@/components/ui/Loading";
const CallManager = lazy(
    () => import("@/features/call/components/CallManager"),
);
import ChatBox from "@/features/chat/components/ChatArea/ChatBox";
import Sidebar from "@/features/chat/components/Sidebar/Sidebar";
import { useConversations } from "@/features/chat/hooks/useConversations";
import useOfflineSync from "@/features/chat/hooks/useOfflineSync";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import useCallStore from "@/stores/useCallStore";

const Interface = () => {
    const currentUser = useAuthStore((state) => state.currentUser);
    const { call } = useCallStore();
    useSocketEvents(toast);
    useOfflineSync();

    useEffect(() => {
        if (currentUser) {
            connectSocket();
            return;
        }

        disconnectSocket();
    }, [currentUser]);

    // Load conversations when component mounts
    useConversations();

    return (
        <>
            <div className='flex flex-col md:flex-row h-screen dark:bg-black bg-white md:px-2 font-sans relative'>
                <Sidebar />
                <ChatBox />
                {call && (
                    <Suspense fallback={<Loading />}>
                        <CallManager />
                    </Suspense>
                )}
            </div>
        </>
    );
};

export default Interface;

// 3. handle edge cases and fix teh architecture bugs needs to solve
// 4. scale it to a certain level and get ready for interview

// In this architecture we will update the zustand store and get everything from there we will not keep stores
// Because everything happening in real-time we manage things through socket and api both so at once we update though api then we update the state on socket emits
