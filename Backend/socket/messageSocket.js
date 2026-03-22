import { sendMessageService } from "../services/messageService.js";

export const handleMessageSocket = (io, socket) => {
    socket.on("message", async ({ content, sendTo }) => {
        try {
            const senderId = socket.user.id;

            // store in db
            const { message, conversation } = await sendMessageService({
                senderId,
                receiverId: sendTo,
                content,
                type: "text",
            });

            // send to reciever via socket
            io.to(sendTo).emit("message", message);
        } catch (error) {
            console.log("Message error: ", error.message);
        }
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
