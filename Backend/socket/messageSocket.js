import {
    sendMessageService,
    updateAllMessagesToDelivered,
    updateAllMessagesToSeen,
    updateMessageById,
} from "../services/messageService.js";

export const handleMessageSocket = (io, socket) => {
    socket.on("send-message", async ({ content, sendTo, tempId }) => {
        const senderId = socket.user.id;
        try {
            // store in db
            const { message, conversation } = await sendMessageService({
                senderId,
                receiverId: sendTo,
                content,
                type: "text",
                status: "sent",
            });

            // send to reciever via socket
            io.to(sendTo).emit("receive-message", { message });

            io.to(senderId).emit("message-sent", {
                messageId: message._id,
                tempId,
            });
        } catch (error) {
            io.to(senderId).emit("message-failed", {
                messageId: tempId,
                tempId,
                status: "failed",
            });
            console.log("Message error: ", error.message);
        }
    });

    // update when user got the message
    socket.on("message-delivered", async ({ messageId, from }) => {
        await updateMessageById(messageId, { status: "delivered" });
        io.to(from).emit("message-status-update", {
            messageId,
            status: "delivered",
        });
    });

    // update when user seen the message
    socket.on("message-seen", async ({ messageId, from }) => {
        await updateMessageById(messageId, { status: "seen" });
        io.to(from).emit("message-status-update", {
            messageId,
            status: "seen",
        });
    });

    // update all messages when user seen all the messages
    socket.on("messages-seen", async ({ senderId }) => {
        const messageIds = await updateAllMessagesToSeen(
            senderId,
            socket.user.id,
        );
        io.to(senderId).emit("messages-seen", {
            sendTo: socket.user.id,
            messageIds,
        });
    });

    // Typing
    socket.on("typing", (to) => {
        io.to(to).emit("typing", socket.user.id);
    });

    // Stop typing
    socket.on("stop-typing", (to) => {
        io.to(to).emit("stop-typing", socket.user.id);
    });
};

export const handleUndeliveredMessages = async (io, socket) => {
    const userId = socket.user.id;
    const undelivered = await updateAllMessagesToDelivered(userId);
    const grouped = groupMessagesBySender(undelivered);

    for (let [senderId, messageIds] of grouped.entries()) {
        io.to(senderId).emit("messages-delivered", {
            sendTo: userId,
            messageIds,
        });
    }
};

const groupMessagesBySender = (messages = []) => {
    const map = new Map();

    for (let msg of messages) {
        const senderId = msg.sender.toString();

        if (!map.has(senderId)) {
            map.set(senderId, []);
        }

        map.get(senderId).push(msg._id);
    }

    return map;
};
