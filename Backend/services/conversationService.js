import Conversation from "../models/conversation.js";

export const getUserConversationsService = async (userId) => {
    try {
        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate({
                path: "participants",
                select: "_id name username email avatar isOnline lastSeen", // adjust fields based on your User model
            })
            .populate({
                path: "lastMessage",
                select: "text sender createdAt",
            })
            .sort({ updatedAt: -1 });

        return conversations;
    } catch (error) {
        throw new Error("Failed to fetch conversations");
    }
};
