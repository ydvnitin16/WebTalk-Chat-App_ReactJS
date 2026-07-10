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
        updateLastMessage,
        incrementUnreadCount,
        updateConversation,
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

        const state = useMessageStore.getState();
        const isActiveConv =
            state.activeConversationId === normalizedMessage.conversationId;

        if (isFromMe) {
            if (isNewConversation) {
                const {
                    normalizedConversation,
                    normalizedOtherUser,
                    normalizedMemberCursor,
                } = normalizeNewConversation(
                    conversation,
                    message,
                    currentUser?.id,
                );
                setActiveConversationId(conversationId);
                addUser(normalizedOtherUser);
                updateConversation(tempConversationId, normalizedConversation);
                addCursor(conversationId, normalizedMemberCursor);
            }

            updateLastMessage(conversationId, normalizedMessage);
            confirmMessage({
                clientMessageId: normalizedMessage.clientMessageId,
                messageId: normalizedMessage._id,
            });

            if (isActiveConv) {
                appendMessage(normalizedMessage);
            }
        } else {
            if (isNewConversation) {
                const {
                    normalizedConversation,
                    normalizedOtherUser,
                    normalizedMemberCursor,
                } = normalizeNewConversation(
                    conversation,
                    message,
                    currentUser?.id,
                );
                addConversation(normalizedConversation);
                addUser(normalizedOtherUser);
                addCursor(conversationId, normalizedMemberCursor);
            } else {
                updateLastMessage(conversationId, normalizedMessage);
            }
        }

        // Message is in the active open chat
        if (isActiveConv && !isFromMe) {
            appendMessage(normalizedMessage);
            socket.emit("message:seen", {
                conversationId: normalizedMessage.conversationId,
                messageId: normalizedMessage._id,
                userId: currentUser?.id,
            });
            return;
        }

        if (!isFromMe) {
            incrementUnreadCount(normalizedMessage.conversationId);
            socket.emit("message:delivered", {
                conversationId: normalizedMessage.conversationId,
                messageId: normalizedMessage._id,
                userId: currentUser?.id,
            });
        }
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

    const onUserOnline = ({ userId }) => {
        setUserOnline(userId, true);
    };
    const onUserOffline = ({ userId }) => {
        setUserOnline(userId, false);
    };

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
