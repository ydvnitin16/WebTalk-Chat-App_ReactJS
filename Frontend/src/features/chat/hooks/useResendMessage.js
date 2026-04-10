import { socket } from "@/lib/socket";
import useChatStore from "@/stores/useChatStore";

const useResendMessage = () => {
    const { updateMessageStatus } = useChatStore();

    const resendMessage = (message) => {
        const tempId = message.tempId || message._id;

        // prevent spam click
        if (message.status === "pending") return;

        // set to pending again
        updateMessageStatus({
            tempId,
            messageId: null,
            status: "pending",
        });
        try {
            socket.emit("send-message", {
                content: message.content,
                sendTo: message.receiver,
                tempId,
            });
        } catch (err) {
            updateMessageStatus({
                tempId,
                messageId: null,
                status: "failed",
            });
        }
    };

    return { resendMessage };
};

export default useResendMessage;
