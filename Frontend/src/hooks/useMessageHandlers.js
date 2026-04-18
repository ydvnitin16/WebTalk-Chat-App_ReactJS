import { socket } from "@/lib/socket";
import useChatStore from "@/stores/useChatStore";

export const useMessageHandlers = () => {
    const {
        addMessage,
        addUser,
        setTyping,
        setUserStatus,
        updateConversationLastMessage,
        updateMessageStatus,
        updateAllMessagesStatus,
        updateConversationUnreadCount,
    } = useChatStore();

    const onReceiveMessage = ({ message }) => {
        const { users, selectedUserId: activeUserId } = useChatStore.getState();

        if (!users[message.sender._id]) {
            addUser(message.sender);
            setUserStatus(message.sender._id, true);
        }

        message.sender = message.sender._id;
        message.receiver = message.receiver._id;
        addMessage(message);
        updateConversationLastMessage(message);

        const isChatOpen =
            activeUserId?.toString() === message.sender.toString();
        // unified "message-status" event instead of separate delivered/seen
        socket.emit("message-status", {
            messageId: message._id,
            from: message.sender,
            status: isChatOpen ? "seen" : "delivered",
        });
    };

    const onMessageSent = ({ messageId, tempId }) =>
        updateMessageStatus({ tempId, messageId, status: "sent" });
    const onMessageStatus = ({ messageId, status }) =>
        updateMessageStatus({ messageId, status });
    const onMessageFailed = ({ tempId, status }) =>
        updateMessageStatus({ tempId, status });
    const onMessagesSeen = ({ sendTo, messageIds }) =>
        updateAllMessagesStatus({ sendTo, messageIds, status: "seen" });
    const onMessagesDelivered = ({ sendTo, messageIds }) =>
        updateAllMessagesStatus({ sendTo, messageIds, status: "delivered" });
    const onUnreadCount = ({ conversationId, userId, senderId, count }) => {
        const { selectedUserId } = useChatStore.getState();
        // if chat is already open don't increment unreadcount
        if (
            selectedUserId &&
            selectedUserId.toString() === senderId.toString()
        ) {
            socket.emit("messages-seen", { senderId: selectedUserId });
            return;
        }
        updateConversationUnreadCount({ conversationId, userId, count });
    };
    const onTyping = (userId) => setTyping(userId, true);
    const onStopTyping = (userId) => setTyping(userId, false);
    const onUserOnline = (id) => setUserStatus(id, true);
    const onUserOffline = (id) => setUserStatus(id, false);

    return {
        "receive-message": onReceiveMessage,
        "message-sent": onMessageSent,
        "message-status-update": onMessageStatus,
        "message-failed": onMessageFailed,
        "messages-seen": onMessagesSeen,
        "messages-delivered": onMessagesDelivered,
        "unread-count-updated": onUnreadCount,
        typing: onTyping,
        "stop-typing": onStopTyping,
        "user-online": onUserOnline,
        "user-offline": onUserOffline,
    };
};
