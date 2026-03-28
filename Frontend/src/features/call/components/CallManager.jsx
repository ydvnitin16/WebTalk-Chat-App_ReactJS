import React from "react";
import IncomingCallScreen from "./IncomingCallScreen";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore, { currentOffer } from "@/stores/useCallStore";
import useCall from "../hooks/useCall";
import ActiveCallScreen from "./ActiveCallScreen";

const CallManager = () => {
    const { currentUser } = useAuthStore();
    const { call } = useCallStore();
    const { acceptCall, rejectCall, endCall } = useCall();

    if (!call) {
        return null;
    }

    const isCaller = call.caller._id === currentUser.id;

    if (call.caller._id !== currentUser.id && call.status !== "connected") {
        return (
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
                    rejectCall({ callerId: call.caller._id, callId: call._id })
                }
            />
        );
    }

    return (
        <>
            <ActiveCallScreen
                isCaller={call.caller._id === currentUser.id}
                call={call}
                endCall={() =>
                    endCall({
                        to: isCaller ? call.receiver._id : call.caller._id,
                        callId: call._id,
                    })
                }
            />
        </>
    );
};

export default CallManager;

// 3. implement mute and speaker feature
// 4. implement call busy and rejected UI]
