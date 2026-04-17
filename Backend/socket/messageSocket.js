import {
    sendMessageService,
    updateAllMessagesToDelivered,
    updateAllMessagesToSeen,
    updateMessageById,
} from "../services/messageService.js";

export const handleMessageSocket = (io, socket) => {
    const userId = socket.user.id;

    socket.on("send-message", async ({ content, sendTo, tempId }) => {
        try {
            const { message, conversation } = await sendMessageService({
                senderId: userId,
                receiverId: sendTo,
                content,
                type: "text",
                status: "sent",
            });

            const unreadCount =
                conversation.unreadCounts.get(sendTo.toString?.() || sendTo) ||
                0;

            io.to(sendTo).emit("receive-message", { message });
            io.to(sendTo).emit("unread-count-updated", {
                conversationId: conversation._id,
                userId: sendTo,
                count: unreadCount,
            });
            io.to(userId).emit("message-sent", {
                messageId: message._id,
                tempId,
            });
        } catch (error) {
            console.error("Message error:", error.message);
            io.to(userId).emit("message-failed", { tempId, status: "failed" });
        }
    });

    // Unified: handles both "delivered" and "seen" status updates
    socket.on("message-status", async ({ messageId, from, status }) => {
        await updateMessageById(messageId, { status });
        io.to(from).emit("message-status-update", { messageId, status });
    });

    socket.on("messages-seen", async ({ senderId }) => {
        const result = await updateAllMessagesToSeen(senderId, userId);
        if (!result?.messageIds?.length) return;

        io.to(senderId).emit("messages-seen", {
            sendTo: userId,
            messageIds: result.messageIds,
        });
        io.to(userId).emit("unread-count-updated", {
            conversationId: result.conversationId,
            userId,
            count: result.unreadCount,
        });
    });

    socket.on("typing", (to) => io.to(to).emit("typing", userId));
    socket.on("stop-typing", (to) => io.to(to).emit("stop-typing", userId));
};

export const handleUndeliveredMessages = async (io, socket) => {
    const userId = socket.user.id;
    const undelivered = await updateAllMessagesToDelivered(userId);
    const grouped = groupMessagesBySender(undelivered);

    for (const [senderId, messageIds] of grouped.entries()) {
        io.to(senderId).emit("messages-delivered", {
            sendTo: userId,
            messageIds,
        });
    }
};

const groupMessagesBySender = (messages = []) =>
    messages.reduce((map, msg) => {
        const id = msg.sender.toString();
        map.set(id, [...(map.get(id) || []), msg._id]);
        return map;
    }, new Map());
