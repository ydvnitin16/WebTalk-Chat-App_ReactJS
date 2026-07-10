import { lazy, Suspense, useEffect } from "react";
const CallManager = lazy(
    () => import("@/features/call/components/CallManager"),
);
const ChatBox = lazy(() => import("@/features/chat/components/ChatBox"));
import Sidebar from "@/features/conversation/components/Sidebar";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import useCallStore from "@/stores/useCallStore";
import useMessageStore from "@/stores/useMessageStore";
import ChatSkeleton from "@/components/skeletons/ChatSkeleton";
import CallConnectingSkeleton from "@/components/skeletons/CallConnectingSkeleton";
import ErrorBoundary from "@/ErrorBoundary";

const Interface = () => {
    const currentUser = useAuthStore((state) => state.currentUser);
    const { activeConversationId } = useMessageStore();
    const { call } = useCallStore();
    useSocketEvents(toast);

    useEffect(() => {
        if (currentUser) {
            const activeSocket = connectSocket();
            return;
        }

        disconnectSocket();
    }, [currentUser]);

    return (
        <>
            <div className='flex flex-col md:flex-row h-screen dark:bg-black bg-[#FCFCFC] font-sans relative'>
                <ErrorBoundary>
                    <Sidebar />
                </ErrorBoundary>
                {!activeConversationId ? (
                    <div className='hidden md:flex flex-1 items-center justify-center h-full text-gray-400 bg-white rounded-4xl border-none md:rounded-none md:rounded-r-4xl dark:bg-zinc-950 dark:text-white'>
                        Select a chat to start messaging
                    </div>
                ) : (
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
