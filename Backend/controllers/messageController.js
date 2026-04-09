import {
    getConversationTimelineService,
    getMessagesService,
} from "../services/messageService.js";

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { cursor, limit = 20 } = req.query;

        const result = await getMessagesService(conversationId, {
            cursor,
            limit: Number(limit),
        });

        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Failed to fetch messages",
        });
    }
};

export const getConversationTimeline = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { cursor, limit = 20 } = req.query;

        const result = await getConversationTimelineService(conversationId, {
            cursor,
            limit: Number(limit),
        });

        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Failed to fetch conversation timeline",
        });
    }
};
