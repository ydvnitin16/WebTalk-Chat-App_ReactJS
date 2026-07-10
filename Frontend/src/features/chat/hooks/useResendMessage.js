import { socket } from "@/lib/socket";
import useMessageStore from "@/stores/useMessageStore";

const useResendMessage = () => {
  const { markFailed, markSending } = useMessageStore();

  const resendMessage = (message) => {
    const clientMessageId = message.clientMessageId || message._id;

    // prevent spam click
    if (message.status === "sending") return;
    markSending(clientMessageId);

    const isTempConversation = message.conversationId.startsWith("temp-");

    try {
      socket.emit("message:send", {
        tempConversationId: isTempConversation ? message.conversationId : null,
        conversationId: message.conversationId,
        receiverId: message.receiverId,
        clientMessageId,
        content: message.content,
        type: message.type,
      });
    } catch {
      markFailed(clientMessageId);
    }
  };

  return { resendMessage };
};

export default useResendMessage;
