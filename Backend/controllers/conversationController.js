import { getUserConversationsService } from "../services/conversationService.js";

export const getUserConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await getUserConversationsService(userId);
        console.log(conversations)
        res.status(200).json({
            success: true,
            conversations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
};
