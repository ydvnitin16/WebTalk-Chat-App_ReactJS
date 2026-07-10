import mongoose from "mongoose";

const conversationMemberSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    lastSeenMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastDeliveredMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
    { timestamps: true },
);

conversationMemberSchema.index(
    { conversationId: 1, userId: 1 },
    { unique: true },
);

const ConversationMember = mongoose.model(
  "ConversationMember",
  conversationMemberSchema,
);

export default ConversationMember;
