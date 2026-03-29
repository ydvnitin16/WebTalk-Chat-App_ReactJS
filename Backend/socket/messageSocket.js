import { sendMessageService } from "../services/messageService.js";

export const handleMessageSocket = (io, socket) => {
    socket.on("send-message", async ({ content, sendTo, tempId }) => {
        try {
            const senderId = socket.user.id;

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
            console.log("Message error: ", error.message);
        }
    });

    socket.on("message-delivered", ({ messageId, from }) => {
        io.to(from).emit("message-status-update", {
            messageId,
            status: "delivered",
        });
    });

    socket.on("message-seen", ({ messageId, from }) => {
        io.to(from).emit("message-status-update", {
            messageId,
            status: "seen",
        });
    });

    socket.on("messages-seen", ({ senderId }) => {
        io.to(senderId).emit("messages-seen", {
            sendTo: socket.user.id,
        });
    });

    socket.on("messages-delivered", () => {
        io.emit("messages-delivered", { sendTo: socket.user.id });
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
