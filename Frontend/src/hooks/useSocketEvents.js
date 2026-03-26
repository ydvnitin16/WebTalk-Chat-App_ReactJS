import { socket } from "@/lib/socket";
import useCallStore, {
    currentAnswer,
    currentOffer,
    localStream,
    localVideoRef,
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

    const { setCall, updateCallStatus, call } = useCallStore();

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

        const handleIncomingCall = ({ offer, from, callObj }) => {
            socket.emit("call-status", { to: from, status: "ringing" });
            currentOffer.current = offer;
            setCall(callObj);
        };

        const handleAcceptedCall = async ({ from, answer }) => {
            socket.emit("call-status", { to: from, status: "connected" });
            console.log("Call accepted");
            currentAnswer.current = answer;
            updateCallStatus("connected");
            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(answer),
            );
        };

        const addIceCandidate = async ({ candidate }) => {
            try {
                await peerConnection.current?.addIceCandidate(candidate);
            } catch (err) {
                console.error("ICE error:", err);
            }
        };

        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-accepted", handleAcceptedCall);
        socket.on("ice-candidate", addIceCandidate);

        socket.on("call-status", ({ status }) => {
            console.log(status);
            updateCallStatus(status);
        });

        socket.on("reject-call", () => {
            setCall(null);
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
