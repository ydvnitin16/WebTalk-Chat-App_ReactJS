import { socket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import useConversationStore from "@/stores/useConversationStore";
import useMemberStore from "@/stores/useMemberStore";
import useMessageStore from "@/stores/useMessageStore";
import useUIStore from "@/stores/useUIStore";
import { normalizeMessage, normalizeNewConversation } from "@/utils/utils";

export const useMessageHandlers = () => {
    const {
        addConversation,
        updateConversation,
        updateLastMessage,
        incrementUnreadCount,
    } = useConversationStore();
    const {
        confirmMessage,
        appendMessage,
        markFailed,
        setActiveConversationId,
    } = useMessageStore();
    const {
        addUser,
        setUserOnline,
        updateDeliveryPointer,
        updateSeenPointer,
        addCursor,
    } = useMemberStore();
    const { setTyping } = useUIStore();
    const { currentUser } = useAuthStore();

    // Shared by both the sender-side and receiver-side
    const syncNewConversation = ({
        conversation,
        message,
        realConversationId,
    }) => {
        const {
            normalizedConversation,
            normalizedOtherUser,
            normalizedMemberCursor,
        } = normalizeNewConversation(conversation, message, currentUser?.id);

        addUser(normalizedOtherUser);
        addCursor(realConversationId, normalizedMemberCursor);

        return normalizedConversation;
    };

    const onNewMessage = ({
        conversationId,
        message,
        conversation,
        isNewConversation,
        tempConversationId,
    }) => {
        const normalizedMessage = normalizeMessage(message);
        const isFromMe =
            String(normalizedMessage.senderId) === String(currentUser?.id);

        // If conversation is new process will be same
        if (isNewConversation) {
            const normalizedConversation = syncNewConversation({
                conversation,
                message,
                realConversationId: conversationId,
            });

            if (isFromMe) {
                updateConversation(tempConversationId, normalizedConversation);
                setActiveConversationId(conversationId);
            } else {
                addConversation(normalizedConversation);
            }
        }

        // Read fresh activeConversationId that got synced - when conversation was new
        const isActiveConv =
            useMessageStore.getState().activeConversationId === conversationId;

        if (isFromMe) {
            updateLastMessage(conversationId, normalizedMessage);
            confirmMessage({
                clientMessageId: normalizedMessage.clientMessageId,
                messageId: normalizedMessage._id,
            });

            if (isActiveConv) appendMessage(normalizedMessage);
            return;
        }

        if (!isNewConversation) {
            updateLastMessage(conversationId, normalizedMessage);
        }

        if (isActiveConv) {
            appendMessage(normalizedMessage);
            socket.emit("message:seen", {
                conversationId,
                messageId: normalizedMessage._id,
                userId: currentUser?.id,
            });
            return;
        }

        incrementUnreadCount(conversationId);
        socket.emit("message:delivered", {
            conversationId,
            messageId: normalizedMessage._id,
            userId: currentUser?.id,
        });
    };

    const onSendFailed = ({ clientMessageId }) => markFailed(clientMessageId);

    const onDeliveryAck = ({ conversationId, userId, messageId }) => {
        if (userId !== currentUser?.id) {
            updateDeliveryPointer({ conversationId, userId, messageId });
        }
    };

    const onSeenAck = ({ conversationId, userId, messageId }) => {
        if (userId !== currentUser?.id) {
            updateSeenPointer({ conversationId, userId, messageId });
        }
    };

    const onTypingStart = ({ userId }) => setTyping(userId, true);
    const onTypingStop = ({ userId }) => setTyping(userId, false);
    const onUserOnline = ({ userId }) => setUserOnline(userId, true);
    const onUserOffline = ({ userId }) => setUserOnline(userId, false);

    return {
        "message:new": onNewMessage,
        "message:send:failed": onSendFailed,
        "message:delivered:ack": onDeliveryAck,
        "message:seen:ack": onSeenAck,
        "message:typing:start": onTypingStart,
        "message:typing:stop": onTypingStop,
        "user:online": onUserOnline,
        "user:offline": onUserOffline,
    };
};
