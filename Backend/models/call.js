import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        caller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["audio", "video"],
            default: "audio",
        },

        status: {
            type: String,
            enum: ["missed", "rejected", "connected", "completed", "cancelled"],
            default: "missed",
        },

        startedAt: Date,
        endedAt: Date,
    },
    { timestamps: true },
);

const Call = mongoose.model("Call", callSchema);

export default Call;
