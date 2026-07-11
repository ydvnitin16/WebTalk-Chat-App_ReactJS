import mongoose from "mongoose";
import Conversation from "../models/conversation.js";
import ConversationMember from "../models/conversationMember.js";
import Message from "../models/message.js";
import { isUserOnline } from "../utils/presenceStore.js";

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

  if (conversationId) {
    conversation = await Conversation.findOne({
      _id: conversationId,
      participants: senderId,
    }).lean();

    if (!conversation) {
      const err = new Error("Conversation not found or access denied");
      err.statusCode = 404;
      throw err;
    }
  } else {
    if (!receiverId) {
      const err = new Error("receiverId is required for new conversations");
      err.statusCode = 400;
      throw err;
    }

    const participants = buildParticipantPair(senderId, receiverId);
    const participantKey = buildParticipantKey(senderId, receiverId);

    // Fast path: conversation already exists (including legacy rows without participantKey)
    conversation = await Conversation.findOne({
      $or: [
        { participantKey },
        { participants: { $all: participants, $size: 2 } },
      ],
    }).lean();

    if (!conversation) {
      try {
        // Atomic upsert on participantKey only — filter field is inferred on insert,
        // so we avoid the old "participants matched twice" upsert error.
        const upsertResult = await Conversation.updateOne(
          { participantKey },
          {
            $setOnInsert: {
              participants,
              lastActivity: new Date(),
            },
          },
          { upsert: true },
        );

        isNewConversation = upsertResult.upsertedCount === 1;

        conversation = await Conversation.findOne({ participantKey }).lean();
      } catch (err) {
        // Concurrent upserts, one insert wins, the other hits the 11000 code error
        if (err.code === 11000) {
          conversation = await Conversation.findOne({
            $or: [
              { participantKey },
              { participants: { $all: participants, $size: 2 } },
            ],
          }).lean();
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

  const resolvedReceiverId = resolveReceiverId(
    conversation,
    senderId,
    receiverId,
  );

  await Promise.all([
    ConversationMember.findOneAndUpdate(
      { conversationId: conversation._id, userId: senderId },
      {
        $setOnInsert: {
          unreadCount: 0,
          lastSeenMessageId: null,
          lastDeliveredMessageId: null,
        },
      },
      { upsert: true },
    ),
    ConversationMember.findOneAndUpdate(
      { conversationId: conversation._id, userId: resolvedReceiverId },
      {
        $setOnInsert: {
          unreadCount: 0,
          lastSeenMessageId: null,
          lastDeliveredMessageId: null,
        },
      },
      { upsert: true },
    ),
  ]);

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
      return {
        message,
        conversation,
        deduped: true,
        isNewConversation: false,
        resolvedReceiverId,
      };
    }
    throw err;
  }

  if (isNewConversation) {
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
  } else {
    await message.populate("senderId", "name username avatar");
  }

  const messagePayload =
    typeof message.toObject === "function" ? message.toObject() : message;

  await Promise.all([
    Conversation.updateOne(
      { _id: conversation._id },
      {
        $set: {
          lastMessageId: message._id,
          lastActivity: message.createdAt,
        },
      },
    ),
    ConversationMember.updateOne(
      { conversationId: conversation._id, userId: resolvedReceiverId },
      { $inc: { unreadCount: 1 } },
    ),
  ]);

  return {
    message: messagePayload,
    conversation,
    deduped: false,
    isNewConversation,
    resolvedReceiverId,
  };
};

export const markConversationSeen = async ({ userId, conversationId }) => {
  const latestMessage = await Message.findOne({ conversationId })
    .sort({ createdAt: -1, _id: -1 })
    .select("_id");

  if (!latestMessage) return null;

  return markSeen({ userId, conversationId, messageId: latestMessage._id });
};

export const markConversationDelivered = async ({ userId, conversationId }) => {
  const latestMessage = await Message.findOne({ conversationId })
    .sort({ createdAt: -1, _id: -1 })
    .select("_id");

  if (!latestMessage) return null;

  return markDelivered({ userId, conversationId, messageId: latestMessage._id });
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

  if (!member) throw new Error("ConversationMember not found");

  if (
    !member.lastSeenMessageId ||
    isNewer(messageId, member.lastSeenMessageId)
  ) {
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

    await ConversationMember.updateOne({ _id: member._id }, { $set: update });

    const otherMember = await ConversationMember.findOne({
      conversationId: conversationId,
      userId: { $ne: userId },
    }).select("userId");
    
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
