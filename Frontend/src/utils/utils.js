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
        return `Today, ${time}`; // today
    } else if (diffInDays === 1) {
        return `Yesterday, ${time}`;
    } else {
        const fullDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "numeric",
            year: "numeric",
        });
        return `${fullDate}`;
    }
}

export function isValidObjectId(id) {
    const regex = /^[0-9a-fA-F]{24}$/;
    return regex.test(id);
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
        unreadCount: 0,
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

export function normalizeConversations(list) {
    const conversations = [];
    const users = {};
    const cursors = {};

    for (const item of list) {
        const conversation = {
            _id: item.conversationId,
            otherUserId: item.otherUser._id,
            lastMessage: item.lastMessage,
            lastActivity: item.lastActivity,
            unreadCount: item.unreadCount,
        };
        conversations.push(conversation);

        users[item.otherUser._id] = item.otherUser;

        cursors[item.conversationId] = {
            myLastSeenMessageId: item.myLastSeenMessageId,
            otherLastSeenMessageId: item.otherLastSeenMessageId,
            otherLastDeliveredMessageId: item.otherLastDeliveredMessageId,
        };
    }

    return {
        conversations,
        users,
        cursors,
    };
}

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
