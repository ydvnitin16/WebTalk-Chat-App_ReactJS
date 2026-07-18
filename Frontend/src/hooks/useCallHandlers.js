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
    };

    const onRejected = () => {
        clearConnection();
        clearCall();
    };

    const onBusy = () => {
        clearConnection();
        clearCall();
    };

    const onEnded = () => {
        clearConnection();
        clearCall();
    };

    const onMissed = () => {
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
