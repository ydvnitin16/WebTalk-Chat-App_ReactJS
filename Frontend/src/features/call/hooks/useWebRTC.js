import {
    peerConnection,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    pendingIceCandidates,
} from "@/stores/useCallStore";
import { socket } from "@/lib/socket";

const iceServers = () => {
    return {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
};

const playMediaSafely = async (element) => {
    if (!element) return;
    try {
        if (element.paused !== false) {
            await element.play();
        }
    } catch (e) {
        // Suppress noisy AbortError logs caused by rapid srcObject changes
        if (e && e.name === "AbortError") return;
        console.warn("Media playback blocked:", e);
    }
};

const attachVideoElements = () => {
    if (localVideoRef.current && localStream.current) {
        localVideoRef.current.srcObject = localStream.current;
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;
        playMediaSafely(localVideoRef.current);
    }
    if (remoteVideoRef.current && remoteStream.current) {
        remoteVideoRef.current.srcObject = remoteStream.current;
        remoteVideoRef.current.playsInline = true;
        playMediaSafely(remoteVideoRef.current);
    }
};

const openPeerConnection = (peerUserId) => {
    peerConnection.current = new RTCPeerConnection(iceServers());
    remoteStream.current = new MediaStream();
    attachVideoElements();

    peerConnection.current.ontrack = ({ streams: [stream], track }) => {
        if (stream) remoteStream.current = stream;
        else if (
            !remoteStream.current.getTracks().some((t) => t.id === track.id)
        ) {
            remoteStream.current.addTrack(track);
        }
        attachVideoElements();
    };

    peerConnection.current.onicecandidate = ({ candidate }) => {
        if (candidate)
            socket.emit("call:ice-candidate", {
                toUserId: peerUserId,
                candidate: candidate,
            });
    };
};

const captureLocalMedia = async (callType) => {
    localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
    });
    localStream.current
        .getTracks()
        .forEach((track) =>
            peerConnection.current.addTrack(track, localStream.current),
        );
    attachVideoElements();
};

const flushPendingIceCandidates = async () => {
    if (!peerConnection.current?.remoteDescription) return;
    while (pendingIceCandidates.current.length) {
        const candidate = pendingIceCandidates.current.shift();
        try {
            await peerConnection.current.addIceCandidate(
                new RTCIceCandidate(candidate),
            );
        } catch (e) {
            console.error("ICE flush failed:", e);
        }
    }
};

const buildOffer = async (peerUserId, callType) => {
    openPeerConnection(peerUserId);
    await captureLocalMedia(callType);

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    return offer;
};

const buildAnswer = async (peerUserId, callType, offer) => {
    openPeerConnection(peerUserId);
    await captureLocalMedia(callType);

    await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer),
    );
    await flushPendingIceCandidates();

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    return answer;
};

const applyAnswer = async (answer) => {
    await peerConnection.current?.setRemoteDescription(
        new RTCSessionDescription(answer),
    );
    await flushPendingIceCandidates();
};

const addIceCandidate = async (candidate) => {
    if (!peerConnection.current?.remoteDescription) {
        pendingIceCandidates.current.push(candidate);
        return;
    }
    try {
        await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate),
        );
    } catch (e) {
        console.error("ICE add failed:", e);
    }
};

const clearConnection = () => {
    [localStream, remoteStream].forEach((ref) => {
        ref.current?.getTracks().forEach((t) => t.stop());
        ref.current = null;
    });
    peerConnection.current?.close();
    peerConnection.current = null;
    if (localVideoRef.current) {
        localVideoRef.current.pause();
        localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
        remoteVideoRef.current.pause();
        remoteVideoRef.current.srcObject = null;
    }
    pendingIceCandidates.current = [];
};

const useWebRTC = () => ({
    buildOffer,
    buildAnswer,
    applyAnswer,
    addIceCandidate,
    clearConnection,
});

export default useWebRTC;
