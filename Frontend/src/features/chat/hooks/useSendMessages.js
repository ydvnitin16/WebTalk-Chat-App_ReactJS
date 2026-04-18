import { socket } from "@/lib/socket";
import { addToQueue } from "@/services/offlineQueue";
import useAuthStore from "@/stores/useAuthStore";
import useChatStore from "@/stores/useChatStore";
import { useState } from "react";

const useSendMessages = () => {
    const {
        addMessage,
        conversations,
        selectedUserId,
        setTyping,
        updateConversationLastMessage,
    } = useChatStore();
    const { currentUser } = useAuthStore();
    const { updateMessageStatus } = useChatStore();

    const [message, setMessage] = useState("");

    function sendMessage() {
        const sender = currentUser?.id;
        const receiver = selectedUserId;
        const content = message.trim();

        if (!sender || !receiver || !content) {
            return;
        }
        const createdAt = new Date();
        const tempId = `temp-${Date.now()}`;

        const conversation = conversations.find(
            (c) =>
                c.participants.includes(sender) &&
                c.participants.includes(receiver),
        );

        const conversationId = conversation?._id;

        const messageObj = {
            _id: tempId,
            tempId,
            conversation: conversationId,
            content,
            sender,
            receiver,
            createdAt,
            type: "text",
            status: "pending",
        };

        // add to store
        addMessage(messageObj);
        updateConversationLastMessage(messageObj);
        setMessage("");
        if (!navigator.onLine) {
            addToQueue(messageObj);
            return;
        }
        try {
            socket.emit("send-message", { content, sendTo: receiver, tempId });
        } catch (err) {
            updateMessageStatus({
                tempId,
                messageId: null,
                status: "failed",
            });
        }
    }

    return { sendMessage, message, setMessage };
};

export default useSendMessages;
