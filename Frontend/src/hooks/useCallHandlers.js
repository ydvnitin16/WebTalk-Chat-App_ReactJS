import useWebRTC from "@/features/call/hooks/useWebRTC";
import { socket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore from "@/stores/useCallStore";

export const useCallHandlers = () => {
    const { setCall, updateCallStatus, clearCall } = useCallStore();
    const { clearConnection, applyAnswer, addIceCandidate } = useWebRTC();
    const { currentUser } = useAuthStore();

    const onIncoming = ({ callId, conversationId, callerId, type, offer }) => {
        const { call } = useCallStore.getState();
        if (call) return; // already on a call — server already knows via busy check
       
        setCall({
            callId,
            clientCallId: null,
            conversationId,
            callerId,
            receiverId: currentUser.id,
            type,
            offer,
            createdAt: Date.now(),
            status: "ringing",
        });
        
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
        if (call) useCallStore.getState().updateCallInHistory({ callId: call.callId, clientCallId: call.clientCallId }, { status: "connected", startedAt: Date.now() });
    };

    const onRejected = ({ callId }) => {
        useCallStore.getState().updateCallInHistory({ callId }, { status: "rejected", endedAt: Date.now() });
        clearConnection();
        clearCall();
    };

    const onBusy = ({ callId, clientCallId }) => {
        const { call } = useCallStore.getState();
        if (!call) return;

        // Show busy status to the caller instead of immediately clearing
        updateCallStatus("busy");
        useCallStore.getState().updateCallInHistory({ callId, clientCallId }, { status: "busy" });

        // Let the UI display busy state and clean up after a timeout
        const BUSY_TIMEOUT_MS = 30 * 1000;
        setTimeout(() => {
            clearConnection();
            clearCall();
        }, BUSY_TIMEOUT_MS);
    };

    const onEnded = ({ callId }) => {
        useCallStore.getState().updateCallInHistory({ callId }, { status: "ended", endedAt: Date.now() });
        clearConnection();
        clearCall();
    };

    const onMissed = ({ callId }) => {
        useCallStore.getState().updateCallInHistory({ callId }, { status: "missed", endedAt: Date.now() });
        clearConnection();
        clearCall();
    };

    const onStatus = ({ status }) => {
        updateCallStatus(status);
    };

    const onIceCandidate = ({ candidate }) => addIceCandidate(candidate);

    return {
        "call:incoming": onIncoming,
        "call:accepted": onAccepted,
        "call:rejected": onRejected,
        "call:busy": onBusy,
        "call:ended": onEnded,
        "call:missed": onMissed,
        "call:status": onStatus,
        "call:ice-candidate": onIceCandidate,
    };
};
