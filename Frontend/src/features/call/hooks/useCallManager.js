// import { v4 as uuid } from "uuid";
import { socket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore from "@/stores/useCallStore";
import useWebRTC from "./useWebRTC";
import { generateUUID } from "@/features/chat/hooks/useSendMessages";

const useCallManager = () => {
    const {
        setCall,
        syncCallId,
        clearCall,
        media,
        toggleMic,
        toggleCamera,
        addCallToHistory,
        updateCallInHistory,
    } = useCallStore();
    const { currentUser } = useAuthStore();
    const { buildOffer, buildAnswer, clearConnection } = useWebRTC();

    const startCall = async ({ conversationId, receiverId, type }) => {
        const clientCallId = generateUUID();

        const callObj = {
            clientCallId,
            callId: null,
            conversationId,
            callerId: currentUser.id,
            receiverId,
            type,
            status: "calling",
            createdAt: Date.now(),
        };

        setCall(callObj);
        addCallToHistory(callObj);

        const offer = await buildOffer(receiverId, type);

        socket.emit(
            "call:initiate",
            { clientCallId, conversationId, receiverId, type, offer },

            (ack) => {
                if (!ack.ok) {
                    clearConnection();
                    clearCall();
                    return;
                }
                syncCallId(ack.callId);
                // update the call history entry with server call id/status
                updateCallInHistory(
                    { clientCallId },
                    { _id: ack.callId, callId: ack.callId, status: ack.status },
                );
            },
        );
    };

    const acceptCall = async () => {
        const { call } = useCallStore.getState();
        if (!call) return;

        const callId = call.callId || call._id;
        const answer = await buildAnswer(call.callerId, call.type, call.offer);
        
        socket.emit("call:accept", { callId, answer }, (ack) => {
            if (ack.ok) {
                useCallStore.getState().updateCallStatus("connected");
                updateCallInHistory({ callId }, { status: "connected", startedAt: Date.now() });
            }
        });
    };

    const rejectCall = () => {
        const { call } = useCallStore.getState();
        if (!call) return;
        const callId = call.callId || call._id;
        
        socket.emit("call:reject", { callId });
        updateCallInHistory({ callId, clientCallId: call.clientCallId }, { status: "rejected", endedAt: Date.now() });
        clearConnection();
        clearCall();
    };

    const endCall = () => {
        const { call } = useCallStore.getState();
        if (!call) return;
        
        const callId = call.callId || call._id;
        socket.emit("call:end", { callId });
        updateCallInHistory({ callId, clientCallId: call.clientCallId }, { status: "ended", endedAt: Date.now() });
        clearConnection();
        clearCall();
    };

    const onToggleMic = () => {
        useCallStore.getState();
        import("@/stores/useCallStore").then(({ localStream }) => {
            localStream?.current
                ?.getAudioTracks()
                .forEach((t) => (t.enabled = !t.enabled));
        });
        toggleMic();
    };

    const onToggleCamera = () => {
        import("@/stores/useCallStore").then(({ localStream }) => {
            localStream?.current
                ?.getVideoTracks()
                .forEach((t) => (t.enabled = !t.enabled));
        });
        toggleCamera();
    };

    return {
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        onToggleMic,
        onToggleCamera,
        mic: media.mic,
        camera: media.camera,
    };
};

export default useCallManager;
