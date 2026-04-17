import { socket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore, {
    localStream,
    peerConnection,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    currentOffer,
    currentAnswer,
    pendingIceCandidates,
} from "@/stores/useCallStore";
import useChatStore from "@/stores/useChatStore";

// ─── WebRTC config ────────────────────────────────────────────────────────────

const buildIceServers = () => {
    const turnUrls = (import.meta.env.VITE_TURN_URLS || "")
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);

    return {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            ...(turnUrls.length
                ? [
                      {
                          urls: turnUrls,
                          username: import.meta.env.VITE_TURN_USERNAME,
                          credential: import.meta.env.VITE_TURN_CREDENTIAL,
                      },
                  ]
                : []),
        ],
    };
};

// ─── Shared cleanup ───────────────────────────────────────────────────────────

const stopTracks = (streamRef) => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
};

export const cleanupCall = () => {
    stopTracks(localStream);
    stopTracks(remoteStream);

    peerConnection.current?.close();
    peerConnection.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    pendingIceCandidates.current = [];
    currentOffer.current = null;
    currentAnswer.current = null;
};

//  Hook

const useCall = () => {
    const { setCall, updateCallStatus, toggleMic, toggleCamera } =
        useCallStore();
    const { currentUser } = useAuthStore();
    const { conversations, users } = useChatStore();

    // Video element sync

    const syncVideoElements = () => {
        if (localVideoRef.current && localStream.current) {
            localVideoRef.current.srcObject = localStream.current;
            localVideoRef.current.muted = true;
            localVideoRef.current.playsInline = true;
            localVideoRef.current
                .play?.()
                .catch((e) => console.warn("Local playback blocked:", e));
        }
        if (remoteVideoRef.current && remoteStream.current) {
            remoteVideoRef.current.srcObject = remoteStream.current;
            remoteVideoRef.current.playsInline = true;
            remoteVideoRef.current
                .play?.()
                .catch((e) => console.warn("Remote playback blocked:", e));
        }
    };

    // PeerConnection

    const createPeerConnection = (to) => {
        peerConnection.current = new RTCPeerConnection(buildIceServers());
        remoteStream.current = new MediaStream();
        syncVideoElements();

        peerConnection.current.ontrack = ({ streams: [stream], track }) => {
            if (stream) {
                remoteStream.current = stream;
            } else if (
                track &&
                !remoteStream.current.getTracks().some((t) => t.id === track.id)
            ) {
                remoteStream.current.addTrack(track);
            }
            syncVideoElements();
        };

        peerConnection.current.onicecandidate = ({ candidate }) => {
            if (candidate)
                socket.emit("ice-candidate", {
                    to,
                    candidate: candidate.toJSON(),
                });
        };
    };

    // Media helper

    const getMedia = (callType) =>
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callType === "video",
        });

    const addTracksToConnection = () => {
        localStream.current
            .getTracks()
            .forEach((track) =>
                peerConnection.current.addTrack(track, localStream.current),
            );
    };

    // Flush ICE candidates

    const flushPendingIceCandidates = async () => {
        if (!peerConnection.current?.remoteDescription) return;
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

    // Public API

    const startCall = async ({ callType = "audio", receiverId }) => {
        const receiver = users[receiverId];
        const conversation = conversations.find(
            (c) =>
                c.participants.includes(currentUser.id) &&
                c.participants.includes(receiver._id),
        );
        const tempId = `temp-${Date.now()}`;

        setCall({
            tempId,
            _id: tempId,
            conversation,
            caller: {
                _id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
            },
            receiver: {
                _id: receiver._id,
                name: receiver.name,
                avatar: receiver.avatar.url,
            },
            type: callType,
            status: "calling",
            startedAt: new Date(),
        });

        pendingIceCandidates.current = [];
        localStream.current = await getMedia(callType);
        syncVideoElements();

        createPeerConnection(receiver._id);
        addTracksToConnection();

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit("outgoing-call", {
            offer,
            to: receiver._id,
            callObj: { tempId, type: callType },
        });
    };

    const acceptCall = async ({ offer, callerId, callType, callId }) => {
        updateCallStatus("connected");
        pendingIceCandidates.current = [];

        createPeerConnection(callerId);

        localStream.current = await getMedia(callType);
        syncVideoElements();
        addTracksToConnection();

        if (!offer?.type || !offer?.sdp) {
            console.error("Invalid offer:", offer);
            return;
        }

        await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(offer),
        );
        await flushPendingIceCandidates();

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit("call-accepted", { to: callerId, answer, callId });
    };

    const rejectCall = ({ callerId, callId }) => {
        socket.emit("reject-call", { to: callerId, callId });
        cleanupCall();
        setCall(null);
    };

    // endCall and cancelCall both cleanup fully — only the socket event differs
    const endCall = ({ to, callId }) => {
        socket.emit("end-active-call", { to, callId });
        cleanupCall();
        setCall(null);
    };

    const cancelCall = ({ callerId, callId }) => {
        socket.emit("cancel-call", { to: callerId, callId });
        cleanupCall();
        setCall(null);
    };

    const onToggleMic = () => {
        localStream.current?.getAudioTracks().forEach((t) => {
            t.enabled = !t.enabled;
        });
        toggleMic();
    };

    const onToggleCamera = () => {
        localStream.current?.getVideoTracks().forEach((t) => {
            t.enabled = !t.enabled;
        });
        toggleCamera();
    };

    return {
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        cancelCall,
        onToggleMic,
        onToggleCamera,
    };
};

export default useCall;
