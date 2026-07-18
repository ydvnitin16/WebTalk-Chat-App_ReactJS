import { socket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import useConversationStore from "@/stores/useConversationStore";
import useMessageStore from "@/stores/useMessageStore";
import useMemberStore from "@/stores/useMemberStore";
import { useState } from "react";
import toast from "react-hot-toast";

const useSendMessages = () => {
  const { getById, updateLastMessage } = useConversationStore();
  const { activeConversationId, addOptimistic, markFailed } = useMessageStore();
  const { currentUser } = useAuthStore();
  const { users } = useMemberStore();

  const [message, setMessage] = useState("");

  function sendMessage({ receiverId } = {}) {
    const senderId = currentUser?.id;
    const content = message.trim();
    const conversation = getById(activeConversationId);

    if (!senderId || !content || !receiverId || !activeConversationId) return;

    const isTempConversation =
      !!conversation?.tempConversationId ||
      conversation._id.startsWith("temp-");

    const resolvedReceiverId = receiverId || conversation.otherUserId || null;

    if (!isTempConversation && !resolvedReceiverId) return;
    if (isTempConversation && !resolvedReceiverId) {
      toast.error("Cannot send: recipient not found");
      return;
    }

    if (isTempConversation && conversation.lastMessage) {
      return; // prevent race condition, stop until server conversationId sync with client
    }

    const createdAt = new Date();
    const clientMessageId = generateUUID();

    const messageObj = {
      _id: clientMessageId,
      clientMessageId,
      conversationId: activeConversationId,
      senderId,
      receiverId: resolvedReceiverId,
      content,
      type: "text",
      status: "sending",
      createdAt,
    };

    addOptimistic(messageObj);
    updateLastMessage(activeConversationId, messageObj);
    setMessage("");

    try {
      socket.emit("message:send", {
        tempConversationId: isTempConversation ? activeConversationId : null,
        conversationId: activeConversationId,
        receiverId: resolvedReceiverId,
        clientMessageId,
        content,
        type: "text",
      });
    } catch {
      markFailed(clientMessageId);
    }
  }

  return { sendMessage, message, setMessage };
};

export default useSendMessages;

export function generateUUID() {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.randomUUID
  ) {
    return window.crypto.randomUUID();
  }

  // Math-based fallback for insecure environments (HTTP / IP addresses)
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}
