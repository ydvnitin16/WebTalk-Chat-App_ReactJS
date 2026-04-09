import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import Call from "../models/call.js";

export const sendMessageService = async ({
    senderId,
    receiverId,
    content = "",
    type = "text",
}) => {
    // check conversation exists or not
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });

    // create conversation
    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, receiverId],
        });
    }

    // create message
    const message = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        receiver: receiverId,
        content,
        type,
    });

    await message.populate("sender receiver", "_id name avatar");
    // update conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    return { message, conversation };
};

export const getMessagesService = async (conversationId, { cursor, limit }) => {
    if (!conversationId) {
        throw new Error("Conversation ID is required");
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const query = { conversation: conversationId };

    // cursor = oldest message's createdAt
    if (cursor) {
        query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
        .sort({ createdAt: -1 }) // newest first
        .limit(limit);

    const orderedMessages = messages.reverse();

    return {
        messages: orderedMessages, // send oldest -> newest
        nextCursor: orderedMessages.length
            ? orderedMessages[0].createdAt
            : null,
        hasMore: messages.length === limit,
    };
};

export const getConversationTimelineService = async (
    conversationId,
    { cursor, limit },
) => {
    if (!conversationId) {
        throw new Error("Conversation ID is required");
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const createdAtFilter = cursor ? { createdAt: { $lt: new Date(cursor) } } : {};
    const messageQuery = { conversation: conversationId, ...createdAtFilter };
    const callQuery = { conversation: conversationId, ...createdAtFilter };

    const [messages, calls] = await Promise.all([
        Message.find(messageQuery).sort({ createdAt: -1 }).limit(limit),
        Call.find(callQuery).sort({ createdAt: -1 }).limit(limit),
    ]);

    const timeline = [
        ...messages.map((message) => ({
            itemType: "message",
            createdAt: message.createdAt,
            data: message,
        })),
        ...calls.map((call) => ({
            itemType: "call",
            createdAt: call.createdAt,
            data: call,
        })),
    ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

    const orderedTimeline = timeline.reverse();

    return {
        timeline: orderedTimeline,
        messages: orderedTimeline
            .filter((item) => item.itemType === "message")
            .map((item) => item.data),
        calls: orderedTimeline
            .filter((item) => item.itemType === "call")
            .map((item) => item.data),
        nextCursor: orderedTimeline.length
            ? orderedTimeline[0].createdAt
            : null,
        hasMore: messages.length === limit || calls.length === limit,
    };
};

export const updateMessageById = async (messageId, update) => {
    // update call status
    const message = await Message.findByIdAndUpdate(messageId, update);

    if (!message) {
        console.log("Message error: message doesn't exists");
    }
    return message;
};

export const updateAllMessagesToSeen = async (sender, receiver) => {
    const unSeen = await Message.find({
        sender,
        receiver,
        status: { $in: ["seen", "delivered"] },
    });

    if (!unSeen.length) return;

    const messageIds = unSeen.map((m) => m._id);

    // update all messages status
    await Message.updateMany({ _id: { $in: messageIds } }, { status: "seen" });
    return messageIds;
};

export const updateAllMessagesToDelivered = async (userId) => {
    const undelivered = await Message.find({
        receiver: userId,
        status: "sent",
    });

    if (!undelivered.length) return;

    const messageIds = undelivered.map((m) => m._id);

    await Message.updateMany(
        { _id: { $in: messageIds } },
        { status: "delivered" },
    );

    return undelivered;
};
