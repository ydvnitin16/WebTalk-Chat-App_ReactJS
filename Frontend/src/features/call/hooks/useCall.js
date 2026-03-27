import { socket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore, {
    localStream,
    peerConnection,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    currentOffer,
    pendingIceCandidates,
} from "@/stores/useCallStore";
import useChatStore from "@/stores/useChatStore";

const useCall = () => {
    const { setCall, updateCallStatus } = useCallStore();
    const { currentUser } = useAuthStore();
    const { conversations, users } = useChatStore();

    const turnUrls = (import.meta.env.VITE_TURN_URLS || "")
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

    const servers = {
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

    const syncVideoElements = () => {
        if (localVideoRef.current && localStream.current) {
            localVideoRef.current.srcObject = localStream.current;
        }

        if (remoteVideoRef.current && remoteStream.current) {
            remoteVideoRef.current.srcObject = remoteStream.current;
        }
    };

    const flushPendingIceCandidates = async () => {
        if (
            !peerConnection.current ||
            !peerConnection.current.remoteDescription
        ) {
            return;
        }

        while (pendingIceCandidates.current.length) {
            const candidate = pendingIceCandidates.current.shift();
            try {
                await peerConnection.current.addIceCandidate(
                    new RTCIceCandidate(candidate),
                );
            } catch (error) {
                console.error("ICE flush error:", error);
            }
        }
    };

    const createPeerConnection = (to) => {
        peerConnection.current = new RTCPeerConnection(servers);
        remoteStream.current = new MediaStream();
        syncVideoElements();

        peerConnection.current.ontrack = (event) => {
            const [stream] = event.streams;

            if (stream) {
                remoteStream.current = stream;
                syncVideoElements();
                return;
            }

            event.track &&
                !remoteStream.current
                    .getTracks()
                    .some((track) => track.id === event.track.id) &&
                remoteStream.current.addTrack(event.track);

            syncVideoElements();
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    to,
                    candidate: event.candidate.toJSON(),
                });
            }
        };
    };

    async function startCall({ callType = "audio", receiverId }) {
        const tempId = `temp-${Date.now()}`;

        const receiver = users[receiverId];
        const conversation = conversations.find(
            (c) =>
                c.participants.includes(currentUser.id) &&
                c.participants.includes(receiver._id),
        );
        const startedAt = new Date();

        const callObj = {
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
            startedAt,
        };
        console.log(callObj);
        setCall(callObj);

        const to = callObj.receiver._id;
        pendingIceCandidates.current = [];
        localStream.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callType === "video",
        });
        syncVideoElements();

        createPeerConnection(to);
        localStream.current.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, localStream.current);
        });
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        console.log("Sending the offer: ", {
            offer,
            to,
        });

        socket.emit("outgoing-call", {
            offer,
            to,
            callObj,
        });
    }

    async function acceptCall({ offer, callerId, callType }) {
        console.log("accpet call fn triggered");

        updateCallStatus("connected");

        const to = callerId;
        pendingIceCandidates.current = [];

        createPeerConnection(to);

        // get our medias
        localStream.current = await navigator.mediaDevices.getUserMedia({
            video: callType === "video",
            audio: true,
        });
        syncVideoElements();

        // Add local tracks
        localStream.current.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, localStream.current);
        });

        if (!offer || !offer.type || !offer.sdp) {
            console.error("Invalid offer:", offer);
            return;
        }

        await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(offer),
        );
        await flushPendingIceCandidates();

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("call-accepted", { to, answer });
    }

    async function rejectCall({ callerId }) {
        socket.emit("reject-call", { to: callerId });
        currentOffer.current = null;
        setCall(null);
    }

    async function endCall({ to, callId }) {
        if (to) {
            socket.emit("end-active-call", { to, callId });
        }

        if (localStream.current) {
            localStream.current.getTracks().forEach((track) => {
                track.stop();
            });
            localStream.current = null;
        }

        if (remoteStream.current) {
            remoteStream.current.getTracks().forEach((track) => {
                track.stop();
            });
            remoteStream.current = null;
        }

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        pendingIceCandidates.current = [];
        currentOffer.current = null;

        setCall(null);

        console.log("Call ended cleanly ✅");
    }

    return { startCall, acceptCall, rejectCall, endCall };
};

export default useCall;
