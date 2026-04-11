import Conversation from "../models/conversation.js";

export const getUserConversationsService = async (userId) => {
    try {
        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate("participants", "_id name avatar username isOnline lastSeen")
            .populate("lastMessage")
            .sort({ lastMessage: -1 });
            
        return conversations;
    } catch (error) {
        throw new Error("Failed to fetch conversations");
    }
};
