import React, { useEffect } from "react";
import IncomingCallScreen from "./IncomingCallScreen";
import OutgoingCallScreen from "./OutgoingCallScreen";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore, { currentOffer } from "@/stores/useCallStore";
import useChatStore from "@/stores/useChatStore";
import { socket } from "@/lib/socket";
import useCall from "../hooks/useCall";
import ActiveCallScreen from "./ActiveCallScreen";

const CallManager = () => {
    const { currentUser } = useAuthStore();
    const { call, setCall } = useCallStore();
    const { acceptCall, rejectCall, endCall } = useCall();

    if (!call) {
        return null;
    }

    if (call.caller._id !== currentUser.id && call.status !== "connected") {
        return (
            <IncomingCallScreen
                callerName={call.caller.name}
                callerAvatar={call.caller.avatar}
                onAccept={() =>
                    acceptCall({
                        offer: currentOffer.current,
                        callerId: call.caller._id,
                        callType: call.type,
                    })
                }
                onReject={() => rejectCall({ callerId: call.caller._id })}
            />
        );
    }

    return (
        <>
            <ActiveCallScreen
                isCaller={call.caller._id === currentUser.id}
                call={call}
            />
        </>
    );
};

export default CallManager;
