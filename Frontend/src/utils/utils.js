export function formatDateTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  // Strip time from both to compare just the date part
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffInDays = Math.floor((nowOnly - dateOnly) / (1000 * 60 * 60 * 24));

  const options = { hour: "numeric", minute: "2-digit", hour12: true };
  const time = date.toLocaleTimeString("en-US", options);

  if (diffInDays === 0) {
    return time; // today
  } else if (diffInDays === 1) {
    return `Yesterday`;
  } else {
    const fullDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "numeric",
      year: "numeric",
    });
    return `${fullDate}`;
  }
}

export function getLastMessage(messages, user, currentUser) {
  messages = messages?.filter(
    (msg) =>
      (msg.sender === user._id && msg.receiver === currentUser?.id) ||
      (msg.receiver === user._id && msg.sender === currentUser?.id),
  );
  const messageObj = messages[messages.length - 1];
  const lastMessage = messageObj?.content;
  const sendedByYou = messageObj?.sender === currentUser?.id ? "You: " : "";
  const createdAt = messageObj?.createdAt;
  return { lastMessage, sendedByYou, createdAt };
}

// this fucntion will use for extracting the users from the conversations.participants to have a separate users data without duplicacy
export const normalizeUserId = (value) => String(value?._id || value || "");

export const normalizeMessage = (message = {}) => ({
  ...message,
  conversationId: normalizeUserId(
    message.conversationId || message.conversation,
  ),
  senderId: normalizeUserId(message.sender || message.senderId),
});

export const normalizeNewConversation = (
  conversation = {},
  message,
  currentUserId,
) => {
  const normalizedOtherUser = conversation.participants.find(
    (p) => normalizeUserId(p) !== normalizeUserId(currentUserId),
  );
  const otherMember = conversation.members.find(
    (m) => normalizeUserId(m.userId) !== normalizeUserId(currentUserId),
  );

  const meAsMember = conversation.members.find(
    (m) => normalizeUserId(m.userId) === normalizeUserId(currentUserId),
  );

  const normalizedMemberCursor = {
    otherLastSeenMessageId: otherMember.lastSeenMessageId,
    otherLastDeliveredMessageId: otherMember.lastDeliveredMessageId,
    myLastSeenMessageId: meAsMember.lastSeenMessageId,
  };

  const normalizedConversation = {
    _id: conversation._id,
    lastActivity: conversation.lastActivity,
    otherUserId: normalizeUserId(normalizedOtherUser._id),
    unreadCount: 1,
    lastMessage: {
      _id: message._id,
      senderId: message.sender._id,
      content: message.content,
      createdAt: message.createdAt,
      type: message.type,
    },
  };

  return {
    normalizedConversation,
    normalizedMemberCursor,
    normalizedOtherUser,
  };
};

export const getPeerUserId = (conversation, currentUserId) => {
  if (!conversation) return null;
  const members = conversation.members || [];
  const peer = members.find(
    (member) => normalizeUserId(member.userId || member) !== currentUserId,
  );
  return normalizeUserId(peer?.userId || peer);
};

export const normalizeConversations = (conversations = []) => {
  const users = {};
  const membersByConversation = {};

  const normalizedConversations = conversations.map((conv) => {
    const members =
      conv.members.map((m) => {
        return {
          userId: m.userId,
          lastDeliveredMessageId: m.lastDeliveredMessageId,
          lastSeenMessageId: m.lastSeenMessageId,
        };
      }) || [];

    conv.members.forEach((member) => {
      if (!member.userId) return;
      users[member.userId] = {
        ...users[member.userId],
        _id: member.userId,
        name: member.name,
        avatar: member.avatar,
        username: member.username,
        isOnline: member.isOnline,
        lastSeen: member.lastSeen,
      };
    });

    membersByConversation[conv._id] = members;

    return {
      ...conv,
      lastMessage: conv.lastMessage
        ? normalizeMessage(conv.lastMessage)
        : conv.lastMessage,
      unreadCount:
        conv.unreadCount ??
        (conv.unreadCounts instanceof Map
          ? Object.fromEntries(conv.unreadCounts)
          : conv.unreadCounts || {})?.[conv.currentUserId] ??
        0,
      members: members.map((member) => member.userId),
    };
  });

  return {
    users,
    conversations: normalizedConversations,
    membersByConversation,
  };
};

export const formatCallDuration = (startTime, endTime = null) => {
  const end = endTime ? new Date(endTime) : new Date();
  const start = new Date(startTime);

  const diffInSeconds = Math.floor((end - start) / 1000);

  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  const pad = (num) => String(num).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
};

export function deriveMessageStatus(message, cursor) {
  if (message.status === "sending" || message.status === "failed")
    return message.status;

  if (
    cursor?.otherLastSeenMessageId &&
    message._id <= cursor.otherLastSeenMessageId
  ) {
    return "seen";
  }
  if (
    cursor?.otherLastDeliveredMessageId &&
    message._id <= cursor.otherLastDeliveredMessageId
  ) {
    return "delivered";
  }
  return "sent";
}
