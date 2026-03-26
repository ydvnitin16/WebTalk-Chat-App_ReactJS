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
    const { acceptCall } = useCall();

    if (!call) {
        return null;
    }

    const onCancel = () => {
        setCall(null);
        socket.emit("reject-call", { to: call.receiver._id });
    };

    const onReject = () => {
        setCall(null);
        socket.emit("reject-call", { to: call.caller._id });
    };

    if (call.caller._id !== currentUser.id && call.status !== "connected") {
        return (
            <IncomingCallScreen
                callerName={call.caller.name}
                callerAvatar={call.caller.avatar}
                onAccept={acceptCall}
                onReject={onReject}
            />
        );
    }

    // Remove the media devices and make the complete flow of calling than make the media devices flow.
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
