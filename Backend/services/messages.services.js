import mongoose from "mongoose";
import Conversation from "../models/conversation.js";
import ConversationMember from "../models/conversationMember.js";
import Message from "../models/message.js";
import {
    getCachedConversation,
    setCachedConversation,
} from "../cache/conversationCache.js";
import { isUserOnline } from "../cache/presenceStore.js";

const sortParticipantIds = (a, b) => a.toString().localeCompare(b.toString());

const buildParticipantPair = (userIdA, userIdB) =>
    [userIdA, userIdB].sort(sortParticipantIds);

const buildParticipantKey = (userIdA, userIdB) =>
    buildParticipantPair(userIdA, userIdB)
        .map((id) => id.toString())
        .join(":");

const resolveReceiverId = (conversation, senderId, receiverId) => {
    if (receiverId) return receiverId;

    const otherParticipant = conversation.participants.find(
        (participantId) => participantId.toString() !== senderId.toString(),
    );

    if (!otherParticipant) {
        const err = new Error("Could not resolve receiver for conversation");
        err.statusCode = 400;
        throw err;
    }

    return otherParticipant;
};
const isConversationForSender = (conversation, senderId) =>
    conversation?.participants?.some(
        (participantId) => participantId.toString() === senderId.toString(),
    );

const isCachedConversationUsable = ({ conversation, conversationId, senderId }) => {
    if (!conversation || !isConversationForSender(conversation, senderId)) {
        return false;
    }
    return !conversationId || conversation._id?.toString() === conversationId.toString();
};

const syncConversationAfterMessage = async ({ conversationId, senderId, resolvedReceiverId, message }) => {
    return Promise.all([
        Conversation.updateOne(
            { _id: conversationId },
            { $set: { lastMessageId: message._id, lastActivity: message.createdAt } },
        ),
        ConversationMember.findOneAndUpdate(
            { conversationId, userId: senderId },
            { $setOnInsert: { unreadCount: 0, lastSeenMessageId: null, lastDeliveredMessageId: null } },
            { upsert: true },
        ),
        ConversationMember.findOneAndUpdate(
            { conversationId, userId: resolvedReceiverId },
            { $setOnInsert: { lastSeenMessageId: null, lastDeliveredMessageId: null }, $inc: { unreadCount: 1 } },
            { upsert: true },
        ),
    ]);
};

const syncConversationAfterMessageInBackground = (params) => {
    syncConversationAfterMessage(params).catch((err) => {
        console.error("conversation post-message sync failed:", err.message);
    });
};

export const sendMessageService = async ({
    senderId,
    receiverId,
    conversationId,
    content,
    type,
    clientMessageId,
}) => {
    let conversation;
    let isNewConversation = false;
    let wasCacheHit = false;
    const participantKey = receiverId ? buildParticipantKey(senderId, receiverId) : null;

    if (participantKey) {
        const cachedConversation = getCachedConversation(participantKey);

        if (isCachedConversationUsable({ conversation: cachedConversation, conversationId, senderId })) {
            conversation = cachedConversation;
            wasCacheHit = true;
        }
    }

    if (conversationId && !conversation) {
        conversation = await Conversation.findOne({
            _id: conversationId,
            participants: senderId,
        }).lean();

        if (!conversation) {
            const err = new Error("Conversation not found or access denied");
            err.statusCode = 404;
            throw err;
        }

        if (participantKey) {
            setCachedConversation(participantKey, conversation);
        }
    } else if (!conversation) {
        if (!receiverId) {
            const err = new Error("receiverId is required for new conversations");
            err.statusCode = 400;
            throw err;
        }

        const participants = buildParticipantPair(senderId, receiverId);

        conversation = await Conversation.findOne({
            $or: [{ participantKey }, { participants: { $all: participants, $size: 2 } }],
        }).lean();

        if (conversation) {
            setCachedConversation(participantKey, conversation);
        }

        if (!conversation) {
            try {
                const upsertResult = await Conversation.updateOne(
                    { participantKey },
                    { $setOnInsert: { participants, lastActivity: new Date() } },
                    { upsert: true },
                );

                isNewConversation = upsertResult.upsertedCount === 1;

                conversation = await Conversation.findOne({ participantKey }).lean();
                setCachedConversation(participantKey, conversation);
            } catch (err) {
                if (err.code === 11000) {
                    conversation = await Conversation.findOne({
                        $or: [{ participantKey }, { participants: { $all: participants, $size: 2 } }],
                    }).lean();
                    setCachedConversation(participantKey, conversation);
                    isNewConversation = false;
                } else {
                    throw err;
                }
            }
        }
    }

    if (!conversation) {
        const err = new Error("Failed to resolve conversation");
        err.statusCode = 500;
        throw err;
    }

    const resolvedReceiverId = resolveReceiverId(conversation, senderId, receiverId);

    let message;
    try {
        message = await Message.create({
            conversationId: conversation._id,
            senderId,
            content,
            type,
            clientMessageId,
        });
    } catch (err) {
        if (err.code === 11000) {
            message = await Message.findOne({ clientMessageId }).lean();
            return { message, conversation, deduped: true, isNewConversation: false, resolvedReceiverId };
        }
        throw err;
    }

    if (isNewConversation) {
        await syncConversationAfterMessage({
            conversationId: conversation._id,
            senderId,
            resolvedReceiverId,
            message,
        });

        await message.populate("senderId", "name username avatar");

        const [populatedConversation, members] = await Promise.all([
            Conversation.findById(conversation._id)
                .populate("participants", "name username bio avatar lastSeen")
                .lean(),
            ConversationMember.find({ conversationId: conversation._id }).lean(),
        ]);

        conversation = {
            ...populatedConversation,
            participants: (populatedConversation.participants || []).map((participant) => ({
                ...participant,
                isOnline: isUserOnline(participant._id),
            })),
            members: members.map((member) => ({
                userId: member.userId,
                lastDeliveredMessageId: member.lastDeliveredMessageId,
                lastSeenMessageId: member.lastSeenMessageId,
            })),
        };
    }

    const messagePayload = typeof message.toObject === "function" ? message.toObject() : message;

    const syncParams = {
        conversationId: conversation._id,
        senderId,
        resolvedReceiverId,
        message: messagePayload,
    };

    if (!isNewConversation) {
        syncConversationAfterMessageInBackground(syncParams);
    }

    return {
        message: messagePayload,
        conversation,
        deduped: false,
        isNewConversation,
        resolvedReceiverId,
    };
};

export const markConversationSeen = async ({ userId, conversationId }) => {
    console.log(userId, conversationId);
    
    const latestMessage = await Message.findOne({ conversationId })
        .sort({ createdAt: -1, _id: -1 })
        .select("_id");
    console.log(latestMessage)
    if (!latestMessage) return null;
    console.log('MArking...')
    return markSeen({ userId, conversationId, messageId: latestMessage._id });
};

export const markConversationDelivered = async ({ userId, conversationId }) => {
    const latestMessage = await Message.findOne({ conversationId })
        .sort({ createdAt: -1, _id: -1 })
        .select("_id");

    if (!latestMessage) return null;

    return markDelivered({
        userId,
        conversationId,
        messageId: latestMessage._id,
    });
};

export const markAllConversationsDelivered = async ({ userId }) => {
    const memberships = await ConversationMember.find({ userId }).select(
        "conversationId",
    );

    const results = [];

    for (const membership of memberships) {
        const result = await markConversationDelivered({
            userId,
            conversationId: membership.conversationId,
        });

        if (result) results.push(result);
    }

    return results;
};

export const markSeen = async ({ userId, conversationId, messageId }) => {
    const member = await ConversationMember.findOne({
        conversationId: conversationId,
        userId: userId,
    }).select("_id lastSeenMessageId lastDeliveredMessageId");
    console.log(member)
    if (!member) throw new Error("ConversationMember not found");
    console.log('Founded');
    
    if (
        !member.lastSeenMessageId ||
        isNewer(messageId, member.lastSeenMessageId)
    ) {
        console.log("Newer")
        const update = {
            lastSeenMessageId: messageId,
            unreadCount: 0,
        };

        // seen also means message delivered, so keep it also sync
        if (
            !member.lastDeliveredMessageId ||
            isNewer(messageId, member.lastDeliveredMessageId)
        ) {
            update.lastDeliveredMessageId = messageId;
        }
        console.log('Delivered also checked')
        await ConversationMember.updateOne(
            { _id: member._id },
            { $set: update },
        );
        console.log('UPdated');
        
        const otherMember = await ConversationMember.findOne({
            conversationId: conversationId,
            userId: { $ne: userId },
        }).select("userId");
        console.log('Other member', otherMember)
        return {
            conversationId,
            userId,
            messageId,
            status: "seen",
            notifyUser: otherMember.userId,
        };
    }

    return null;
};

export const markDelivered = async ({ userId, conversationId, messageId }) => {
    const member = await ConversationMember.findOne({
        conversationId: conversationId,
        userId: userId,
    }).select("_id lastDeliveredMessageId");

    if (!member) throw new Error("ConversationMember not found");

    // Only advance forward, dont let the pointer go backward when ack gets unordered

    if (
        !member.lastDeliveredMessageId ||
        isNewer(messageId, member.lastDeliveredMessageId)
    ) {
        await ConversationMember.updateOne(
            { _id: member._id },
            {
                $set: {
                    lastDeliveredMessageId: messageId,
                },
            },
        );

        const otherMember = await ConversationMember.findOne({
            conversationId: conversationId,
            userId: { $ne: userId },
        }).select("userId");

        return {
            conversationId,
            userId,
            messageId,
            status: "delivered",
            notifyUser: otherMember.userId,
        };
    }

    return null;
};

function isNewer(messageIdA, messageIdB) {
    return (
        new mongoose.Types.ObjectId(messageIdA).getTimestamp() >
        new mongoose.Types.ObjectId(messageIdB).getTimestamp()
    );
}
