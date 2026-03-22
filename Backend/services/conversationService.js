import Conversation from "../models/conversation.js";

export const getUserConversationsService = async (userId) => {
    try {
        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate("participants")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });
            
        return conversations;
    } catch (error) {
        throw new Error("Failed to fetch conversations");
    }
};
