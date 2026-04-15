import { lazy, Suspense, useEffect } from "react";
const CallManager = lazy(
    () => import("@/features/call/components/CallManager"),
);
const ChatBox = lazy(
    () => import("@/features/chat/components/ChatArea/ChatBox"),
);
import Sidebar from "@/features/chat/components/Sidebar/Sidebar";
import { useConversations } from "@/features/chat/hooks/useConversations";
import useOfflineSync from "@/features/chat/hooks/useOfflineSync";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import useCallStore from "@/stores/useCallStore";
import useChatStore from "@/stores/useChatStore";
import ChatSkeleton from "@/components/skeletons/ChatSkeleton";
import CallConnectingSkeleton from "@/components/skeletons/CallConnectingSkeleton";
import ErrorBoundary from "@/ErrorBoundary";

const Interface = () => {
    const currentUser = useAuthStore((state) => state.currentUser);
    const { selectedUserId } = useChatStore();
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
                <ErrorBoundary>
                    <Sidebar />
                </ErrorBoundary>
                {selectedUserId && (
                    <ErrorBoundary>
                        <Suspense fallback={<ChatSkeleton />}>
                            <ChatBox />
                        </Suspense>
                    </ErrorBoundary>
                )}
                {call && (
                    <ErrorBoundary>
                        <Suspense fallback={<CallConnectingSkeleton />}>
                            <CallManager />
                        </Suspense>
                    </ErrorBoundary>
                )}
            </div>
        </>
    );
};

export default Interface;

// In this architecture we will update the zustand store and get everything from there we will not keep stores
// Because everything happening in real-time we manage things through socket and api both so at once we update though api then we update the state on socket emits
