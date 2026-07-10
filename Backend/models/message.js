import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    clientMessageId: {
      type: String,
      required: true,
      unique: true
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "audio", "video", "file"],
      default: "text",
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
