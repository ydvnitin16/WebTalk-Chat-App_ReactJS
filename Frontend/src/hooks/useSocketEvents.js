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
        updateMessageStatus,
        selectedUserId,
        updateAllMessagesStatus,
    } = useChatStore();

    const { setCall, updateCallStatus, syncCallId } = useCallStore();


    useEffect(() => {
        if (!selectedUserId) return;
        socket.emit("messages-seen", { senderId: selectedUserId });

        return () => {
            socket.off("messages-seen");
        };
    }, [selectedUserId]);

    useEffect(() => {
        const handleUserOnline = (id) => {
            setUserStatus(id, true);
        };
        const handleUserOffline = (id) => {
            setUserStatus(id, false);
        };
        const handleIncomingMessage = ({ message }) => {
            // if conversation is new than sync the user
            if (!users[message.sender._id]) {
                addUser(message.sender);
                setUserStatus(message.sender._id, true);
            }
            message.sender = message.sender._id;
            message.receiver = message.receiver._id;
            addMessage(message);

            updateConversationLastMessage(message);
            if (
                selectedUserId &&
                selectedUserId?.toString() === message?.sender.toString()
            ) {
                socket.emit("message-seen", {
                    messageId: message._id,
                    from: message.sender,
                });
            } else {
                socket.emit("message-delivered", {
                    messageId: message._id,
                    from: message.sender,
                });
            }
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

        socket.on("message-sent", ({ messageId, tempId }) => {
            updateMessageStatus({ tempId, messageId, status: "sent" });
        });

        socket.on("message-status-update", ({ messageId, status }) => {
            updateMessageStatus({ messageId, status });
        });

        socket.on("messages-seen", ({ sendTo, messageIds }) => {
            updateAllMessagesStatus({ sendTo, messageIds, status: "seen" });
        });

        socket.on("messages-delivered", ({ sendTo, messageIds }) => {
            updateAllMessagesStatus({
                sendTo,
                messageIds,
                status: "delivered",
            });
        });

        const handleAcceptedCall = async ({ from, answer, callId }) => {
            socket.emit("call-status", { to: from, status: "connected" });
            syncCallId(callId);
            currentAnswer.current = answer;
            updateCallStatus("connected");

            if (!peerConnection.current || !answer?.type || !answer?.sdp) {
                console.error("Peer connection or answer missing:", {
                    hasPeerConnection: !!peerConnection.current,
                    answer,
                });
                return;
            }

            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(answer),
            );

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
        };

        socket.on("call-status", ({ status }) => {
            2;
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
        });
        socket.on("cancel-call", () => {
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
        });

        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-accepted", handleAcceptedCall);
        socket.on("ice-candidate", addIceCandidate);
        socket.on("user-online", handleUserOnline);
        socket.on("user-offline", handleUserOffline);
        socket.on("receive-message", handleIncomingMessage);
        socket.on("typing", handleTyping);
        socket.on("stop-typing", handleStopTyping);

        return () => {
            socket.off("receive-message", handleIncomingMessage);
            socket.off("message-sent");
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
        selectedUserId
    ]);
};
