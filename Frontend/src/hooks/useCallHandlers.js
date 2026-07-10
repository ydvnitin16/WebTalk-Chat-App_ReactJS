import useCallStore, {
    currentAnswer,
    currentOffer,
    localStream,
    localVideoRef,
    pendingIceCandidates,
    peerConnection,
    remoteStream,
    remoteVideoRef,
} from "@/stores/useCallStore";

export const cleanupCallRefs = () => {
    [localStream, remoteStream].forEach((ref) => {
        ref.current?.getTracks().forEach((t) => t.stop());
        ref.current = null;
    });

    peerConnection.current?.close();

    [peerConnection, localVideoRef, remoteVideoRef].forEach((ref) => {
        if (ref.current) ref.current.srcObject = null;
        ref.current = null;
    });

    pendingIceCandidates.current = [];
    currentOffer.current = null;
    currentAnswer.current = null;
};

export const useCallHandlers = () => {
    const { setCall, updateCallStatus, syncCallId } = useCallStore();

    const onIncomingCall = ({ offer, from, call }) => {
        const { call: activeCall } = useCallStore.getState();
        if (activeCall) return; // already on a call
        currentOffer.current = offer;
        setCall(call);
        // notify caller we're ringing
        import("@/lib/socket").then(({ socket }) =>
            socket.emit("call-status", { to: from, status: "ringing" }),
        );
    };

    const onSyncCallId = ({ callId }) => syncCallId(callId);

    const onCallAccepted = async ({ from, answer, callId }) => {
        syncCallId(callId);
        currentAnswer.current = answer;
        updateCallStatus("connected");

        import("@/lib/socket").then(({ socket }) =>
            socket.emit("call-status", { to: from, status: "connected" }),
        );

        if (!peerConnection.current || !answer?.type) return;

        await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer),
        );

        while (pendingIceCandidates.current.length) {
            try {
                await peerConnection.current.addIceCandidate(
                    new RTCIceCandidate(pendingIceCandidates.current.shift()),
                );
            } catch (e) {
                console.error("ICE flush error:", e);
            }
        }
    };

    const onIceCandidate = async ({ candidate }) => {
        if (!peerConnection.current?.remoteDescription) {
            pendingIceCandidates.current.push(candidate);
            return;
        }
        try {
            await peerConnection.current.addIceCandidate(
                new RTCIceCandidate(candidate),
            );
        } catch (e) {
            console.error("ICE error:", e);
        }
    };

    // Server emits "call-ended" for reject / end / cancel
    const onCallEnded = () => {
        cleanupCallRefs();
        setCall(null);
    };

    const onCallStatus = ({ status }) => updateCallStatus(status);

    return {
        "incoming-call": onIncomingCall,
        "sync-call-id": onSyncCallId,
        "call-accepted": onCallAccepted,
        "ice-candidate": onIceCandidate,
        "call-ended": onCallEnded,
        "call-status": onCallStatus,
    };
};
