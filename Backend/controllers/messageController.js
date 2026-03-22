import { getMessagesService } from "../services/messageService.js";

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await getMessagesService(conversationId);
        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Failed to fetch messages",
        });
    }
};
