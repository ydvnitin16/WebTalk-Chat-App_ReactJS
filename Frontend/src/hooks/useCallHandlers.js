import useWebRTC from "@/features/call/hooks/useWebRTC";
import { socket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore from "@/stores/useCallStore";

export const useCallHandlers = () => {
    const {
        setCall,
        updateCallStatus,
        clearCall,
        updateCallInHistory,
        addCallToHistory,
    } = useCallStore();
    const { clearConnection, applyAnswer, addIceCandidate } = useWebRTC();
    const { currentUser } = useAuthStore();

    const onIncoming = ({ callId, conversationId, callerId, type, offer }) => {
        const { call } = useCallStore.getState();
        if (call) return; // already on a call — server already knows via busy check

        const incomingCall = {
            callId,
            _id: callId,
            clientCallId: null,
            conversationId,
            callerId,
            receiverId: currentUser.id,
            type,
            offer,
            createdAt: Date.now(),
            status: "ringing",
        };

        setCall(incomingCall);
        addCallToHistory(incomingCall);

        socket.emit("call:status", {
            callId,
            toUserId: callerId,
            status: "ringing",
        });
    };

    const onAccepted = async ({ answer }) => {
        await applyAnswer(answer);
        updateCallStatus("connected");

        const { call } = useCallStore.getState();
        if (call)
            updateCallInHistory(
                { callId: call.callId, clientCallId: call.clientCallId },
                { status: "connected", startedAt: Date.now() },
            );
    };

    const onRejected = ({ callId }) => {
        updateCallInHistory(
            { callId },
            { status: "rejected", endedAt: Date.now() },
        );
        clearConnection();
        clearCall();
    };

    // Caller hung up before we picked up - clears the incoming call screen
    const onCancelled = ({ callId }) => {
        updateCallInHistory(
            { callId },
            { status: "cancelled", endedAt: Date.now() },
        );
        clearConnection();
        clearCall();
    };

    const onEnded = ({ callId }) => {
        updateCallInHistory(
            { callId },
            { status: "completed", endedAt: Date.now() },
        );
        clearConnection();
        clearCall();
    };

    const onMissed = ({ callId }) => {
        updateCallInHistory(
            { callId },
            { status: "missed", endedAt: Date.now() },
        );
        clearConnection();
        clearCall();
    };

    const onStatus = ({ status }) => updateCallStatus(status);

    const onIceCandidate = ({ candidate }) => addIceCandidate(candidate);

    return {
        "call:incoming": onIncoming,
        "call:accepted": onAccepted,
        "call:rejected": onRejected,
        "call:cancelled": onCancelled,
        "call:ended": onEnded,
        "call:missed": onMissed,
        "call:status": onStatus,
        "call:ice-candidate": onIceCandidate,
    };
};
