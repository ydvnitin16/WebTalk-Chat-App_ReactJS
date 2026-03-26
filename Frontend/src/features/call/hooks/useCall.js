import { socket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import useCallStore, {
    localStream,
    peerConnection,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
} from "@/stores/useCallStore";
import useChatStore from "@/stores/useChatStore";
import React, { useRef } from "react";

const useCall = () => {
    const { setCall, updateCallStatus } = useCallStore();
    const { currentUser } = useAuthStore();
    const { conversations, users } = useChatStore();

    const servers = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
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
        localStream.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callType === "video",
        });
        localVideoRef.current.srcObject = localStream.current;

        // Create offer
        peerConnection.current = new RTCPeerConnection(servers);

        remoteStream.current = new MediaStream();
        remoteVideoRef.current.srcObject = remoteStream.current;

        localStream.current.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, localStream.current);
        });

        peerConnection.current.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.current.addTrack(track);
            });
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    to,
                    candidate: event.candidate,
                });
            }
        };
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

    async function acceptCall({ offer, callerId }) {
        console.log("accpet call fn triggered");

        updateCallStatus("connected");

        const to = callerId;

        peerConnection.current = new RTCPeerConnection(servers);

        // get our medias
        localStream.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        localVideoRef.current.srcObject = localStream.current;

        // get remote stream
        remoteStream.current = new MediaStream();
        remoteVideoRef.current.srcObject = remoteStream.current;

        // Add local tracks
        localStream.current.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, localStream.current);
        });

        // Receive remote tracks
        peerConnection.current.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.current.addTrack(track);
            });
        };

        // send ice candidate
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    candidate: event.candidate,
                    to,
                });
            }
        };

        await peerConnection.current.setRemoteDescription(offer);

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("call-accepted", { to, answer });
    }

    return { startCall, acceptCall };
};

export default useCall;
