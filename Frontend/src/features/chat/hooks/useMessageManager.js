import { socket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import useConversationStore from "@/stores/useConversationStore";
import useMessageStore from "@/stores/useMessageStore";
import { generateUUID } from "@/utils/utils.js";

const useMessageManager = () => {
    const { getById, updateLastMessage } =
        useConversationStore();
    const {
        activeConversationId,
        addOptimistic,
        markFailed,
        markSending
    } = useMessageStore();
    const { currentUser } = useAuthStore();

    const buildPayload = ({
        conversationId,
        receiverId,
        content,
        type,
        clientMessageId,
    }) => {
        const isTempConversation = conversationId.startsWith("temp-");
        return {
            tempConversationId: isTempConversation ? conversationId : null,
            conversationId,
            receiverId,
            clientMessageId,
            content,
            type,
        };
    };

    const emitSend = (payload, clientMessageId, conversationId) => {
        try {
            socket.emit("message:send", payload, (ack) => {
                // if (!ack?.ok) {
                //     markFailed(clientMessageId);
                //     return;
                // }
            });
        } catch (err) {
            markFailed(clientMessageId);
            return
        }
    };

    const sendMessage = ({ receiverId, content } = {}) => {
        const senderId = currentUser?.id;
        const trimmed = content?.trim();
        const conversation = getById(activeConversationId);

        if (!senderId || !trimmed || !receiverId || !activeConversationId)
            return;

        const isTempConversation =
            !!conversation?.tempConversationId ||
            conversation._id.startsWith("temp-");
        const resolvedReceiverId =
            receiverId || conversation.otherUserId || null;

        if (!resolvedReceiverId) return;
        if (isTempConversation && conversation.lastMessage) return; // race guard, unchanged

        const clientMessageId = generateUUID();
        const messageObj = {
            _id: clientMessageId,
            clientMessageId,
            conversationId: activeConversationId,
            senderId,
            receiverId: resolvedReceiverId,
            content: trimmed,
            type: "text",
            status: "sending",
            createdAt: new Date(),
        };

        addOptimistic(messageObj);
        updateLastMessage(activeConversationId, messageObj);

        const payload = buildPayload({
            conversationId: activeConversationId,
            receiverId: resolvedReceiverId,
            content: trimmed,
            type: "text",
            clientMessageId,
        });

        emitSend(payload, clientMessageId, activeConversationId);
    };

    const resendMessage = (message) => {
        const clientMessageId = message.clientMessageId || message._id;
        if (message.status === "sending") return; // prevent spam click

        markSending(clientMessageId);

        const payload = buildPayload({
            conversationId: message.conversationId,
            receiverId: message.receiverId,
            content: message.content,
            type: message.type,
            clientMessageId,
        });

        emitSend(payload, clientMessageId, message.conversationId);
    };

    const emitTypingStart = (receiverId) =>
        receiverId && socket.emit("message:typing:start", { receiverId });

    const emitTypingStop = (receiverId) =>
        receiverId && socket.emit("message:typing:stop", { receiverId });

    return { sendMessage, resendMessage, emitTypingStart, emitTypingStop };
};

export default useMessageManager;
