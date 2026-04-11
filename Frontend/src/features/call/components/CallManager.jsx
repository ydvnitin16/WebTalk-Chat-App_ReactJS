import React, { lazy, Suspense } from "react";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore, { currentOffer } from "@/stores/useCallStore";
import useCall from "../hooks/useCall";
import Loading from "@/components/ui/Loading";
const IncomingCallScreen = lazy(() => import("./IncomingCallScreen"));
const ActiveCallScreen = lazy(() => import("./ActiveCallScreen"));

const CallManager = () => {
    const { currentUser } = useAuthStore();
    const { call, media } = useCallStore();
    const {
        acceptCall,
        rejectCall,
        endCall,
        cancelCall,
        onToggleMic,
        onToggleCamera,
    } = useCall();

    if (!call) {
        return null;
    }

    const isCaller = call.caller._id === currentUser.id;

    if (call.caller._id !== currentUser.id && call.status !== "connected") {
        return (
            <Suspense fallback={<Loading />}>
                <IncomingCallScreen
                    callerName={call.caller.name}
                    callerAvatar={call.caller.avatar?.url || call.caller.avatar}
                    onAccept={() =>
                        acceptCall({
                            offer: currentOffer.current,
                            callerId: call.caller._id,
                            callType: call.type,
                            callId: call._id,
                        })
                    }
                    onReject={() =>
                        rejectCall({
                            callerId: call.caller._id,
                            callId: call._id,
                        })
                    }
                />
            </Suspense>
        );
    }

    return (
        <>
            <Suspense fallback={<Loading />}>
                <ActiveCallScreen
                    isCaller={call.caller._id === currentUser.id}
                    call={call}
                    endCall={() =>
                        call.status !== "connected"
                            ? cancelCall({
                                  to: isCaller
                                      ? call.receiver._id
                                      : call.caller._id,
                                  callId: call._id,
                              })
                            : endCall({
                                  to: isCaller
                                      ? call.receiver._id
                                      : call.caller._id,
                                  callId: call._id,
                              })
                    }
                    mic={media.mic}
                    onToggleMic={onToggleMic}
                    camera={media.camera}
                    onToggleCamera={onToggleCamera}
                />
            </Suspense>
        </>
    );
};

export default CallManager;

// 3. implement mute and speaker feature
// 4. implement call busy and rejected UI]
