import mongoose from "mongoose";
import Conversation from "../models/conversation.js";
import ConversationMember from "../models/conversationMember.js";
import Message from "../models/message.js";
import Call from "../models/call.js";
import { isUserOnline } from "../utils/presenceStore.js";

// Get all the membersIds of conversation's with
export const getConversationMembersIds = async (userId) => {
  const myConversations = await Conversation.find({
    participants: { $in: [userId] },
  }).lean();

  const conversationMembersIds = myConversations.map((c) =>
    c.participants.find((p) => p.toString() !== userId),
  );
  return conversationMembersIds;
};

// Get all the conversations of a user
export const getConversationsService = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "name username bio avatar lastSeen")
    .populate("lastMessageId")
    .lean();

  if (conversations.length === 0) return [];

  const conversationIds = conversations.map((c) => c._id);
  const members = await ConversationMember.find({
    conversationId: { $in: conversationIds },
  }).lean();

  const memberMap = new Map();
  for (const m of members) {
    memberMap.set(`${m.conversationId}_${m.userId}`, m);
  }

  const result = conversations.map((convo) => {
    const otherUser = convo.participants.find(
      (p) => p._id.toString() !== userId.toString(),
    );

    const myMember = memberMap.get(`${convo._id}_${userId}`);
    const otherMember = memberMap.get(`${convo._id}_${otherUser._id}`);

    return {
      conversationId: convo._id,
      otherUser: {
        _id: otherUser._id,
        name: otherUser.name,
        username: otherUser.username,
        bio: otherUser.bio,
        avatar: otherUser.avatar,
        isOnline: isUserOnline(otherUser._id),
        lastSeen: otherUser.lastSeen,
      },
      lastMessage: convo.lastMessageId,
      lastActivity: convo.lastActivity,
      unreadCount: myMember?.unreadCount ?? 0,
      myLastSeenMessageId: myMember?.lastSeenMessageId ?? null,
      otherLastSeenMessageId: otherMember?.lastSeenMessageId ?? null,
      otherLastDeliveredMessageId: otherMember?.lastDeliveredMessageId ?? null,
    };
  });

  return result;
};

export const getMessagesService = async ({
  conversationId,
  userId,
  cursor,
  limit,
}) => {
  // Verify is he part of that conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).lean();

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  const query = { conversationId };

  if (cursor) {
    if (!mongoose.Types.ObjectId.isValid(cursor)) {
      throw new Error("Invalid cursor");
    }
    query._id = { $lt: cursor }; // older than the last message the client already has
  }

  const messages = await Message.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;

  return {
    messages: page.reverse(),
    nextCursor: hasMore ? page[page.length - 1]._id : null,
    hasMore,
  };
};

export const getCallsService = async ({ userId, cursor, limit }) => {
  const query = {
    $or: [{ callerId: userId }, { receiverId: userId }], // whether sender or receiver
  };

  if (cursor) {
    if (!mongoose.Types.ObjectId.isValid(cursor)) {
      throw new Error("Invalid cursor");
    }
    query._id = { $lt: cursor };
  }

  const calls = await Call.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate("callerId", "name username avatar")
    .populate("receiverId", "name username avatar")
    .lean();

  const hasMore = calls.length > limit;
  const page = hasMore ? calls.slice(0, limit) : calls;

  const shaped = page.map((call) => {
    const wasIncoming = call.receiverId._id.toString() === userId.toString();
    const otherUser = wasIncoming ? call.callerId : call.receiverId;

    return {
      _id: call._id,
      conversationId: call.conversationId,
      type: call.type,
      status: call.status,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      wasIncoming,
      otherUser,
    };
  });

  return {
    calls: shaped,
    nextCursor: hasMore ? page[page.length - 1]._id : null,
    hasMore,
  };
};

export const getConversationTimelineService = async (
  conversationId,
  { cursor, limit = 20 },
) => {
  if (!conversationId) throw new Error("Conversation ID is required");

  // cursor is now an ObjectId string, not a date
  const idFilter = cursor
    ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } }
    : {};

  const messageQuery = { conversationId: conversationId, ...idFilter };
  const callQuery = { conversationId: conversationId, ...idFilter };

  // fetch limit + 1 from each to correctly determine hasMore
  const fetchLimit = limit + 1;

  const [messages, calls] = await Promise.all([
    Message.find(messageQuery)
      .sort({ _id: -1 })
      .limit(fetchLimit)
      .lean(),
    Call.find(callQuery)
      .sort({ _id: -1 })
      .limit(fetchLimit)
      .lean(),
  ]);

  // merge and sort descending by _id (chronological, collision-proof)
  const merged = [
    ...messages.map((m) => ({
      ...m,
      itemType: "message",
      _id: m._id,
      createdAt: m.createdAt,
    })),
    ...calls.map((c) => ({
      ...c,
      itemType: "call",
      _id: c._id,
      createdAt: c.createdAt,
      data: c,
    })),
  ].sort((a, b) => (a._id < b._id ? 1 : -1)); // descending

  // take only limit items from merged
  const hasMore = merged.length > limit;
  const sliced = merged.slice(0, limit);

  // reverse to ascending for frontend rendering (oldest at top)
  const timeline = sliced.reverse();

  // next cursor is the oldest item's _id (first item after reverse)
  const nextCursor =
    hasMore && timeline.length > 0 ? timeline[0]._id.toString() : null;
  
  return {
    timeline,
    nextCursor,
    hasMore,
  };
};
