import React, { lazy, Suspense } from "react";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore from "@/stores/useCallStore";
// import useCall from "../hooks/useCall";
import CallConnectingSkeleton from "@/components/skeletons/CallConnectingSkeleton";
import useCallManager from "../hooks/useCallManager";
import useMemberStore from "@/stores/useMemberStore";
const IncomingCallScreen = lazy(() => import("./IncomingCallScreen"));
const ActiveCallScreen = lazy(() => import("./ActiveCallScreen"));

const CallManager = () => {
    const { currentUser } = useAuthStore();
    const { call, media } = useCallStore();
    const { acceptCall, rejectCall, endCall, onToggleMic, onToggleCamera } =
        useCallManager();
    const { users } = useMemberStore();

    if (!call) {
        return null;
    }

    const isCaller = call.callerId === currentUser.id;
    const user = isCaller ? users[call.receiverId] : users[call.callerId];

    if (!isCaller && call.status !== "connected") {
        return (
            <Suspense fallback={<CallConnectingSkeleton />}>
                <IncomingCallScreen
                    callerName={user?.name || "Unknown"}
                    callerAvatar={user?.avatar?.url || null}
                    onAccept={acceptCall}
                    onReject={rejectCall}
                />
            </Suspense>
        );
    }

    return (
        <>
            <Suspense fallback={<CallConnectingSkeleton />}>
                <ActiveCallScreen
                    isCaller={isCaller}
                    call={call}
                    user={user}
                    endCall={() =>
                        call.status !== "connected" ? rejectCall() : endCall()
                    }
                    mic={media.mic}
                    camera={media.camera}
                    onToggleMic={onToggleMic}
                    onToggleCamera={onToggleCamera}
                />
            </Suspense>
        </>
    );
};

export default CallManager;

// 3. implement mute and speaker feature
// 4. implement call busy and rejected UI]
