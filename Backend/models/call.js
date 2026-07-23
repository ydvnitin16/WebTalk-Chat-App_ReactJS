import mongoose from "mongoose";
const callSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["audio", "video"],
      default: "audio",
    },
    status: {
      type: String,
      enum: [
        "ringing",
        "missed",
        "rejected",
        "busy",
        "connected",
        "completed",
        "cancelled",
      ],
      default: "ringing",
    },
    startedAt: {
      type: Date,
      default: new Date(),
    },
    endedAt: {
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: true },
);

const Call = mongoose.model("Call", callSchema);

export default Call;
