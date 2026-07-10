import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    participantKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastActivity: {
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: true },
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
