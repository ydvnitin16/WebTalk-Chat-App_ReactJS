import { socket } from "@/lib/socket";
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
import useChatStore from "@/stores/useChatStore.js";
import { useEffect } from "react";

export const useSocketEvents = () => {
    const {
        addMessage,
        setTyping,
        setUserStatus,
        updateConversationLastMessage,
        users,
        addUser,
    } = useChatStore();

    const { setCall, updateCallStatus, syncCallId } = useCallStore();

    useEffect(() => {
        const handleUserOnline = (id) => {
            setUserStatus(id, true);
        };

        const handleUserOffline = (id) => {
            setUserStatus(id, false);
        };

        const handleIncomingMessage = ({ message }) => {
            addMessage(message);

            // if conversation is new than sync the user
            if (!users[message.sender._id]) {
                addUser(message.sender);
                setUserStatus(message.sender._id, true);
            }
            message.sender = message.sender._id;
            message.receiver = message.receiver._id;

            updateConversationLastMessage(message);
        };

        const handleTyping = (userId) => {
            setTyping(userId, true);
        };

        const handleStopTyping = (userId) => {
            setTyping(userId, false);
        };

        const handleIncomingCall = ({ offer, from, call }) => {
            socket.emit("call-status", { to: from, status: "ringing" });
            currentOffer.current = offer;
            setCall(call);
        };

        socket.on("sync-call-id", ({ callId }) => {
            syncCallId(callId);
        });

        const handleAcceptedCall = async ({ from, answer, callId }) => {
            socket.emit("call-status", { to: from, status: "connected" });
            // update the call id in the store here

            console.log("Call accepted");
            currentAnswer.current = answer;
            updateCallStatus("connected");
            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(answer),
            );

            while (pendingIceCandidates.current.length) {
                const candidate = pendingIceCandidates.current.shift();
                await peerConnection.current.addIceCandidate(
                    new RTCIceCandidate(candidate),
                );
            }
        };

        const addIceCandidate = async ({ candidate }) => {
            try {
                if (
                    !peerConnection.current ||
                    !peerConnection.current.remoteDescription
                ) {
                    pendingIceCandidates.current.push(candidate);
                    return;
                }

                await peerConnection.current.addIceCandidate(
                    new RTCIceCandidate(candidate),
                );
            } catch (err) {
                console.error("ICE error:", err);
            }
        };

        const handleCallEnd = () => {
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
        };

        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-accepted", handleAcceptedCall);
        socket.on("ice-candidate", addIceCandidate);

        socket.on("call-status", ({ status }) => {
            console.log(status);
            updateCallStatus(status);
        });
        socket.on("end-active-call", handleCallEnd);

        socket.on("reject-call", () => {
            setCall(null);
            pendingIceCandidates.current = [];
            currentOffer.current =
                localStream.current =
                remoteStream.current =
                peerConnection.current =
                localVideoRef.current =
                remoteVideoRef.current =
                currentOffer.current =
                currentAnswer.current =
                    null;
            console.log(
                currentOffer.current,
                localStream.current,
                remoteStream.current,
                peerConnection.current,
                localVideoRef.current,
                remoteVideoRef.current,
                currentOffer.current,
                currentAnswer.current,
                pendingIceCandidates.current,
            );
        });

        socket.on("user-online", handleUserOnline);
        socket.on("user-offline", handleUserOffline);
        socket.on("message", handleIncomingMessage);
        socket.on("typing", handleTyping);
        socket.on("stop-typing", handleStopTyping);

        return () => {
            socket.off("message", handleIncomingMessage);
            socket.off("user-online", handleUserOnline);
            socket.off("user-offline", handleUserOffline);
            socket.off("typing", handleTyping);
            socket.off("stop-typing", handleStopTyping);
            socket.off("incoming-call", handleIncomingCall);
            socket.off("call-accepted", handleAcceptedCall);
            socket.off("ice-candidate", addIceCandidate);
            socket.off("reject-call");
        };
    }, [
        addMessage,
        setTyping,
        setUserStatus,
        updateConversationLastMessage,
        users,
        addUser,
    ]);
};
